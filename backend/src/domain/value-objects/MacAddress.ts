/**
 * MacAddress value object - immutable and self-validating.
 */
export class MacAddress {
    private readonly _value: string;

    private constructor(value: string) {
        // Normalize to uppercase with colons
        this._value = value.toUpperCase().replace(/[.-]/g, ':');
    }

    static create(value: string): MacAddress {
        if (!MacAddress.isValid(value)) {
            throw new Error(`Invalid MAC address: ${value}`);
        }
        return new MacAddress(value);
    }

    static isValid(value: string): boolean {
        // Normalize separators
        const normalized = value.replace(/[.-]/g, ':');

        // MAC address format: XX:XX:XX:XX:XX:XX
        const macRegex = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;
        return macRegex.test(normalized);
    }

    get value(): string {
        return this._value;
    }

    /**
     * Get the OUI (Organizationally Unique Identifier) - first 3 octets
     */
    getOUI(): string {
        return this._value.split(':').slice(0, 3).join(':');
    }

    /**
     * Check if this is a broadcast MAC address
     */
    isBroadcast(): boolean {
        return this._value === 'FF:FF:FF:FF:FF:FF';
    }

    /**
     * Check if this is a multicast MAC address
     */
    isMulticast(): boolean {
        const firstOctet = parseInt(this._value.split(':')[0], 16);
        return (firstOctet & 1) === 1;
    }

    /**
     * Check if this is a locally administered address
     */
    isLocallyAdministered(): boolean {
        const firstOctet = parseInt(this._value.split(':')[0], 16);
        return (firstOctet & 2) === 2;
    }

    equals(other: MacAddress): boolean {
        return this._value === other._value;
    }

    toString(): string {
        return this._value;
    }

    toJSON(): string {
        return this._value;
    }
}
