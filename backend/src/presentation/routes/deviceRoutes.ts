import { Router } from 'express';
import { deviceController } from '../controllers/DeviceController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateBody, validateParams } from '../middleware/validator.js';
import {
    deviceIdSchema,
    updateDeviceSchema,
} from '../validators/schemas.js';

const router = Router();

// All device routes require authentication
router.use(authenticate);

/**
 * Device Routes
 * Base path: /api/devices
 */

// GET /api/devices/online - Get all online devices
router.get(
    '/online',
    deviceController.getOnlineDevices
);

// GET /api/devices/:id - Get device details
router.get(
    '/:id',
    validateParams(deviceIdSchema),
    deviceController.getDevice
);

// PATCH /api/devices/:id - Update device
router.patch(
    '/:id',
    validateParams(deviceIdSchema),
    validateBody(updateDeviceSchema),
    deviceController.updateDevice
);

// GET /api/devices/:id/ports - Get device ports
router.get(
    '/:id/ports',
    validateParams(deviceIdSchema),
    deviceController.getDevicePorts
);

export { router as deviceRoutes };
