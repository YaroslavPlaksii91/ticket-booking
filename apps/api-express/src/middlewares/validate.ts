import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';

interface ValidationSchemas {
  params?: ZodType;
  body?: ZodType;
}

interface ValidationError {
  location: 'params' | 'body';
  path: string;
  message: string;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: ValidationError[] = [];

    for (const location of ['params', 'body'] as const) {
      const schema = schemas[location];
      if (!schema) continue;

      const result = schema.safeParse(req[location]);

      if (!result.success) {
        for (const issue of result.error.issues) {
          errors.push({ location, path: issue.path.join('.'), message: issue.message });
        }
        continue;
      }

      req[location] = result.data;
    }

    if (errors.length > 0) {
      res.status(400).json({ message: 'Validation failed', errors });
      return;
    }

    next();
  };
}
