/**
 * IpAddress value object - immutable and self-validating.
 * Follows the Value Object pattern from DDD.
 */
export class IpAddress {
    private readonly _value: string;

    private constructor(value: string) {
        this._value = value;
    }

    static create(value: string): IpAddress {
        if (!IpAddress.isValid(value)) {
            throw new Error(`Invalid IP address: ${value}`);
        }
        return new IpAddress(value);
    }

    static isValid(value: string): boolean {
        // IPv4 validation
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (ipv4Regex.test(value)) {
            const parts = value.split('.').map(Number);
            return parts.every((part) => part >= 0 && part <= 255);
        }

        // IPv6 validation (simplified)
        const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        if (ipv6Regex.test(value)) {
            return true;
        }

        // IPv6 compressed format
        if (value.includes('::')) {
            const parts = value.split('::');
            if (parts.length <= 2) {
                return true; // Simplified check
            }
        }

        return false;
    }

    get value(): string {
        return this._value;
    }

    isIPv4(): boolean {
        return this._value.includes('.');
    }

    isIPv6(): boolean {
        return this._value.includes(':');
    }

    isPrivate(): boolean {
        if (!this.isIPv4()) return false;

        const parts = this._value.split('.').map(Number);

        // 10.0.0.0/8
        if (parts[0] === 10) return true;

        // 172.16.0.0/12
        if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;

        // 192.168.0.0/16
        if (parts[0] === 192 && parts[1] === 168) return true;

        return false;
    }

    isLoopback(): boolean {
        if (this.isIPv4()) {
            return this._value.startsWith('127.');
        }
        return this._value === '::1';
    }

    equals(other: IpAddress): boolean {
        return this._value === other._value;
    }

    toString(): string {
        return this._value;
    }

    toJSON(): string {
        return this._value;
    }
}
