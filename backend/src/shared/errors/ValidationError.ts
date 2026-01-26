import { AppError } from './AppError.js';

/**
 * Validation error for invalid input data.
 */
export class ValidationError extends AppError {
    public readonly details: ValidationDetail[];

    constructor(message: string, details: ValidationDetail[] = []) {
        super(message, 400, 'VALIDATION_ERROR');
        this.details = details;
        Object.setPrototypeOf(this, ValidationError.prototype);
    }

    toJSON(): Record<string, unknown> {
        return {
            error: {
                code: this.code,
                message: this.message,
                statusCode: this.statusCode,
                details: this.details,
            },
        };
    }
}

export interface ValidationDetail {
    field: string;
    message: string;
    value?: unknown;
}
