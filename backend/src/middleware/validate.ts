import { RequestHandler } from 'express';
import { ZodTypeAny } from 'zod';

function makeError(err: any) {
  return Object.assign(new Error(err?.errors ? JSON.stringify(err.errors) : 'Validation failed'), { status: 400, errors: err?.errors ?? [] });
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
