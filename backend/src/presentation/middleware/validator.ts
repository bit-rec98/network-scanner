import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError, ValidationDetail } from '../../shared/errors/ValidationError.js';

/**
 * Validation middleware factory using Zod schemas.
 */
export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req[source];
            const parsed = schema.parse(data);

            // Replace with parsed (and coerced) values
            req[source] = parsed;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const details: ValidationDetail[] = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));

                next(new ValidationError('Validation failed', details));
            } else {
                next(error);
            }
        }
    };
};

export { validate as validateBody };

export const validateQuery = (schema: ZodSchema) => validate(schema, 'query');
export const validateParams = (schema: ZodSchema) => validate(schema, 'params');
