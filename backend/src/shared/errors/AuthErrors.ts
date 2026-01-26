import { AppError } from './AppError.js';

/**
 * Unauthorized error for authentication failures.
 */
export class UnauthorizedError extends AppError {
    constructor(message: string = 'Authentication required') {
        super(message, 401, 'UNAUTHORIZED');
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}

/**
 * Forbidden error for authorization failures.
 */
export class ForbiddenError extends AppError {
    constructor(message: string = 'Access denied') {
        super(message, 403, 'FORBIDDEN');
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}

/**
 * Conflict error for duplicate resources.
 */
export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409, 'CONFLICT');
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}
