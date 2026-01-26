import net from 'net';
import {
    IPortScanner,
    PortScanResult,
} from '../../domain/interfaces/services/IPortScanner.js';
import { PortProtocol } from '../../domain/entities/Port.js';
import { IpAddress } from '../../domain/value-objects/IpAddress.js';
import { PortRange } from '../../domain/value-objects/PortRange.js';
import { logger } from '../../shared/utils/logger.js';
import { config } from '../../config/index.js';

/**
 * TcpPortScanner - Pure Node.js TCP port scanner.
 * Uses TCP connect scan to discover open ports.
 */
export class TcpPortScanner implements IPortScanner {
    private readonly timeoutMs: number;
    private readonly concurrency: number;

    constructor(
        timeoutMs: number = config.scanner.timeoutMs,
        concurrency: number = config.scanner.concurrency
    ) {
        this.timeoutMs = timeoutMs;
        this.concurrency = concurrency;
    }

    /**
     * Scan ports on a target host.
     */
    async scanPorts(
        target: IpAddress,
        portRange: PortRange,
        protocol: PortProtocol = PortProtocol.TCP
    ): Promise<PortScanResult[]> {
        if (protocol === PortProtocol.UDP) {
            logger.warn('UDP scanning not supported in pure Node.js mode');
            return [];
        }

        const ports = portRange.toArray();
        logger.info(`Starting port scan on ${target.value}: ${portRange.toString()} (${ports.length} ports)`);

        const results: PortScanResult[] = [];
        const chunks = this.chunkArray(ports, this.concurrency);

        for (const chunk of chunks) {
            const chunkResults = await Promise.all(
                chunk.map((port) => this.scanPort(target.value, port))
            );

            for (const result of chunkResults) {
                if (result && result.state === 'open') {
                    results.push(result);
                    logger.debug(`Open port found: ${target.value}:${result.portNumber}`);
                }
            }
        }

        logger.info(`Port scan completed: ${results.length} open ports found`);
        return results;
    }

    /**
     * Scan common ports on a target host.
     */
    async scanCommonPorts(target: IpAddress): Promise<PortScanResult[]> {
        const commonPorts = [
            21, 22, 23, 25, 53, 80, 110, 111, 135, 139, 143, 443, 445,
            993, 995, 1723, 3306, 3389, 5432, 5900, 8080, 8443, 27017
        ];

        logger.info(`Starting common port scan on ${target.value} (${commonPorts.length} ports)`);

        const results: PortScanResult[] = [];
        const chunks = this.chunkArray(commonPorts, this.concurrency);

        for (const chunk of chunks) {
            const chunkResults = await Promise.all(
                chunk.map((port) => this.scanPort(target.value, port))
            );

            for (const result of chunkResults) {
                if (result && result.state === 'open') {
                    results.push(result);
                }
            }
        }

        return results;
    }

    /**
     * Check if a specific port is open.
     */
    async isPortOpen(
        target: IpAddress,
        port: number,
        protocol: PortProtocol = PortProtocol.TCP
    ): Promise<boolean> {
        if (protocol === PortProtocol.UDP) {
            return false; // UDP not supported
        }

        const result = await this.scanPort(target.value, port);
        return result?.state === 'open';
    }

    /**
     * Scan a single TCP port using connect scan.
     */
    private async scanPort(host: string, port: number): Promise<PortScanResult | null> {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const socket = new net.Socket();

            const cleanup = () => {
                socket.removeAllListeners();
                socket.destroy();
            };

            socket.setTimeout(this.timeoutMs);

            socket.on('connect', () => {
                const responseTimeMs = Date.now() - startTime;
                cleanup();
                resolve({
                    portNumber: port,
                    protocol: PortProtocol.TCP,
                    state: 'open',
                    serviceName: this.getServiceName(port),
                    version: null,
                    responseTimeMs,
                });
            });

            socket.on('timeout', () => {
                cleanup();
                resolve({
                    portNumber: port,
                    protocol: PortProtocol.TCP,
                    state: 'filtered',
                    serviceName: null,
                    version: null,
                    responseTimeMs: this.timeoutMs,
                });
            });

            socket.on('error', (err: NodeJS.ErrnoException) => {
                cleanup();
                if (err.code === 'ECONNREFUSED') {
                    resolve({
                        portNumber: port,
                        protocol: PortProtocol.TCP,
                        state: 'closed',
                        serviceName: null,
                        version: null,
                        responseTimeMs: Date.now() - startTime,
                    });
                } else {
                    resolve(null);
                }
            });

            socket.connect(port, host);
        });
    }

    /**
     * Get service name for well-known ports.
     */
    private getServiceName(port: number): string | null {
        const services: Record<number, string> = {
            21: 'FTP',
            22: 'SSH',
            23: 'Telnet',
            25: 'SMTP',
            53: 'DNS',
            80: 'HTTP',
            110: 'POP3',
            111: 'RPC',
            135: 'MSRPC',
            139: 'NetBIOS',
            143: 'IMAP',
            443: 'HTTPS',
            445: 'SMB',
            993: 'IMAPS',
            995: 'POP3S',
            1433: 'MSSQL',
            1723: 'PPTP',
            3306: 'MySQL',
            3389: 'RDP',
            5432: 'PostgreSQL',
            5900: 'VNC',
            6379: 'Redis',
            8080: 'HTTP-Proxy',
            8443: 'HTTPS-Alt',
            27017: 'MongoDB',
        };
        return services[port] || null;
    }

    /**
     * Split array into chunks for parallel processing.
     */
    private chunkArray<T>(array: T[], size: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
}
