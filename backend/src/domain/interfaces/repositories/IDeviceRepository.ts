import { Device } from '../../entities/Device.js';
import { IpAddress } from '../../value-objects/IpAddress.js';

/**
 * IDeviceRepository interface - abstracts device data persistence.
 */
export interface IDeviceRepository {
    /**
     * Find a device by its unique ID
     */
    findById(id: string): Promise<Device | null>;

    /**
     * Find a device by IP address within a specific scan
     */
    findByIpAndScanId(ip: IpAddress, scanId: string): Promise<Device | null>;

    /**
     * Find all devices discovered in a specific scan
     */
    findByScanId(scanId: string): Promise<Device[]>;

    /**
     * Find all online devices from the most recent scan
     */
    findOnlineDevices(): Promise<Device[]>;

    /**
     * Persist a new device or update an existing one
     */
    save(device: Device): Promise<Device>;

    /**
     * Save multiple devices at once (batch insert)
     */
    saveMany(devices: Device[]): Promise<Device[]>;

    /**
     * Update device details (custom name, notes, etc.)
     */
    update(device: Device): Promise<Device>;

    /**
     * Delete a device by its ID
     */
    delete(id: string): Promise<void>;

    /**
     * Delete all devices from a specific scan
     */
    deleteByScanId(scanId: string): Promise<void>;

    /**
     * Count devices discovered in a specific scan
     */
    countByScanId(scanId: string): Promise<number>;
}
