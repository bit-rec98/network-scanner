import 'reflect-metadata';
import dotenv from 'dotenv';

dotenv.config();

export const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),

    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        user: process.env.DB_USER || 'network_scanner',
        password: process.env.DB_PASSWORD || '',
        name: process.env.DB_NAME || 'network_scanner',
    },

    jwt: {
        secret: process.env.JWT_SECRET || 'default-secret-change-me',
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-me',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },

    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    },

    logging: {
        level: process.env.LOG_LEVEL || 'debug',
    },

    scanner: {
        timeoutMs: parseInt(process.env.SCAN_TIMEOUT_MS || '5000', 10),
        concurrency: parseInt(process.env.SCAN_CONCURRENCY || '50', 10),
        nmapPath: process.env.NMAP_PATH || 'nmap',
    },
} as const;

export type Config = typeof config;
