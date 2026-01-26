import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/errors/AppError.js';
import { logger } from '../../shared/utils/logger.js';
import { config } from '../../config/index.js';

/**
 * Global error handling middleware.
 * Handles all errors and returns consistent error responses.
 */
export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Log the error
    if (err instanceof AppError && err.isOperational) {
        logger.warn(`Operational error: ${err.message}`, {
            code: err.code,
            statusCode: err.statusCode,
            path: req.path,
            method: req.method,
        });
    } else {
        logger.error('Unexpected error:', {
            error: err.message,
            stack: err.stack,
            path: req.path,
            method: req.method,
        });
    }

    // Handle known operational errors
    if (err instanceof AppError) {
        res.status(err.statusCode).json(err.toJSON());
        return;
    }

    // Handle unknown errors
    res.status(500).json({
        error: {
            code: 'INTERNAL_ERROR',
            message: config.env === 'development'
                ? err.message
                : 'An unexpected error occurred',
            ...(config.env === 'development' && { stack: err.stack }),
        },
    });
};

/**
 * Not found handler for unmatched routes.
 */
export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(404).json({
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.method} ${req.path} not found`,
        },
    });
};
