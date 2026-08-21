import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const status = err?.status ?? 500;
  const message = status >= 500 && process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err?.message ?? 'Internal Server Error';
  if (status >= 500) {
    logger.error({ err, requestId: (req as any).id }, 'Unhandled request error');
  }
  res.status(status).setHeader('x-request-id', (req as any).id ?? '').json({ success: false, data: null, message, errors: err?.errors ?? [] });
}
