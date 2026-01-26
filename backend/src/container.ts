import 'reflect-metadata';
import { container } from 'tsyringe';

// Import interfaces
import type { IUserRepository } from './domain/interfaces/repositories/IUserRepository.js';
import type { IDeviceRepository } from './domain/interfaces/repositories/IDeviceRepository.js';
import type { IScanRepository } from './domain/interfaces/repositories/IScanRepository.js';
import type { IPortRepository } from './domain/interfaces/repositories/IPortRepository.js';
import type { IAuthService } from './domain/interfaces/services/IAuthService.js';
import type { INetworkScanner } from './domain/interfaces/services/INetworkScanner.js';
import type { IPortScanner } from './domain/interfaces/services/IPortScanner.js';

// Import implementations (will be added later)
// import { MySQLUserRepository } from './infrastructure/repositories/MySQLUserRepository.js';
// import { JwtAuthService } from './infrastructure/security/JwtAuthService.js';
// import { PingScanner } from './infrastructure/network/PingScanner.js';

/**
 * Dependency Injection Container Setup
 * 
 * This module configures the DI container following the Dependency Inversion Principle.
 * High-level modules depend on abstractions (interfaces), not concrete implementations.
 * 
 * Token names for use with @inject() decorator:
 * - 'IUserRepository'
 * - 'IDeviceRepository'
 * - 'IScanRepository'
 * - 'IPortRepository'
 * - 'IAuthService'
 * - 'INetworkScanner'
 * - 'IPortScanner'
 */

export function setupContainer(): void {
    // Repositories
    // container.registerSingleton<IUserRepository>('IUserRepository', MySQLUserRepository);
    // container.registerSingleton<IDeviceRepository>('IDeviceRepository', MySQLDeviceRepository);
    // container.registerSingleton<IScanRepository>('IScanRepository', MySQLScanRepository);
    // container.registerSingleton<IPortRepository>('IPortRepository', MySQLPortRepository);

    // Services
    // container.registerSingleton<IAuthService>('IAuthService', JwtAuthService);
    // container.registerSingleton<INetworkScanner>('INetworkScanner', PingScanner);
    // container.registerSingleton<IPortScanner>('IPortScanner', TcpPortScanner);
}

export { container };
