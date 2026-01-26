import { Port, PortProtocol } from '../../entities/Port.js';
import { IpAddress } from '../../value-objects/IpAddress.js';
import { PortRange } from '../../value-objects/PortRange.js';

/**
 * IPortScanner interface - abstracts port scanning functionality.
 */
export interface IPortScanner {
    /**
     * Scan ports on a target host.
     * @param target - Target IP address
     * @param portRange - Range of ports to scan
     * @param protocol - Protocol to scan (TCP/UDP)
     * @returns Array of discovered open ports
     */
    scanPorts(
        target: IpAddress,
        portRange: PortRange,
        protocol?: PortProtocol
    ): Promise<PortScanResult[]>;

    /**
     * Scan common ports on a target host.
     */
    scanCommonPorts(target: IpAddress): Promise<PortScanResult[]>;

    /**
     * Check if a specific port is open.
     */
    isPortOpen(target: IpAddress, port: number, protocol?: PortProtocol): Promise<boolean>;
}

export interface PortScanResult {
    portNumber: number;
    protocol: PortProtocol;
    state: 'open' | 'closed' | 'filtered';
    serviceName: string | null;
    version: string | null;
    responseTimeMs: number;
}
