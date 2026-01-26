/**
 * Base application error class.
 * All custom errors should extend this.
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly code: string;

    constructor(
        message: string,
        statusCode: number = 500,
        code: string = 'INTERNAL_ERROR',
        isOperational: boolean = true
    ) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;

        // Maintains proper stack trace for where error was thrown
        Error.captureStackTrace(this, this.constructor);

        // Set the prototype explicitly for proper instanceof checks
        Object.setPrototypeOf(this, AppError.prototype);
    }

    toJSON(): Record<string, unknown> {
        return {
            error: {
                code: this.code,
                message: this.message,
                statusCode: this.statusCode,
            },
        };
    }
}
