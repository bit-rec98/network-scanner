import { Router } from 'express';
import { authRoutes } from './authRoutes.js';
import { scanRoutes } from './scanRoutes.js';
import { deviceRoutes } from './deviceRoutes.js';
import { scanController } from '../controllers/ScanController.js';

const router = Router();

/**
 * API Routes
 * Base path: /api
 */

// Mount route modules
router.use('/auth', authRoutes);
router.use('/scans', scanRoutes);
router.use('/devices', deviceRoutes);

// Scanner capabilities (public endpoint)
router.get('/scanner/capabilities', scanController.getCapabilities);

export { router as apiRoutes };
