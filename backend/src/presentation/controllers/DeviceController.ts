import { Request, Response } from 'express';
import { MySQLDeviceRepository } from '../../infrastructure/repositories/MySQLDeviceRepository.js';
import { MySQLPortRepository } from '../../infrastructure/repositories/MySQLPortRepository.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { UpdateDeviceInput } from '../validators/schemas.js';

const deviceRepository = new MySQLDeviceRepository();
const portRepository = new MySQLPortRepository();

/**
 * DeviceController - Handles device management endpoints.
 */
export class DeviceController {
    /**
     * GET /api/devices/:id
     * Get device details.
     */
    getDevice = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };

        const device = await deviceRepository.findById(id);
        if (!device) {
            throw new NotFoundError('Device', id);
        }

        res.json({
            device: device.toJSON(),
        });
    });

    /**
     * PATCH /api/devices/:id
     * Update device details (custom name, notes).
     */
    updateDevice = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };
        const { customName, notes } = req.body as UpdateDeviceInput;

        const device = await deviceRepository.findById(id);
        if (!device) {
            throw new NotFoundError('Device', id);
        }

        if (customName !== undefined) {
            device.updateCustomName(customName);
        }
        if (notes !== undefined) {
            device.updateNotes(notes);
        }

        const updatedDevice = await deviceRepository.update(device);

        res.json({
            message: 'Device updated successfully',
            device: updatedDevice.toJSON(),
        });
    });

    /**
     * GET /api/devices/:id/ports
     * Get open ports for a device.
     */
    getDevicePorts = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params as { id: string };

        const device = await deviceRepository.findById(id);
        if (!device) {
            throw new NotFoundError('Device', id);
        }

        const ports = await portRepository.findByDeviceId(id);

        res.json({
            device: device.toJSON(),
            ports: ports.map((p) => p.toJSON()),
        });
    });

    /**
     * GET /api/devices/online
     * Get all currently online devices.
     */
    getOnlineDevices = asyncHandler(async (req: Request, res: Response) => {
        const devices = await deviceRepository.findOnlineDevices();

        res.json({
            devices: devices.map((d) => d.toJSON()),
            count: devices.length,
        });
    });
}

export const deviceController = new DeviceController();
