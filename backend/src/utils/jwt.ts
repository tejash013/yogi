import jwt from 'jsonwebtoken';

const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES ?? '15m';
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES ?? '7d';
function getSecret(name: string, developmentFallback: string) {
  const value = process.env[name];
  if (process.env.NODE_ENV === 'production' && (!value || value.length < 32)) {
    throw new Error(`${name} must be configured with at least 32 characters in production`);
  }
  return value ?? developmentFallback;
}

const ACCESS_SECRET = getSecret('ACCESS_TOKEN_SECRET', 'dev_access_secret');
const REFRESH_SECRET = getSecret('REFRESH_TOKEN_SECRET', 'dev_refresh_secret');

export function signAccessToken(payload: object) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
}

export function signRefreshToken(payload: object) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_SECRET) as any;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_SECRET) as any;
}
