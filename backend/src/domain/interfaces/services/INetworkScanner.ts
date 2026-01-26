import { IpAddress } from '../../value-objects/IpAddress.js';
import { PortRange } from '../../value-objects/PortRange.js';

/**
 * INetworkScanner interface - abstracts network host discovery.
 * Follows Strategy Pattern - multiple implementations possible.
 */
export interface INetworkScanner {
    /**
     * Discover active hosts in a network range.
     * @param networkRange - CIDR notation (e.g., "192.168.1.0/24") or range
     * @returns Array of discovered hosts
     */
    discoverHosts(networkRange: string): Promise<DiscoveredHost[]>;

    /**
     * Check if a specific host is online.
     */
    isHostOnline(ip: IpAddress): Promise<boolean>;

    /**
     * Get scanner capabilities
     */
    getCapabilities(): ScannerCapabilities;
}

export interface DiscoveredHost {
    ip: IpAddress;
    hostname: string | null;
    macAddress: string | null;
    vendor: string | null;
    responseTimeMs: number;
}

export interface ScannerCapabilities {
    osDetection: boolean;
    serviceDetection: boolean;
    stealthScan: boolean;
    arpScan: boolean;
    macAddressResolution: boolean;
}
