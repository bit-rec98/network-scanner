import { Request, Response, NextFunction } from 'express';
import { JwtAuthService } from '../../infrastructure/security/JwtAuthService.js';
import { MySQLUserRepository } from '../../infrastructure/repositories/MySQLUserRepository.js';
import { UnauthorizedError, ForbiddenError } from '../../shared/errors/AuthErrors.js';
import { UserRole } from '../../domain/entities/User.js';

const authService = new JwtAuthService();
const userRepository = new MySQLUserRepository();

/**
 * Extended Express Request with user information
 */
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email: string;
                role: string;
            };
        }
    }
}

/**
 * Authentication middleware - verifies JWT access token.
 */
export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('No token provided');
        }

        const token = authHeader.substring(7);
        const payload = authService.verifyAccessToken(token);

        if (!payload) {
            throw new UnauthorizedError('Invalid or expired token');
        }

        // Verify user still exists
        const user = await userRepository.findById(payload.userId);
        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        req.user = {
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
        };

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Authorization middleware factory - checks user role.
 */
export const authorize = (...allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new UnauthorizedError('Authentication required'));
        }

        if (!allowedRoles.includes(req.user.role as UserRole)) {
            return next(new ForbiddenError('Insufficient permissions'));
        }

        next();
    };
};

/**
 * Optional authentication - populates req.user if token is valid, but doesn't require it.
 */
export const optionalAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const payload = authService.verifyAccessToken(token);

            if (payload) {
                req.user = {
                    userId: payload.userId,
                    email: payload.email,
                    role: payload.role,
                };
            }
        }

        next();
    } catch {
        // Ignore auth errors for optional auth
        next();
    }
};
