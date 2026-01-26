/**
 * PortRange value object for specifying port scan ranges.
 */
export class PortRange {
    private readonly _start: number;
    private readonly _end: number;

    private constructor(start: number, end: number) {
        this._start = start;
        this._end = end;
    }

    static create(start: number, end: number): PortRange {
        if (!PortRange.isValidPort(start) || !PortRange.isValidPort(end)) {
            throw new Error(`Invalid port range: ${start}-${end}. Ports must be between 1 and 65535.`);
        }
        if (start > end) {
            throw new Error(`Invalid port range: start (${start}) must be less than or equal to end (${end})`);
        }
        return new PortRange(start, end);
    }

    static single(port: number): PortRange {
        return PortRange.create(port, port);
    }

    static common(): PortRange {
        return PortRange.create(1, 1024);
    }

    static all(): PortRange {
        return PortRange.create(1, 65535);
    }

    static wellKnown(): PortRange {
        return PortRange.create(1, 1023);
    }

    private static isValidPort(port: number): boolean {
        return Number.isInteger(port) && port >= 1 && port <= 65535;
    }

    get start(): number {
        return this._start;
    }

    get end(): number {
        return this._end;
    }

    get size(): number {
        return this._end - this._start + 1;
    }

    includes(port: number): boolean {
        return port >= this._start && port <= this._end;
    }

    /**
     * Generate an array of all ports in this range.
     * Use with caution for large ranges!
     */
    toArray(): number[] {
        const ports: number[] = [];
        for (let port = this._start; port <= this._end; port++) {
            ports.push(port);
        }
        return ports;
    }

    /**
     * Get common ports within this range
     */
    getCommonPorts(): number[] {
        const commonPorts = [
            21, 22, 23, 25, 53, 80, 110, 143, 443, 445,
            993, 995, 3306, 3389, 5432, 5900, 6379, 8080, 8443, 27017
        ];
        return commonPorts.filter((port) => this.includes(port));
    }

    equals(other: PortRange): boolean {
        return this._start === other._start && this._end === other._end;
    }

    toString(): string {
        if (this._start === this._end) {
            return String(this._start);
        }
        return `${this._start}-${this._end}`;
    }

    toJSON(): { start: number; end: number } {
        return { start: this._start, end: this._end };
    }
}
