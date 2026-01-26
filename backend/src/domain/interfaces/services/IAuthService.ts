import { User } from '../../entities/User.js';

/**
 * IAuthService interface - abstracts authentication operations.
 */
export interface IAuthService {
    /**
     * Hash a plain text password.
     */
    hashPassword(password: string): Promise<string>;

    /**
     * Verify a password against a hash.
     */
    verifyPassword(password: string, hash: string): Promise<boolean>;

    /**
     * Generate access and refresh tokens for a user.
     */
    generateTokens(user: User): TokenPair;

    /**
     * Verify and decode an access token.
     */
    verifyAccessToken(token: string): TokenPayload | null;

    /**
     * Verify and decode a refresh token.
     */
    verifyRefreshToken(token: string): TokenPayload | null;

    /**
     * Invalidate a refresh token (logout).
     */
    invalidateRefreshToken(token: string): Promise<void>;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
}
