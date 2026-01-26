import { z } from 'zod';

/**
 * Zod validation schemas for API requests.
 * Centralized validation for consistent input handling.
 */

// Auth schemas
export const registerSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Scan schemas
export const startScanSchema = z.object({
    networkRange: z.string().regex(
        /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/,
        'Invalid network range format (e.g., 192.168.1.0/24)'
    ),
    scanType: z.enum(['quick', 'deep', 'port']).default('quick'),
    portRange: z.object({
        start: z.number().int().min(1).max(65535).optional(),
        end: z.number().int().min(1).max(65535).optional(),
    }).optional(),
});

export const scanIdSchema = z.object({
    id: z.string().uuid('Invalid scan ID format'),
});

// Device schemas
export const deviceIdSchema = z.object({
    id: z.string().uuid('Invalid device ID format'),
});

export const updateDeviceSchema = z.object({
    customName: z.string().max(255).optional(),
    notes: z.string().max(2000).optional(),
});

// Pagination schemas
export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type StartScanInput = z.infer<typeof startScanSchema>;
export type UpdateDeviceInput = z.infer<typeof updateDeviceSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
