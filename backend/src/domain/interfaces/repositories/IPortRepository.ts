import { Port } from '../../entities/Port.js';

/**
 * IPortRepository interface - abstracts port data persistence.
 */
export interface IPortRepository {
    /**
     * Find a port by its unique ID
     */
    findById(id: string): Promise<Port | null>;

    /**
     * Find all ports for a specific device
     */
    findByDeviceId(deviceId: string): Promise<Port[]>;

    /**
     * Find open ports for a specific device
     */
    findOpenByDeviceId(deviceId: string): Promise<Port[]>;

    /**
     * Persist a new port or update an existing one
     */
    save(port: Port): Promise<Port>;

    /**
     * Save multiple ports at once (batch insert)
     */
    saveMany(ports: Port[]): Promise<Port[]>;

    /**
     * Delete a port by its ID
     */
    delete(id: string): Promise<void>;

    /**
     * Delete all ports for a specific device
     */
    deleteByDeviceId(deviceId: string): Promise<void>;
}
