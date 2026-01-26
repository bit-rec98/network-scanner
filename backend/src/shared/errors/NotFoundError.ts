import { AppError } from './AppError.js';

/**
 * Not found error for missing resources.
 */
export class NotFoundError extends AppError {
    public readonly resourceType: string;
    public readonly resourceId: string;

    constructor(resourceType: string, resourceId: string) {
        super(`${resourceType} with ID '${resourceId}' not found`, 404, 'NOT_FOUND');
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }

    toJSON(): Record<string, unknown> {
        return {
            error: {
                code: this.code,
                message: this.message,
                statusCode: this.statusCode,
                resourceType: this.resourceType,
                resourceId: this.resourceId,
            },
        };
    }
}
