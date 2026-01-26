import { Request, Response } from 'express';
import { MySQLUserRepository } from '../../infrastructure/repositories/MySQLUserRepository.js';
import { JwtAuthService } from '../../infrastructure/security/JwtAuthService.js';
import { User, UserRole } from '../../domain/entities/User.js';
import { UnauthorizedError, ConflictError } from '../../shared/errors/AuthErrors.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { RegisterInput, LoginInput } from '../validators/schemas.js';

const userRepository = new MySQLUserRepository();
const authService = new JwtAuthService();

/**
 * AuthController - Handles authentication endpoints.
 */
export class AuthController {
    /**
     * POST /api/auth/register
     * Register a new user.
     */
    register = asyncHandler(async (req: Request, res: Response) => {
        const { email, password } = req.body as RegisterInput;

        // Check if email already exists
        const exists = await userRepository.existsByEmail(email);
        if (exists) {
            throw new ConflictError('Email already registered');
        }

        // Hash password and create user
        const passwordHash = await authService.hashPassword(password);
        const user = User.createNew(email, passwordHash, UserRole.VIEWER);
        const savedUser = await userRepository.save(user);

        // Generate tokens
        const tokens = authService.generateTokens(savedUser);

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: savedUser.id,
                email: savedUser.email,
                role: savedUser.role,
            },
            ...tokens,
        });
    });

    /**
     * POST /api/auth/login
     * Login with email and password.
     */
    login = asyncHandler(async (req: Request, res: Response) => {
        const { email, password } = req.body as LoginInput;

        // Find user by email
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new UnauthorizedError('Invalid email or password');
        }

        // Verify password
        const isValid = await authService.verifyPassword(password, user.passwordHash);
        if (!isValid) {
            throw new UnauthorizedError('Invalid email or password');
        }

        // Generate tokens
        const tokens = authService.generateTokens(user);

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            ...tokens,
        });
    });

    /**
     * POST /api/auth/refresh
     * Refresh access token using refresh token.
     */
    refresh = asyncHandler(async (req: Request, res: Response) => {
        const { refreshToken } = req.body;

        // Verify refresh token
        const payload = authService.verifyRefreshToken(refreshToken);
        if (!payload) {
            throw new UnauthorizedError('Invalid or expired refresh token');
        }

        // Get user
        const user = await userRepository.findById(payload.userId);
        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        // Invalidate old refresh token and generate new tokens
        await authService.invalidateRefreshToken(refreshToken);
        const tokens = authService.generateTokens(user);

        res.json({
            message: 'Token refreshed successfully',
            ...tokens,
        });
    });

    /**
     * POST /api/auth/logout
     * Invalidate refresh token.
     */
    logout = asyncHandler(async (req: Request, res: Response) => {
        const { refreshToken } = req.body;

        if (refreshToken) {
            await authService.invalidateRefreshToken(refreshToken);
        }

        res.json({
            message: 'Logged out successfully',
        });
    });

    /**
     * GET /api/auth/me
     * Get current user information.
     */
    me = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.userId;

        if (!userId) {
            throw new UnauthorizedError('Authentication required');
        }

        const user = await userRepository.findById(userId);
        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        res.json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            },
        });
    });
}

export const authController = new AuthController();
