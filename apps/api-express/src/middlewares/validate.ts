import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { ValidationError } from '../common/errors.js';

interface ValidationSchemas {
  params?: ZodType;
  body?: ZodType;
}

interface ValidationIssue {
  location: 'params' | 'body';
  path: string;
  message: string;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: ValidationIssue[] = [];

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
      next(new ValidationError(errors));
      return;
    }

    next();
  };
}
