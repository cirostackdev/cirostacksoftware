import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { secrets } from '@/config/secrets.js';
import { AppError } from './errorHandler.js';

export interface JwtPayload {
  sub: string;      // userId
  role: string;
  email: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError(401, 'Missing or invalid Authorization header'));
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, secrets().jwtAccessSecret) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token'));
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(new AppError(401, 'Not authenticated'));
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'Forbidden'));
    }
    next();
  };
}
