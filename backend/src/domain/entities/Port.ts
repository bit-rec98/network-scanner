/**
 * Port entity representing an open port on a device.
 */
export interface PortProps {
    id: string;
    deviceId: string;
    portNumber: number;
    protocol: PortProtocol;
    serviceName: string | null;
    version: string | null;
    state: PortState;
    createdAt: Date;
}

export enum PortProtocol {
    TCP = 'tcp',
    UDP = 'udp',
}

export enum PortState {
    OPEN = 'open',
    CLOSED = 'closed',
    FILTERED = 'filtered',
}

export class Port {
    private constructor(private readonly props: PortProps) { }

    static create(props: PortProps): Port {
        return new Port(props);
    }

    static createFromScan(
        deviceId: string,
        portNumber: number,
        protocol: PortProtocol,
        state: PortState = PortState.OPEN
    ): Port {
        return new Port({
            id: '',
            deviceId,
            portNumber,
            protocol,
            serviceName: null,
            version: null,
            state,
            createdAt: new Date(),
        });
    }

    get id(): string {
        return this.props.id;
    }

    get deviceId(): string {
        return this.props.deviceId;
    }

    get portNumber(): number {
        return this.props.portNumber;
    }

    get protocol(): PortProtocol {
        return this.props.protocol;
    }

    get serviceName(): string | null {
        return this.props.serviceName;
    }

    get version(): string | null {
        return this.props.version;
    }

    get state(): PortState {
        return this.props.state;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    isOpen(): boolean {
        return this.props.state === PortState.OPEN;
    }

    /**
     * Get a human-readable port description
     */
    getDescription(): string {
        const service = this.props.serviceName || this.getWellKnownService();
        return `${this.props.portNumber}/${this.props.protocol} (${service || 'unknown'})`;
    }

    private getWellKnownService(): string | null {
        const wellKnown: Record<number, string> = {
            21: 'FTP',
            22: 'SSH',
            23: 'Telnet',
            25: 'SMTP',
            53: 'DNS',
            80: 'HTTP',
            110: 'POP3',
            143: 'IMAP',
            443: 'HTTPS',
            445: 'SMB',
            993: 'IMAPS',
            995: 'POP3S',
            3306: 'MySQL',
            3389: 'RDP',
            5432: 'PostgreSQL',
            5900: 'VNC',
            6379: 'Redis',
            8080: 'HTTP-Alt',
            27017: 'MongoDB',
        };
        return wellKnown[this.props.portNumber] || null;
    }

    toJSON(): Record<string, unknown> {
        return {
            id: this.props.id,
            deviceId: this.props.deviceId,
            portNumber: this.props.portNumber,
            protocol: this.props.protocol,
            serviceName: this.props.serviceName || this.getWellKnownService(),
            version: this.props.version,
            state: this.props.state,
            createdAt: this.props.createdAt.toISOString(),
        };
    }
}
