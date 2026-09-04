import { logger } from '../utils/logger.js';
export function errorHandler(err, req, res, _next) {
    const status = err?.status ?? 500;
    const message = status >= 500 && process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err?.message ?? 'Internal Server Error';
    if (status >= 500) {
        logger.error({ err, requestId: req.id }, 'Unhandled request error');
    }
    res.status(status).setHeader('x-request-id', req.id ?? '').json({ success: false, data: null, message, errors: err?.errors ?? [] });
}
