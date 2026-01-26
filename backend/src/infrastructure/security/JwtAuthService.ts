import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import {
    IAuthService,
    TokenPair,
    TokenPayload,
} from '../../domain/interfaces/services/IAuthService.js';
import { User } from '../../domain/entities/User.js';
import { config } from '../../config/index.js';
import { logger } from '../../shared/utils/logger.js';

/**
 * JwtAuthService - JWT-based authentication service.
 * Implements IAuthService interface for password hashing and token management.
 */
export class JwtAuthService implements IAuthService {
    private readonly saltRounds = 10;
    private readonly invalidatedTokens: Set<string> = new Set();

    /**
     * Hash a plain text password using bcrypt.
     */
    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, this.saltRounds);
    }

    /**
     * Verify a password against a bcrypt hash.
     */
    async verifyPassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    /**
     * Generate access and refresh tokens for a user.
     */
    generateTokens(user: User): TokenPair {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = jwt.sign(payload, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn,
        } as SignOptions);

        const refreshToken = jwt.sign(
            { ...payload, tokenId: uuidv4() },
            config.jwt.refreshSecret,
            { expiresIn: config.jwt.refreshExpiresIn } as SignOptions
        );

        // Calculate expiration in seconds
        const decoded = jwt.decode(accessToken) as { exp: number };
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

        return {
            accessToken,
            refreshToken,
            expiresIn,
        };
    }

    /**
     * Verify and decode an access token.
     */
    verifyAccessToken(token: string): TokenPayload | null {
        try {
            const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;
            return decoded;
        } catch (error) {
            logger.debug('Access token verification failed:', error);
            return null;
        }
    }

    /**
     * Verify and decode a refresh token.
     */
    verifyRefreshToken(token: string): TokenPayload | null {
        try {
            // Check if token has been invalidated
            if (this.invalidatedTokens.has(token)) {
                return null;
            }

            const decoded = jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
            return decoded;
        } catch (error) {
            logger.debug('Refresh token verification failed:', error);
            return null;
        }
    }

    /**
     * Invalidate a refresh token (logout).
     * Note: In production, use Redis or database for token blacklist.
     */
    async invalidateRefreshToken(token: string): Promise<void> {
        this.invalidatedTokens.add(token);

        // Clean up old tokens periodically (simple approach)
        // In production, use Redis with TTL or database cleanup job
        if (this.invalidatedTokens.size > 10000) {
            this.invalidatedTokens.clear();
        }
    }
}
