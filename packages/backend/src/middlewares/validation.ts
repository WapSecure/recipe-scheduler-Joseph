import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

// Type guard for ZodError
function isZodError(error: unknown): error is ZodError {
  return error instanceof ZodError;
}

// Helper function to get error messages
function getZodErrorMessages(error: ZodError): string[] {
  return error.errors.map(e => e.message);
}

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        ...req.body,
        ...req.params,
        ...req.query,
      });
      next();
    } catch (error) {
      if (isZodError(error)) {
        return res.status(400).json({ 
          errors: getZodErrorMessages(error),
          details: error.errors 
        });
      }
      
      // For non-Zod errors (shouldn't normally happen)
      res.status(400).json({ 
        error: 'Invalid request data',
        details: String(error)
      });
    }
  };
};