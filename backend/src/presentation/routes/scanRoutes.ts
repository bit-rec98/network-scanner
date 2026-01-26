import { Router } from 'express';
import { scanController } from '../controllers/ScanController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateBody, validateQuery, validateParams } from '../middleware/validator.js';
import {
    startScanSchema,
    scanIdSchema,
    paginationSchema,
} from '../validators/schemas.js';

const router = Router();

// All scan routes require authentication
router.use(authenticate);

/**
 * Scan Routes
 * Base path: /api/scans
 */

// GET /api/scans/stats - Get scan statistics (before :id to avoid conflict)
router.get(
    '/stats',
    scanController.getStats
);

// POST /api/scans - Start a new scan
router.post(
    '/',
    validateBody(startScanSchema),
    scanController.startScan
);

// GET /api/scans - Get scan history with pagination
router.get(
    '/',
    validateQuery(paginationSchema),
    scanController.getScans
);

// GET /api/scans/:id - Get scan details
router.get(
    '/:id',
    validateParams(scanIdSchema),
    scanController.getScan
);

// GET /api/scans/:id/devices - Get devices from a scan
router.get(
    '/:id/devices',
    validateParams(scanIdSchema),
    scanController.getScanDevices
);

// DELETE /api/scans/:id - Delete a scan
router.delete(
    '/:id',
    validateParams(scanIdSchema),
    scanController.deleteScan
);

export { router as scanRoutes };
