import { exec } from 'child_process';
import { promisify } from 'util';

import {
    INetworkScanner,
    ScannerCapabilities,
} from '../../domain/interfaces/services/INetworkScanner.js';
import { PingScanner } from './PingScanner.js';
import { TcpPortScanner } from './TcpPortScanner.js';
import { IPortScanner } from '../../domain/interfaces/services/IPortScanner.js';
import { logger } from '../../shared/utils/logger.js';
import { config } from '../../config/index.js';

const execAsync = promisify(exec);

/**
 * NetworkScannerFactory - Creates appropriate scanner instances.
 * Implements Factory Pattern for scanner creation.
 * Auto-detects nmap availability for enhanced scanning.
 */
export class NetworkScannerFactory {
    private nmapAvailable: boolean = false;
    private nmapVersion: string | null = null;
    private initialized: boolean = false;

    /**
     * Initialize the factory by checking for nmap availability.
     */
    async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            const { stdout } = await execAsync(`${config.scanner.nmapPath} --version`);
            const versionMatch = stdout.match(/Nmap version (\d+\.\d+)/);

            if (versionMatch) {
                this.nmapAvailable = true;
                this.nmapVersion = versionMatch[1];
                logger.info(`✅ Nmap detected: version ${this.nmapVersion}`);
            }
        } catch {
            this.nmapAvailable = false;
            logger.info('ℹ️ Nmap not available, using pure Node.js scanning');
        }

        this.initialized = true;
    }

    /**
     * Check if nmap is available.
     */
    isNmapAvailable(): boolean {
        return this.nmapAvailable;
    }

    /**
     * Get nmap version if available.
     */
    getNmapVersion(): string | null {
        return this.nmapVersion;
    }

    /**
     * Create a network (host discovery) scanner.
     */
    createNetworkScanner(): INetworkScanner {
        // For now, always return PingScanner
        // NmapHostScanner can be added later for enhanced features
        return new PingScanner();
    }

    /**
     * Create a port scanner.
     */
    createPortScanner(): IPortScanner {
        // For now, always return TcpPortScanner
        // NmapPortScanner can be added later for enhanced features
        return new TcpPortScanner();
    }

    /**
     * Get combined scanner capabilities.
     */
    getCapabilities(): ScannerCapabilities & { nmapVersion: string | null } {
        const baseCapabilities: ScannerCapabilities = {
            osDetection: this.nmapAvailable,
            serviceDetection: this.nmapAvailable,
            stealthScan: this.nmapAvailable,
            arpScan: this.nmapAvailable,
            macAddressResolution: true, // Available on Windows via ARP
        };

        return {
            ...baseCapabilities,
            nmapVersion: this.nmapVersion,
        };
    }
}

// Singleton instance
let factoryInstance: NetworkScannerFactory | null = null;

export async function getNetworkScannerFactory(): Promise<NetworkScannerFactory> {
    if (!factoryInstance) {
        factoryInstance = new NetworkScannerFactory();
        await factoryInstance.initialize();
    }
    return factoryInstance;
}
