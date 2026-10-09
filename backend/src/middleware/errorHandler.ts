import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

function simplifySystemError(err: any): { status: number; message: string; errors: string[] } {
  let status = typeof err?.status === 'number' ? err.status : 500;
  let message = typeof err?.message === 'string' ? err.message : '';
  let errors: string[] = Array.isArray(err?.errors) ? err.errors : [];

  // 1. MongoDB Duplicate Key Error (code 11000)
  if (err?.code === 11000 || (err?.name === 'MongoServerError' && err?.message?.includes('E11000'))) {
    status = 409;
    const raw = String(err.message || '');
    if (raw.includes('email')) {
      message = 'An account with this email already exists';
    } else if (raw.includes('phone')) {
      message = 'An account with this phone number already exists';
    } else if (raw.includes('code')) {
      message = 'A coupon or offer with this code already exists';
    } else if (raw.includes('title') || raw.includes('name')) {
      message = 'An item with this name already exists in this outlet';
    } else {
      message = 'A record with this information already exists';
    }
    errors = [message];
    return { status, message, errors };
  }

  // 2. Mongoose Cast to ObjectId Error
  if (err?.name === 'CastError' || (message.includes('Cast to') && message.includes('failed for value'))) {
    status = 404;
    message = 'The requested item was not found';
    errors = [message];
    return { status, message, errors };
  }

  // 3. Mongoose Validation Error
  if (err?.name === 'ValidationError' && err?.errors && typeof err.errors === 'object') {
    status = 400;
    const cleanErrors = Object.values(err.errors)
      .map((e: any) => String(e?.message || 'Invalid value'))
      .filter(Boolean);
    message = cleanErrors[0] || 'Please check your input and try again';
    errors = cleanErrors;
    return { status, message, errors };
  }

  // 4. JWT Authentication Errors
  if (err?.name === 'TokenExpiredError' || message.includes('jwt expired')) {
    status = 401;
    message = 'Your session has expired. Please log in again';
    errors = [message];
    return { status, message, errors };
  }
  if (err?.name === 'JsonWebTokenError' || message.includes('jwt malformed') || message.includes('invalid signature')) {
    status = 401;
    message = 'Invalid authentication token. Please log in again';
    errors = [message];
    return { status, message, errors };
  }

  // 5. JSON Syntax / Body Parsing Error
  if (err instanceof SyntaxError && 'body' in err) {
    status = 400;
    message = 'Invalid request data format. Please review your input';
    errors = [message];
    return { status, message, errors };
  }

  // 6. Payload / File Too Large
  if (err?.type === 'entity.too.large' || status === 413) {
    status = 413;
    message = 'The uploaded file or request is too large. Please use a smaller file';
    errors = [message];
    return { status, message, errors };
  }

  // 7. Internal / Unhandled Server Errors (>= 500)
  if (status >= 500 || !message) {
    status = 500;
    message = 'Something went wrong on our end. Please try again shortly';
    errors = [];
    return { status, message, errors };
  }

  // 8. Clean up any raw technical messages for client-facing 4xx
  if (message === 'Internal Server Error' || message.includes('ECONNREFUSED') || message.includes('Cannot read properties of')) {
    message = 'Something went wrong on our end. Please try again shortly';
  }

  return { status, message, errors };
}

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const { status, message, errors } = simplifySystemError(err);
  if (status >= 500) {
    logger.error({ err, requestId: (req as any).id }, 'Unhandled request error');
  }
  res.status(status).setHeader('x-request-id', (req as any).id ?? '').json({
    success: false,
    data: null,
    message,
    errors,
  });
}
