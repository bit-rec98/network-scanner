import { Router } from 'express';
import { authController } from '../controllers/AuthController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validator.js';
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
} from '../validators/schemas.js';

const router = Router();

/**
 * Auth Routes
 * Base path: /api/auth
 */

// POST /api/auth/register - Register new user
router.post(
    '/register',
    validateBody(registerSchema),
    authController.register
);

// POST /api/auth/login - Login
router.post(
    '/login',
    validateBody(loginSchema),
    authController.login
);

// POST /api/auth/refresh - Refresh access token
router.post(
    '/refresh',
    validateBody(refreshTokenSchema),
    authController.refresh
);

// POST /api/auth/logout - Logout
router.post(
    '/logout',
    authController.logout
);

// GET /api/auth/me - Get current user (requires auth)
router.get(
    '/me',
    authenticate,
    authController.me
);

export { router as authRoutes };
