import { NetworkScan, ScanStatus } from '../../entities/NetworkScan.js';

/**
 * IScanRepository interface - abstracts scan data persistence.
 */
export interface IScanRepository {
    /**
     * Find a scan by its unique ID
     */
    findById(id: string): Promise<NetworkScan | null>;

    /**
     * Find all scans by user ID with pagination
     */
    findByUserId(userId: string, limit?: number, offset?: number): Promise<NetworkScan[]>;

    /**
     * Find scans by status
     */
    findByStatus(status: ScanStatus): Promise<NetworkScan[]>;

    /**
     * Find the most recent scan for a user
     */
    findLatestByUserId(userId: string): Promise<NetworkScan | null>;

    /**
     * Persist a new scan or update an existing one
     */
    save(scan: NetworkScan): Promise<NetworkScan>;

    /**
     * Update an existing scan
     */
    update(scan: NetworkScan): Promise<NetworkScan>;

    /**
     * Delete a scan and all associated data
     */
    delete(id: string): Promise<void>;

    /**
     * Count total scans for a user
     */
    countByUserId(userId: string): Promise<number>;

    /**
     * Get scan statistics for a user
     */
    getStats(userId: string): Promise<ScanStats>;
}

export interface ScanStats {
    totalScans: number;
    completedScans: number;
    totalDevicesFound: number;
    lastScanDate: Date | null;
}
