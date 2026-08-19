import { RequestHandler } from 'express';
import { ZodTypeAny } from 'zod';

function makeError(err: any) {
  const issues = Array.isArray(err?.issues) ? err.issues : Array.isArray(err?.errors) ? err.errors : [];
  const errorsByField = new Map<string, string>();
  issues.forEach((issue: any) => {
    const path = Array.isArray(issue.path) && issue.path.length > 0 ? issue.path : [];
    const field = path.length > 0 ? path.join('.') : 'Request';
    let message = issue.message ?? 'Invalid value';

    if (issue.code === 'invalid_string' && issue.validation === 'email') {
      message = 'Please enter a valid email address';
    } else if (issue.code === 'too_small' && issue.type === 'string' && issue.minimum === 1) {
      message = 'This field is required';
    }

    const formatted = `${field.charAt(0).toUpperCase()}${field.slice(1)}: ${message}`;
    if (!errorsByField.has(field)) errorsByField.set(field, formatted);
  });
  const errors: string[] = Array.from(errorsByField.values());

  return Object.assign(new Error(errors[0] ?? 'Request validation failed'), { status: 400, errors });
}

export function validateBody(schema: ZodTypeAny): RequestHandler {
  return (req, _res, next) => {
    try {
      req.body = schema.parse(req.body);
      return next();
    } catch (err: any) {
      return next(makeError(err));
    }
  };
}

export function validateQuery(schema: ZodTypeAny): RequestHandler {
  return (req, _res, next) => {
    try {
      // parse query params (strings) and replace with parsed values
      req.query = schema.parse(req.query as any);
      return next();
    } catch (err: any) {
      return next(makeError(err));
    }
  };
}

export function validateParams(schema: ZodTypeAny): RequestHandler {
  return (req, _res, next) => {
    try {
      req.params = schema.parse(req.params as any);
      return next();
    } catch (err: any) {
      return next(makeError(err));
    }
  };
}
