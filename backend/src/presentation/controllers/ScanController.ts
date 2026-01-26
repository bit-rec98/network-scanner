import { Request, Response } from 'express';
import { MySQLScanRepository } from '../../infrastructure/repositories/MySQLScanRepository.js';
import { MySQLDeviceRepository } from '../../infrastructure/repositories/MySQLDeviceRepository.js';
import { NetworkScan, ScanType } from '../../domain/entities/NetworkScan.js';
import { Device } from '../../domain/entities/Device.js';
import { IpAddress } from '../../domain/value-objects/IpAddress.js';
import { MacAddress } from '../../domain/value-objects/MacAddress.js';
import { getNetworkScannerFactory } from '../../infrastructure/network/NetworkScannerFactory.js';
import { TcpPortScanner } from '../../infrastructure/network/TcpPortScanner.js';
import { PortRange } from '../../domain/value-objects/PortRange.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { logger } from '../../shared/utils/logger.js';
import { StartScanInput, PaginationInput } from '../validators/schemas.js';

const scanRepository = new MySQLScanRepository();
const deviceRepository = new MySQLDeviceRepository();

/**
 * ScanController - Handles network scanning endpoints.
 */
export class ScanController {
    /**
     * POST /api/scans
     * Start a new network scan.
     */
    startScan = asyncHandler(async (req: Request, res: Response) => {
        const { networkRange, scanType, portRange } = req.body as StartScanInput;
        const userId = req.user!.userId;

        // Create scan record
        const scan = NetworkScan.createNew(userId, networkRange, scanType as ScanType);
        const savedScan = await scanRepository.save(scan);

        // Start scan asynchronously
        this.executeScan(savedScan.id, networkRange, scanType as ScanType, portRange)
            .catch((err) => logger.error('Scan execution failed:', err));

        res.status(202).json({
            message: 'Scan started',
            scan: savedScan.toJSON(),
        });
    });

    /**
     * GET /api/scans
     * Get scan history for current user.
     */
    getScans = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.userId;
        const { page, limit } = req.query as unknown as PaginationInput;
        const offset = (page - 1) * limit;

        const [scans, total] = await Promise.all([
            scanRepository.findByUserId(userId, limit, offset),
            scanRepository.countByUserId(userId),
        ]);

        res.json({
            scans: scans.map((s) => s.toJSON()),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    });

    /**
     * GET /api/scans/:id
     * Get scan details.
     */
    getScan = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };

        const scan = await scanRepository.findById(id);
        if (!scan) {
            throw new NotFoundError('Scan', id);
        }

        res.json({
            scan: scan.toJSON(),
        });
    });

    /**
     * GET /api/scans/:id/devices
     * Get devices discovered in a scan.
     */
    getScanDevices = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };

        const scan = await scanRepository.findById(id);
        if (!scan) {
            throw new NotFoundError('Scan', id);
        }

        const devices = await deviceRepository.findByScanId(id);

        res.json({
            scan: scan.toJSON(),
            devices: devices.map((d) => d.toJSON()),
        });
    });

    /**
     * DELETE /api/scans/:id
     * Delete a scan and its results.
     */
    deleteScan = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };

        const scan = await scanRepository.findById(id);
        if (!scan) {
            throw new NotFoundError('Scan', id);
        }

        // Delete associated devices first (cascade should handle this, but being explicit)
        await deviceRepository.deleteByScanId(id);
        await scanRepository.delete(id);

        res.json({
            message: 'Scan deleted successfully',
        });
    });

    /**
     * GET /api/scans/stats
     * Get scanning statistics for current user.
     */
    getStats = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.userId;

        const stats = await scanRepository.getStats(userId);

        res.json({
            stats,
        });
    });

    /**
     * GET /api/scanner/capabilities
     * Get scanner capabilities (nmap detection).
     */
    getCapabilities = asyncHandler(async (req: Request, res: Response) => {
        const factory = await getNetworkScannerFactory();
        const capabilities = factory.getCapabilities();

        res.json({
            capabilities,
        });
    });

    /**
     * Execute the actual network scan (runs asynchronously).
     */
    private async executeScan(
        scanId: string,
        networkRange: string,
        scanType: ScanType,
        portRange?: { start?: number; end?: number }
    ): Promise<void> {
        const scan = await scanRepository.findById(scanId);
        if (!scan) return;

        try {
            // Mark scan as running
            scan.start();
            await scanRepository.update(scan);

            // Get scanner factory and create scanner
            const factory = await getNetworkScannerFactory();
            const networkScanner = factory.createNetworkScanner();

            // Discover hosts
            logger.info(`Executing ${scanType} scan on ${networkRange}`);
            const hosts = await networkScanner.discoverHosts(networkRange);

            // Save discovered devices
            const devices: Device[] = [];
            for (const host of hosts) {
                const device = Device.createFromScan(
                    scanId,
                    host.ip,
                    host.macAddress ? MacAddress.create(host.macAddress) : null,
                    host.hostname
                );
                if (host.vendor) {
                    device.setVendor(host.vendor);
                }
                devices.push(device);
            }

            if (devices.length > 0) {
                await deviceRepository.saveMany(devices);
            }

            // Port scan if requested
            if (scanType === ScanType.DEEP || scanType === ScanType.PORT) {
                const portScanner = new TcpPortScanner();
                const range = portRange
                    ? PortRange.create(portRange.start || 1, portRange.end || 1024)
                    : PortRange.common();

                for (const device of devices) {
                    const ports = await portScanner.scanPorts(device.ipAddress, range);
                    logger.debug(`Found ${ports.length} open ports on ${device.ipAddress.value}`);
                    // Port saving would happen here via MySQLPortRepository
                }
            }

            // Mark scan as completed
            scan.complete(devices.length);
            await scanRepository.update(scan);
            logger.info(`Scan ${scanId} completed: ${devices.length} devices found`);

        } catch (error) {
            logger.error(`Scan ${scanId} failed:`, error);
            scan.fail();
            await scanRepository.update(scan);
        }
    }
}

export const scanController = new ScanController();
