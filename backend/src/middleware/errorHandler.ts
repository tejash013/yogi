import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err?.status ?? 500;
  const message = status >= 500 && process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err?.message ?? 'Internal Server Error';
  if (status >= 500) {
    console.error('Unhandled error:', err);
  }
  res.status(status).json({ success: false, data: null, message, errors: err?.errors ?? [] });
}
