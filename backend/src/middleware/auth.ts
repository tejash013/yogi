import { RequestHandler } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';

export interface AuthRequest extends Express.Request {
  user?: any;
}

export const authMiddleware: RequestHandler = (req: any, _res, next) => {
  try {
    const auth = req.headers.authorization as string | undefined;
    if (!auth || !auth.startsWith('Bearer ')) {
      return resStatusUnauthorized(next);
    }
    const token = auth.split(' ')[1];
    const payload = verifyAccessToken(token);
    req.user = payload;
    return next();
  } catch (err) {
    return resStatusUnauthorized(next);
  }
};

function resStatusUnauthorized(next: any) {
  const err: any = new Error('Unauthorized');
  err.status = 401;
  return next(err);
}

export function requireRole(role: string) {
  return (req: any, _res: any, next: any) => {
    if (!req.user) return next(Object.assign(new Error('Unauthorized'), { status: 401 }));
    if (req.user.role !== role && req.user.role !== 'admin') {
      return next(Object.assign(new Error('Forbidden'), { status: 403 }));
    }
    return next();
  };
}
