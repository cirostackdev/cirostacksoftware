import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      ...(err.details !== undefined && { details: err.details }),
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(422).json({
      error: 'Validation failed',
      details: err.flatten().fieldErrors,
    });
    return;
  }

  // Drizzle / Postgres unique constraint
  if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as Record<string, unknown>).code === '23505'
  ) {
    res.status(409).json({ error: 'Duplicate entry' });
    return;
  }

  console.error('[errorHandler]', err);
  res.status(500).json({ error: 'Internal server error' });
}
