import { v4 as uuidv4 } from 'uuid';
import { IDeviceRepository } from '../../domain/interfaces/repositories/IDeviceRepository.js';
import { Device } from '../../domain/entities/Device.js';
import { IpAddress } from '../../domain/value-objects/IpAddress.js';
import { MacAddress } from '../../domain/value-objects/MacAddress.js';
import { db } from '../database/MySQLConnection.js';

/**
 * MySQLDeviceRepository - MySQL implementation of IDeviceRepository.
 */
export class MySQLDeviceRepository implements IDeviceRepository {
    private readonly tableName = 'devices';

    async findById(id: string): Promise<Device | null> {
        const row = await db(this.tableName)
            .where('id', id)
            .first();

        return row ? this.mapToEntity(row) : null;
    }

    async findByIpAndScanId(ip: IpAddress, scanId: string): Promise<Device | null> {
        const row = await db(this.tableName)
            .where('ip_address', ip.value)
            .where('scan_id', scanId)
            .first();

        return row ? this.mapToEntity(row) : null;
    }

    async findByScanId(scanId: string): Promise<Device[]> {
        const rows = await db(this.tableName)
            .where('scan_id', scanId)
            .orderBy('ip_address');

        return rows.map((row) => this.mapToEntity(row));
    }

    async findOnlineDevices(): Promise<Device[]> {
        const rows = await db(this.tableName)
            .where('is_online', true)
            .orderBy('last_seen', 'desc');

        return rows.map((row) => this.mapToEntity(row));
    }

    async save(device: Device): Promise<Device> {
        const id = device.id || uuidv4();
        const data = this.mapToRow(device, id);

        await db(this.tableName).insert(data);

        return Device.create({
            id,
            scanId: device.scanId,
            ipAddress: device.ipAddress,
            macAddress: device.macAddress,
            hostname: device.hostname,
            vendor: device.vendor,
            deviceType: device.deviceType,
            isOnline: device.isOnline,
            lastSeen: device.lastSeen,
            customName: device.customName,
            notes: device.notes,
            createdAt: device.createdAt,
            updatedAt: device.updatedAt,
        });
    }

    async saveMany(devices: Device[]): Promise<Device[]> {
        if (devices.length === 0) return [];

        const dataRows = devices.map((device) => {
            const id = device.id || uuidv4();
            return this.mapToRow(device, id);
        });

        await db(this.tableName).insert(dataRows);

        return devices.map((device, index) =>
            Device.create({
                id: dataRows[index].id as string,
                scanId: device.scanId,
                ipAddress: device.ipAddress,
                macAddress: device.macAddress,
                hostname: device.hostname,
                vendor: device.vendor,
                deviceType: device.deviceType,
                isOnline: device.isOnline,
                lastSeen: device.lastSeen,
                customName: device.customName,
                notes: device.notes,
                createdAt: device.createdAt,
                updatedAt: device.updatedAt,
            })
        );
    }

    async update(device: Device): Promise<Device> {
        await db(this.tableName)
            .where('id', device.id)
            .update({
                hostname: device.hostname,
                vendor: device.vendor,
                device_type: device.deviceType,
                is_online: device.isOnline,
                last_seen: device.lastSeen,
                custom_name: device.customName,
                notes: device.notes,
                updated_at: new Date(),
            });

        return device;
    }

    async delete(id: string): Promise<void> {
        await db(this.tableName)
            .where('id', id)
            .delete();
    }

    async deleteByScanId(scanId: string): Promise<void> {
        await db(this.tableName)
            .where('scan_id', scanId)
            .delete();
    }

    async countByScanId(scanId: string): Promise<number> {
        const result = await db(this.tableName)
            .where('scan_id', scanId)
            .count('* as count')
            .first();

        return (result?.count as number) || 0;
    }

    private mapToRow(device: Device, id: string): Record<string, unknown> {
        return {
            id,
            scan_id: device.scanId,
            ip_address: device.ipAddress.value,
            mac_address: device.macAddress?.value ?? null,
            hostname: device.hostname,
            vendor: device.vendor,
            device_type: device.deviceType,
            is_online: device.isOnline,
            last_seen: device.lastSeen,
            custom_name: device.customName,
            notes: device.notes,
            created_at: device.createdAt,
            updated_at: device.updatedAt,
        };
    }

    private mapToEntity(row: Record<string, unknown>): Device {
        return Device.create({
            id: row.id as string,
            scanId: row.scan_id as string,
            ipAddress: IpAddress.create(row.ip_address as string),
            macAddress: row.mac_address
                ? MacAddress.create(row.mac_address as string)
                : null,
            hostname: row.hostname as string | null,
            vendor: row.vendor as string | null,
            deviceType: row.device_type as string | null,
            isOnline: Boolean(row.is_online),
            lastSeen: row.last_seen ? new Date(row.last_seen as string) : null,
            customName: row.custom_name as string | null,
            notes: row.notes as string | null,
            createdAt: new Date(row.created_at as string),
            updatedAt: new Date(row.updated_at as string),
        });
    }
}
