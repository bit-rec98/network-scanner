/**
 * NetworkScan entity representing a scanning session.
 */
export interface NetworkScanProps {
    id: string;
    userId: string;
    networkRange: string;
    scanType: ScanType;
    status: ScanStatus;
    startedAt: Date | null;
    completedAt: Date | null;
    devicesFound: number;
    createdAt: Date;
}

export enum ScanType {
    QUICK = 'quick',
    DEEP = 'deep',
    PORT = 'port',
}

export enum ScanStatus {
    PENDING = 'pending',
    RUNNING = 'running',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

export class NetworkScan {
    private constructor(private props: NetworkScanProps) { }

    static create(props: NetworkScanProps): NetworkScan {
        return new NetworkScan(props);
    }

    static createNew(userId: string, networkRange: string, scanType: ScanType): NetworkScan {
        return new NetworkScan({
            id: '',
            userId,
            networkRange,
            scanType,
            status: ScanStatus.PENDING,
            startedAt: null,
            completedAt: null,
            devicesFound: 0,
            createdAt: new Date(),
        });
    }

    get id(): string {
        return this.props.id;
    }

    get userId(): string {
        return this.props.userId;
    }

    get networkRange(): string {
        return this.props.networkRange;
    }

    get scanType(): ScanType {
        return this.props.scanType;
    }

    get status(): ScanStatus {
        return this.props.status;
    }

    get startedAt(): Date | null {
        return this.props.startedAt;
    }

    get completedAt(): Date | null {
        return this.props.completedAt;
    }

    get devicesFound(): number {
        return this.props.devicesFound;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    start(): void {
        if (this.props.status !== ScanStatus.PENDING) {
            throw new Error('Can only start a pending scan');
        }
        this.props.status = ScanStatus.RUNNING;
        this.props.startedAt = new Date();
    }

    complete(devicesFound: number): void {
        if (this.props.status !== ScanStatus.RUNNING) {
            throw new Error('Can only complete a running scan');
        }
        this.props.status = ScanStatus.COMPLETED;
        this.props.completedAt = new Date();
        this.props.devicesFound = devicesFound;
    }

    fail(): void {
        this.props.status = ScanStatus.FAILED;
        this.props.completedAt = new Date();
    }

    incrementDevicesFound(): void {
        this.props.devicesFound++;
    }

    isRunning(): boolean {
        return this.props.status === ScanStatus.RUNNING;
    }

    isCompleted(): boolean {
        return this.props.status === ScanStatus.COMPLETED;
    }

    getDuration(): number | null {
        if (!this.props.startedAt) return null;
        const startTime = typeof this.props.startedAt === 'string'
            ? new Date(this.props.startedAt).getTime()
            : this.props.startedAt.getTime();
        const endDate = this.props.completedAt ?? new Date();
        const endTime = typeof endDate === 'string'
            ? new Date(endDate).getTime()
            : endDate.getTime();
        return endTime - startTime;
    }

    toJSON(): Record<string, unknown> {
        const toISOSafe = (date: Date | string | null): string | null => {
            if (!date) return null;
            if (typeof date === 'string') return date;
            return date.toISOString();
        };

        return {
            id: this.props.id,
            userId: this.props.userId,
            networkRange: this.props.networkRange,
            scanType: this.props.scanType,
            status: this.props.status,
            startedAt: toISOSafe(this.props.startedAt as Date | string | null),
            completedAt: toISOSafe(this.props.completedAt as Date | string | null),
            devicesFound: this.props.devicesFound,
            createdAt: toISOSafe(this.props.createdAt as Date | string),
            durationMs: this.getDuration(),
        };
    }
}
