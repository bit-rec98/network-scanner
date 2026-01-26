import { IpAddress } from '../value-objects/IpAddress.js';
import { MacAddress } from '../value-objects/MacAddress.js';

/**
 * Device entity representing a discovered device on the network.
 */
export interface DeviceProps {
    id: string;
    scanId: string;
    ipAddress: IpAddress;
    macAddress: MacAddress | null;
    hostname: string | null;
    vendor: string | null;
    deviceType: string | null;
    isOnline: boolean;
    lastSeen: Date | null;
    customName: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export class Device {
    private constructor(private props: DeviceProps) { }

    static create(props: DeviceProps): Device {
        return new Device(props);
    }

    static createFromScan(
        scanId: string,
        ipAddress: IpAddress,
        macAddress: MacAddress | null = null,
        hostname: string | null = null
    ): Device {
        const now = new Date();
        return new Device({
            id: '',
            scanId,
            ipAddress,
            macAddress,
            hostname,
            vendor: null,
            deviceType: null,
            isOnline: true,
            lastSeen: now,
            customName: null,
            notes: null,
            createdAt: now,
            updatedAt: now,
        });
    }

    get id(): string {
        return this.props.id;
    }

    get scanId(): string {
        return this.props.scanId;
    }

    get ipAddress(): IpAddress {
        return this.props.ipAddress;
    }

    get macAddress(): MacAddress | null {
        return this.props.macAddress;
    }

    get hostname(): string | null {
        return this.props.hostname;
    }

    get vendor(): string | null {
        return this.props.vendor;
    }

    get deviceType(): string | null {
        return this.props.deviceType;
    }

    get isOnline(): boolean {
        return this.props.isOnline;
    }

    get lastSeen(): Date | null {
        return this.props.lastSeen;
    }

    get customName(): string | null {
        return this.props.customName;
    }

    get notes(): string | null {
        return this.props.notes;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    updateCustomName(name: string): void {
        this.props.customName = name;
        this.props.updatedAt = new Date();
    }

    updateNotes(notes: string): void {
        this.props.notes = notes;
        this.props.updatedAt = new Date();
    }

    markOffline(): void {
        this.props.isOnline = false;
        this.props.updatedAt = new Date();
    }

    markOnline(): void {
        this.props.isOnline = true;
        this.props.lastSeen = new Date();
        this.props.updatedAt = new Date();
    }

    setVendor(vendor: string): void {
        this.props.vendor = vendor;
        this.props.updatedAt = new Date();
    }

    toJSON(): Record<string, unknown> {
        const toISOSafe = (date: Date | string | null): string | null => {
            if (!date) return null;
            if (typeof date === 'string') return date;
            return date.toISOString();
        };

        return {
            id: this.props.id,
            scanId: this.props.scanId,
            ipAddress: this.props.ipAddress.value,
            macAddress: this.props.macAddress?.value ?? null,
            hostname: this.props.hostname,
            vendor: this.props.vendor,
            deviceType: this.props.deviceType,
            isOnline: this.props.isOnline,
            lastSeen: toISOSafe(this.props.lastSeen as Date | string | null),
            customName: this.props.customName,
            notes: this.props.notes,
            createdAt: toISOSafe(this.props.createdAt as Date | string),
            updatedAt: toISOSafe(this.props.updatedAt as Date | string),
        };
    }
}
