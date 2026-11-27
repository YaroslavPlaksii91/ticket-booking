import type { ErrorRequestHandler } from 'express';
import { AppError } from '../common/errors.js';

function isClientHttpError(err: unknown): err is { status: number; message: string } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'status' in err &&
    typeof err.status === 'number' &&
    err.status >= 400 &&
    err.status < 500
  );
}

export const errorHandler: ErrorRequestHandler = (err: unknown, req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined && { details: err.details }),
      },
    });
    return;
  }

  if (isClientHttpError(err)) {
    res.status(err.status).json({
      error: {
        code: err.status === 413 ? 'PAYLOAD_TOO_LARGE' : 'BAD_REQUEST',
        message: err.message,
      },
    });
    return;
  }

  req.log.error({ err }, 'Unhandled error');
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
  });
};
