import ping from 'ping';
import { exec } from 'child_process';
import { promisify } from 'util';
import dns from 'dns';
import os from 'os';

import {
    INetworkScanner,
    DiscoveredHost,
    ScannerCapabilities,
} from '../../domain/interfaces/services/INetworkScanner.js';
import { IpAddress } from '../../domain/value-objects/IpAddress.js';
import { logger } from '../../shared/utils/logger.js';
import { config } from '../../config/index.js';

const execAsync = promisify(exec);
const dnsReverse = promisify(dns.reverse);

/**
 * PingScanner - Pure Node.js implementation for host discovery.
 * Uses ICMP ping to discover hosts on the network.
 * Implements INetworkScanner interface following Strategy Pattern.
 */
export class PingScanner implements INetworkScanner {
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
     * Discover active hosts in a network range using ping.
     * @param networkRange - CIDR notation (e.g., "192.168.1.0/24") or IP range
     */
    async discoverHosts(networkRange: string): Promise<DiscoveredHost[]> {
        const ips = this.parseNetworkRange(networkRange);
        logger.info(`Starting ping scan of ${ips.length} hosts in ${networkRange}`);

        const discoveredHosts: DiscoveredHost[] = [];
        const chunks = this.chunkArray(ips, this.concurrency);

        for (const chunk of chunks) {
            const results = await Promise.all(
                chunk.map((ip) => this.pingHost(ip))
            );

            for (const result of results) {
                if (result) {
                    discoveredHosts.push(result);
                    logger.debug(`Host discovered: ${result.ip.value}`);
                }
            }
        }

        logger.info(`Ping scan completed: ${discoveredHosts.length} hosts found`);
        return discoveredHosts;
    }

    /**
     * Check if a specific host is online using ping.
     */
    async isHostOnline(ip: IpAddress): Promise<boolean> {
        const result = await this.pingHost(ip.value);
        return result !== null;
    }

    /**
     * Get scanner capabilities.
     */
    getCapabilities(): ScannerCapabilities {
        return {
            osDetection: false,
            serviceDetection: false,
            stealthScan: false,
            arpScan: false,
            macAddressResolution: os.platform() === 'win32', // ARP table available on Windows
        };
    }

    /**
     * Ping a single host and return discovery info if alive.
     */
    private async pingHost(ip: string): Promise<DiscoveredHost | null> {
        try {
            const startTime = Date.now();
            const result = await ping.promise.probe(ip, {
                timeout: Math.ceil(this.timeoutMs / 1000),
                min_reply: 1,
            });

            if (!result.alive) {
                return null;
            }

            const responseTimeMs = Date.now() - startTime;
            const hostname = await this.resolveHostname(ip);
            const macAddress = await this.getMacAddress(ip);

            return {
                ip: IpAddress.create(ip),
                hostname,
                macAddress,
                vendor: null, // Would need OUI database lookup
                responseTimeMs,
            };
        } catch (error) {
            logger.debug(`Ping failed for ${ip}:`, error);
            return null;
        }
    }

    /**
     * Attempt reverse DNS lookup for hostname.
     */
    private async resolveHostname(ip: string): Promise<string | null> {
        try {
            const hostnames = await dnsReverse(ip);
            return hostnames[0] || null;
        } catch {
            return null;
        }
    }

    /**
     * Get MAC address from ARP table (Windows-specific).
     */
    private async getMacAddress(ip: string): Promise<string | null> {
        if (os.platform() !== 'win32') {
            return null;
        }

        try {
            const { stdout } = await execAsync(`arp -a ${ip}`);
            const macMatch = stdout.match(/([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}/);
            return macMatch ? macMatch[0].toUpperCase().replace(/-/g, ':') : null;
        } catch {
            return null;
        }
    }

    /**
     * Parse network range (CIDR notation) into array of IP addresses.
     */
    private parseNetworkRange(range: string): string[] {
        const ips: string[] = [];

        // Handle CIDR notation (e.g., "192.168.1.0/24")
        if (range.includes('/')) {
            const [networkAddr, prefixStr] = range.split('/');
            const prefix = parseInt(prefixStr, 10);

            if (prefix < 0 || prefix > 32) {
                throw new Error(`Invalid CIDR prefix: ${prefix}`);
            }

            const networkParts = networkAddr.split('.').map(Number);
            const networkInt =
                (networkParts[0] << 24) |
                (networkParts[1] << 16) |
                (networkParts[2] << 8) |
                networkParts[3];

            const hostBits = 32 - prefix;
            const numHosts = Math.pow(2, hostBits);

            // Skip network address and broadcast address
            for (let i = 1; i < numHosts - 1; i++) {
                const ipInt = networkInt + i;
                const ip = [
                    (ipInt >>> 24) & 255,
                    (ipInt >>> 16) & 255,
                    (ipInt >>> 8) & 255,
                    ipInt & 255,
                ].join('.');
                ips.push(ip);
            }
        }
        // Handle range notation (e.g., "192.168.1.1-254")
        else if (range.includes('-')) {
            const parts = range.split('.');
            const lastPart = parts[3];
            const [start, end] = lastPart.split('-').map(Number);
            const baseIp = parts.slice(0, 3).join('.');

            for (let i = start; i <= end; i++) {
                ips.push(`${baseIp}.${i}`);
            }
        }
        // Single IP
        else {
            ips.push(range);
        }

        return ips;
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
