import { RequestHandler } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { userRepo } from '../repos/index.js';
import { hasPermission, isSupportedRole, Permission } from '../auth/permissions.js';
import { tenantIdsFromRequest } from '../utils/tenant.js';

export interface AuthRequest extends Express.Request {
  user?: any;
}

export const authMiddleware: RequestHandler = (req: any, _res, next) => {
  return authenticate(req, _res, next);
};

export const authenticate: RequestHandler = async (req: any, _res, next) => {
  try {
    const auth = req.headers.authorization as string | undefined;
    if (!auth || !auth.startsWith('Bearer ')) {
      return resStatusUnauthorized(next);
    }
    const token = auth.split(' ')[1];
    const payload = verifyAccessToken(token);
    const user = await userRepo.findById(String(payload.id));
    if (!user || !isSupportedRole(user.role) || user.status !== 'active' || payload.tokenVersion !== user.tokenVersion ||
      String(payload.restaurantId) !== String(user.restaurantId) || String(payload.branchId) !== String(user.branchId)) {
      return next(Object.assign(new Error('Account is inactive or suspended'), { status: 401 }));
    }
    req.user = {
      id: String(user._id),
      role: user.role,
      email: user.email,
      tokenVersion: user.tokenVersion,
      restaurantId: String(user.restaurantId),
      branchId: String(user.branchId),
    };
    return next();
  } catch (err) {
    return resStatusUnauthorized(next);
  }
};

export const optionalAuth: RequestHandler = async (req: any, _res, next) => {
  try {
    const auth = req.headers.authorization as string | undefined;
    if (!auth || !auth.startsWith('Bearer ')) {
      return next();
    }
    const token = auth.split(' ')[1];
    const payload = verifyAccessToken(token);
    const user = await userRepo.findById(String(payload.id));
    if (user && isSupportedRole(user.role) && user.status === 'active' && payload.tokenVersion === user.tokenVersion) {
      req.user = {
        id: String(user._id),
        role: user.role,
        email: user.email,
        tokenVersion: user.tokenVersion,
        restaurantId: String(user.restaurantId),
        branchId: String(user.branchId),
      };
    }
  } catch {
    // Ignore invalid token and continue as guest
  }
  return next();
};

function resStatusUnauthorized(next: any) {
  const err: any = new Error('Unauthorized');
  err.status = 401;
  return next(err);
}

export function requireRole(roles: string | string[]) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  return (req: any, _res: any, next: any) => {
    if (!req.user) return next(Object.assign(new Error('Unauthorized'), { status: 401 }));
    if (!allowedRoles.includes(req.user.role)) {
      return next(Object.assign(new Error('Forbidden'), { status: 403 }));
    }
    return next();
  };
}

export function requirePermission(permission: Permission) {
  return (req: any, _res: any, next: any) => {
    if (!req.user) return next(Object.assign(new Error('Unauthorized'), { status: 401 }));
    if (!hasPermission(req.user.role, permission)) {
      return next(Object.assign(new Error('You do not have permission to perform this action'), { status: 403 }));
    }
    return next();
  };
}
