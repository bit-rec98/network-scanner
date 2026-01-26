import { v4 as uuidv4 } from 'uuid';
import { IPortRepository } from '../../domain/interfaces/repositories/IPortRepository.js';
import { Port, PortProtocol, PortState } from '../../domain/entities/Port.js';
import { db } from '../database/MySQLConnection.js';

/**
 * MySQLPortRepository - MySQL implementation of IPortRepository.
 */
export class MySQLPortRepository implements IPortRepository {
    private readonly tableName = 'open_ports';

    async findById(id: string): Promise<Port | null> {
        const row = await db(this.tableName)
            .where('id', id)
            .first();

        return row ? this.mapToEntity(row) : null;
    }

    async findByDeviceId(deviceId: string): Promise<Port[]> {
        const rows = await db(this.tableName)
            .where('device_id', deviceId)
            .orderBy('port_number');

        return rows.map((row) => this.mapToEntity(row));
    }

    async findOpenByDeviceId(deviceId: string): Promise<Port[]> {
        const rows = await db(this.tableName)
            .where('device_id', deviceId)
            .where('state', PortState.OPEN)
            .orderBy('port_number');

        return rows.map((row) => this.mapToEntity(row));
    }

    async save(port: Port): Promise<Port> {
        const id = port.id || uuidv4();
        const data = this.mapToRow(port, id);

        await db(this.tableName)
            .insert(data)
            .onConflict(['device_id', 'port_number', 'protocol'])
            .merge(['state', 'service_name', 'version']);

        return Port.create({
            ...port.toJSON(),
            id,
        } as Port['props']);
    }

    async saveMany(ports: Port[]): Promise<Port[]> {
        if (ports.length === 0) return [];

        const dataRows = ports.map((port) => {
            const id = port.id || uuidv4();
            return this.mapToRow(port, id);
        });

        // Use batch insert with conflict handling
        for (const data of dataRows) {
            await db(this.tableName)
                .insert(data)
                .onConflict(['device_id', 'port_number', 'protocol'])
                .merge(['state', 'service_name', 'version']);
        }

        return ports.map((port, index) =>
            Port.create({
                ...port.toJSON(),
                id: dataRows[index].id as string,
            } as Port['props'])
        );
    }

    async delete(id: string): Promise<void> {
        await db(this.tableName)
            .where('id', id)
            .delete();
    }

    async deleteByDeviceId(deviceId: string): Promise<void> {
        await db(this.tableName)
            .where('device_id', deviceId)
            .delete();
    }

    private mapToRow(port: Port, id: string): Record<string, unknown> {
        return {
            id,
            device_id: port.deviceId,
            port_number: port.portNumber,
            protocol: port.protocol,
            service_name: port.serviceName,
            version: port.version,
            state: port.state,
            created_at: port.createdAt,
        };
    }

    private mapToEntity(row: Record<string, unknown>): Port {
        return Port.create({
            id: row.id as string,
            deviceId: row.device_id as string,
            portNumber: row.port_number as number,
            protocol: row.protocol as PortProtocol,
            serviceName: row.service_name as string | null,
            version: row.version as string | null,
            state: row.state as PortState,
            createdAt: new Date(row.created_at as string),
        });
    }
}
