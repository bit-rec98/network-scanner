import 'reflect-metadata';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { config } from './config/index.js';
import { setupContainer } from './container.js';
import { logger } from './shared/utils/logger.js';
import { apiRoutes } from './presentation/routes/index.js';
import { errorHandler, notFoundHandler } from './presentation/middleware/errorHandler.js';

// Initialize DI container
setupContainer();

// Create Express app
const app: Application = express();
const httpServer = createServer(app);

// Socket.io for real-time scan updates
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: config.cors.origin,
        methods: ['GET', 'POST'],
    },
});

// Security middleware
app.use(helmet());
app.use(cors({
    origin: config.cors.origin,
    credentials: true,
}));
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
    logger.http(`${req.method} ${req.url}`);
    next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
    });
});

// API Routes
app.use('/api', apiRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Socket.io connection handling
io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
    });

    // Join scan room for real-time updates
    socket.on('join:scan', (scanId: string) => {
        socket.join(`scan:${scanId}`);
        logger.debug(`Client ${socket.id} joined scan room: ${scanId}`);
    });

    socket.on('leave:scan', (scanId: string) => {
        socket.leave(`scan:${scanId}`);
        logger.debug(`Client ${socket.id} left scan room: ${scanId}`);
    });
});

// Export for testing
export { app, io, httpServer };

// Start server
const PORT = config.port;
httpServer.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT} in ${config.env} mode`);
    logger.info(`📡 Health check: http://localhost:${PORT}/health`);
    logger.info(`📚 API base: http://localhost:${PORT}/api`);
});
