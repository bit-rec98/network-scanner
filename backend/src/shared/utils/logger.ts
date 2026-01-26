import winston from 'winston';
import { config } from '../../config/index.js';

const { combine, timestamp, printf, colorize, errors } = winston.format;

/**
 * Custom log format for development
 */
const devFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
        log += ` ${JSON.stringify(meta)}`;
    }
    if (stack) {
        log += `\n${stack}`;
    }
    return log;
});

/**
 * Custom log format for production (JSON)
 */
const prodFormat = printf(({ level, message, timestamp, ...meta }) => {
    return JSON.stringify({
        timestamp,
        level,
        message,
        ...meta,
    });
});

/**
 * Create Winston logger instance
 */
export const logger = winston.createLogger({
    level: config.logging.level,
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true })
    ),
    transports: [
        new winston.transports.Console({
            format:
                config.env === 'development'
                    ? combine(colorize(), devFormat)
                    : prodFormat,
        }),
    ],
    exceptionHandlers: [
        new winston.transports.Console({
            format: combine(colorize(), devFormat),
        }),
    ],
    rejectionHandlers: [
        new winston.transports.Console({
            format: combine(colorize(), devFormat),
        }),
    ],
});

// Add file transport in production
if (config.env === 'production') {
    logger.add(
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: prodFormat,
        })
    );
    logger.add(
        new winston.transports.File({
            filename: 'logs/combined.log',
            format: prodFormat,
        })
    );
}

/**
 * Log levels for reference:
 * error: 0
 * warn: 1
 * info: 2
 * http: 3
 * verbose: 4
 * debug: 5
 * silly: 6
 */
