import { v4 as uuidv4 } from 'uuid';
import { IScanRepository, ScanStats } from '../../domain/interfaces/repositories/IScanRepository.js';
import { NetworkScan, ScanType, ScanStatus } from '../../domain/entities/NetworkScan.js';
import { db } from '../database/MySQLConnection.js';

/**
 * MySQLScanRepository - MySQL implementation of IScanRepository.
 */
export class MySQLScanRepository implements IScanRepository {
    private readonly tableName = 'network_scans';

    async findById(id: string): Promise<NetworkScan | null> {
        const row = await db(this.tableName)
            .where('id', id)
            .first();

        return row ? this.mapToEntity(row) : null;
    }

    async findByUserId(userId: string, limit = 20, offset = 0): Promise<NetworkScan[]> {
        const rows = await db(this.tableName)
            .where('user_id', userId)
            .orderBy('created_at', 'desc')
            .limit(limit)
            .offset(offset);

        return rows.map((row) => this.mapToEntity(row));
    }

    async findByStatus(status: ScanStatus): Promise<NetworkScan[]> {
        const rows = await db(this.tableName)
            .where('status', status)
            .orderBy('created_at', 'desc');

        return rows.map((row) => this.mapToEntity(row));
    }

    async findLatestByUserId(userId: string): Promise<NetworkScan | null> {
        const row = await db(this.tableName)
            .where('user_id', userId)
            .orderBy('created_at', 'desc')
            .first();

        return row ? this.mapToEntity(row) : null;
    }

    async save(scan: NetworkScan): Promise<NetworkScan> {
        const id = scan.id || uuidv4();
        const data = {
            id,
            user_id: scan.userId,
            network_range: scan.networkRange,
            scan_type: scan.scanType,
            status: scan.status,
            started_at: scan.startedAt,
            completed_at: scan.completedAt,
            devices_found: scan.devicesFound,
            created_at: scan.createdAt,
        };

        await db(this.tableName).insert(data);

        return NetworkScan.create({
            id,
            userId: scan.userId,
            networkRange: scan.networkRange,
            scanType: scan.scanType,
            status: scan.status,
            startedAt: scan.startedAt,
            completedAt: scan.completedAt,
            devicesFound: scan.devicesFound,
            createdAt: scan.createdAt,
        });
    }

    async update(scan: NetworkScan): Promise<NetworkScan> {
        await db(this.tableName)
            .where('id', scan.id)
            .update({
                status: scan.status,
                started_at: scan.startedAt,
                completed_at: scan.completedAt,
                devices_found: scan.devicesFound,
            });

        return scan;
    }

    async delete(id: string): Promise<void> {
        await db(this.tableName)
            .where('id', id)
            .delete();
    }

    async countByUserId(userId: string): Promise<number> {
        const result = await db(this.tableName)
            .where('user_id', userId)
            .count('* as count')
            .first();

        return (result?.count as number) || 0;
    }

    async getStats(userId: string): Promise<ScanStats> {
        const [totalResult, completedResult, devicesResult, latestResult] = await Promise.all([
            db(this.tableName)
                .where('user_id', userId)
                .count('* as count')
                .first(),
            db(this.tableName)
                .where('user_id', userId)
                .where('status', ScanStatus.COMPLETED)
                .count('* as count')
                .first(),
            db(this.tableName)
                .where('user_id', userId)
                .sum('devices_found as total')
                .first(),
            db(this.tableName)
                .where('user_id', userId)
                .where('status', ScanStatus.COMPLETED)
                .orderBy('completed_at', 'desc')
                .first(),
        ]);

        return {
            totalScans: (totalResult?.count as number) || 0,
            completedScans: (completedResult?.count as number) || 0,
            totalDevicesFound: (devicesResult?.total as number) || 0,
            lastScanDate: latestResult?.completed_at
                ? new Date(latestResult.completed_at as string)
                : null,
        };
    }

    private mapToEntity(row: Record<string, unknown>): NetworkScan {
        return NetworkScan.create({
            id: row.id as string,
            userId: row.user_id as string,
            networkRange: row.network_range as string,
            scanType: row.scan_type as ScanType,
            status: row.status as ScanStatus,
            startedAt: row.started_at ? new Date(row.started_at as string) : null,
            completedAt: row.completed_at ? new Date(row.completed_at as string) : null,
            devicesFound: row.devices_found as number,
            createdAt: new Date(row.created_at as string),
        });
    }
}
