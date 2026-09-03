import crypto from 'crypto';
import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate.js';
import { userRepo } from '../repos/index.js';
import RefreshToken from '../models/RefreshToken.js';
import User from '../models/User.js';
import { failure, success } from '../utils/response.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { sendEmail } from '../utils/email.js';
import { recordAudit } from '../utils/audit.js';
import { tenantIdsFromRequest } from '../utils/tenant.js';
import { isSupportedRole } from '../auth/permissions.js';

const router = Router();
const REFRESH_COOKIE = 'restaurantos_refresh';
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function refreshCookieOptions() {
  const production = process.env.NODE_ENV === 'production';
  return `Path=/; Max-Age=${Math.floor(REFRESH_MAX_AGE / 1000)}; HttpOnly; SameSite=${production ? 'None' : 'Lax'}${production ? '; Secure' : ''}`;
}

function setRefreshCookie(res: any, token: string) {
  res.setHeader('Set-Cookie', `${REFRESH_COOKIE}=${encodeURIComponent(token)}; ${refreshCookieOptions()}`);
}

function clearRefreshCookie(res: any) {
  res.setHeader('Set-Cookie', `${REFRESH_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=${process.env.NODE_ENV === 'production' ? 'None' : 'Lax'}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
}

function getRefreshCookie(req: any) {
  const cookies = String(req.headers.cookie ?? '').split(';');
  const value = cookies.find((cookie) => cookie.trim().startsWith(`${REFRESH_COOKIE}=`));
  return value ? decodeURIComponent(value.trim().slice(REFRESH_COOKIE.length + 1)) : undefined;
}

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

function verifyPassword(password: string, stored: string) {
  const [salt, derivedKey] = stored.split(':');
  if (!salt || !derivedKey) return false;
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(derivedKey, 'hex'));
}

function hashRefreshToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function hashResetToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function sanitizeUser(user: any) {
  const sanitized = user.toObject ? user.toObject() : { ...user };
  delete sanitized.password;
  delete sanitized.resetToken;
  delete sanitized.resetTokenExpires;
  return sanitized;
}

async function persistRefreshToken(userId: any, token: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const rt = new RefreshToken({ token: hashRefreshToken(token), user: userId, expiresAt });
  await rt.save();
}

const nameRegex = /^[A-Za-z][A-Za-z\s'-]{0,}$/;
const phoneRegex = /^\+?[0-9\s-]{7,15}$/;
const localPartHasLetter = (email: string) => {
  const parts = email.split('@');
  return parts.length === 2 && /[A-Za-z]/.test(parts[0]);
};

const loginSchema = z.object({
  email: z.string().email().refine(localPartHasLetter, { message: 'Invalid email' }).optional(),
  phone: z.string().regex(phoneRegex, { message: 'Invalid phone number' }).optional(),
  password: z.string().min(1),
}).strict().refine((data) => Boolean(data.email || data.phone), { message: 'Email or phone is required' });
const registerSchema = z.object({
  email: z.string().email().refine(localPartHasLetter, { message: 'Invalid email' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }).max(72),
  confirmPassword: z.string().min(6, { message: 'Confirm password must be at least 6 characters' }).max(72),
  firstName: z.string().trim().min(2).max(50).regex(nameRegex, { message: 'First name must contain only letters, spaces, hyphens or apostrophes' }),
  lastName: z.string().trim().max(50).regex(nameRegex, { message: 'Last name must contain only letters, spaces, hyphens or apostrophes' }).optional().or(z.literal('')),
  phone: z.string().regex(phoneRegex, { message: 'Invalid phone number' }),
}).strict().refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
const forgotSchema = z.object({ email: z.string().email().refine(localPartHasLetter, { message: 'Invalid email' }) });
const resetSchema = z.object({ email: z.string().email().refine(localPartHasLetter, { message: 'Invalid email' }), token: z.string().min(1), password: z.string().min(6) });
const verifyOtpSchema = z.object({ email: z.string().email().refine(localPartHasLetter, { message: 'Invalid email' }), otp: z.string().min(1) });

router.post('/login', validateBody(loginSchema), async (req, res) => {
  const { email, phone, password } = req.body;

  if ((!email && !phone) || !password) {
    return res.status(400).json(failure('Email or phone and password are required'));
  }

  const user = email ? await userRepo.findByEmail(email) : await userRepo.findByPhone(phone);
  const passwordValid = user && user.password ? verifyPassword(password, user.password) : false;
  if (!user || !user.password || !passwordValid || !isSupportedRole(user.role)) {
    return res.status(401).json(failure('Invalid credentials'));
  }

  const payload = { id: user._id, role: user.role, email: user.email, tokenVersion: user.tokenVersion, restaurantId: user.restaurantId, branchId: user.branchId };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ id: user._id, jti: crypto.randomUUID() });
  await persistRefreshToken(user._id, refreshToken);
  setRefreshCookie(res, refreshToken);
  await recordAudit({ actor: String(user._id), action: 'auth.login', resourceType: 'User', resourceId: String(user._id), ip: req.ip, userAgent: req.get('user-agent') });

  return res.json(
    success(
      {
        user: sanitizeUser(user),
        token: accessToken,
      },
      'Login successful'
    )
  );
});

router.post('/register', validateBody(registerSchema), async (req, res) => {
  const { email, password, firstName, lastName, phone } = req.body;
  if (!email || !password || !firstName || !phone) {
    return res.status(400).json(failure('Required fields are missing'));
  }

  const existing = await userRepo.findByEmail(email);
  if (existing) {
    return res.status(409).json(failure('Email already registered'));
  }

  const hashedPassword = hashPassword(password);
  const tenant = tenantIdsFromRequest(req);
  const newUser = await userRepo.create({
    firstName,
    lastName,
    email,
    phone,
    password: hashedPassword,
    role: 'customer',
    restaurantId: tenant.restaurantId,
    branchId: tenant.branchId,
  });

  const payload = { id: newUser._id, role: newUser.role, email: newUser.email, tokenVersion: newUser.tokenVersion, restaurantId: newUser.restaurantId, branchId: newUser.branchId };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ id: newUser._id, jti: crypto.randomUUID() });
  await persistRefreshToken(newUser._id, refreshToken);
  setRefreshCookie(res, refreshToken);
  await recordAudit({ actor: String(newUser._id), action: 'auth.register', resourceType: 'User', resourceId: String(newUser._id), ip: req.ip, userAgent: req.get('user-agent') });

  return res.status(201).json(
    success(
      {
        user: sanitizeUser(newUser),
        token: accessToken,
      },
      'Registration successful'
    )
  );
});

router.post('/logout', validateBody(z.object({ refreshToken: z.string().min(1).optional() }).strict()), async (req, res) => {
  const refreshToken = getRefreshCookie(req) ?? (process.env.NODE_ENV === 'production' ? undefined : req.body.refreshToken);
  if (refreshToken) {
    await RefreshToken.findOneAndUpdate({ token: hashRefreshToken(refreshToken) }, { revoked: true }).exec();
  }
  clearRefreshCookie(res);
  await recordAudit({ action: 'auth.logout', resourceType: 'Session', ip: req.ip, userAgent: req.get('user-agent') });
  return res.json(success(null, 'Logged out successfully'));
});

router.post('/refresh', validateBody(z.object({ refreshToken: z.string().min(1).optional() }).strict()), async (req, res) => {
  const refreshToken = getRefreshCookie(req) ?? (process.env.NODE_ENV === 'production' ? undefined : req.body.refreshToken);
  if (!refreshToken) {
    return res.status(400).json(failure('Refresh token is required'));
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const stored = await RefreshToken.findOneAndUpdate(
      { token: hashRefreshToken(refreshToken), revoked: false, expiresAt: { $gt: new Date() } },
      { $set: { revoked: true, revokedAt: new Date() } },
      { new: true }
    ).exec();
    if (!stored) {
      await RefreshToken.updateMany({ user: String(payload.id), revoked: false }, { $set: { revoked: true, revokedAt: new Date() } }).exec();
      return res.status(401).json(failure('Invalid refresh token'));
    }

    const user = await userRepo.findById(String(payload.id));
    if (!user || !isSupportedRole(user.role) || user.status !== 'active') return res.status(401).json(failure('Invalid refresh token'));

    const newRefreshToken = signRefreshToken({ id: user._id, jti: crypto.randomUUID() });
    await persistRefreshToken(user._id, newRefreshToken);
    setRefreshCookie(res, newRefreshToken);
    const accessToken = signAccessToken({ id: user._id, role: user.role, email: user.email, tokenVersion: user.tokenVersion, restaurantId: user.restaurantId, branchId: user.branchId });
    await recordAudit({ actor: String(user._id), action: 'auth.refresh', resourceType: 'Session', resourceId: String(stored._id), ip: req.ip, userAgent: req.get('user-agent') });

    return res.json(success({ token: accessToken }, 'Token refreshed'));
  } catch (err) {
    return res.status(401).json(failure('Invalid refresh token'));
  }
});

router.post('/forgot-password', validateBody(forgotSchema), async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json(failure('Email is required'));
  }

  const user = await userRepo.findByEmail(email);
  if (!user) return res.json(success(null, 'If the account exists, reset instructions will be sent'));

  const token = crypto.randomBytes(20).toString('hex');
  await userRepo.update(String(user._id), { resetToken: hashResetToken(token), resetTokenExpires: new Date(Date.now() + 60 * 60 * 1000) });

  try {
    const resetLink = `${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/reset-password?token=${token}&email=${encodeURIComponent(
      user.email
    )}`;
    await sendEmail(user.email, 'Password reset', `<p>Reset your password: <a href="${resetLink}">Reset</a></p>`);
  } catch (err) {
    // ignore email errors for now
    console.error('Failed sending reset email', err);
  }

  return res.json(success(null, 'If the account exists, reset instructions will be sent'));
});

router.post('/reset-password', validateBody(resetSchema), async (req, res) => {
  const { email, token, password } = req.body;
  if (!email || !token || !password) {
    return res.status(400).json(failure('Email, token, and password are required'));
  }

  const user = await userRepo.findByEmail(email);
  if (!user) {
    return res.status(400).json(failure('Invalid or expired reset token'));
  }

  if (!user.resetToken || user.resetToken !== hashResetToken(token) || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
    return res.status(400).json(failure('Invalid or expired reset token'));
  }

  const updated = await User.findOneAndUpdate(
    { _id: user._id, resetToken: hashResetToken(token), resetTokenExpires: { $gt: new Date() } },
    { password: hashPassword(password), $inc: { tokenVersion: 1 }, $unset: { resetToken: 1, resetTokenExpires: 1 } },
    { new: true }
  ).exec();
  if (!updated) return res.status(400).json(failure('Invalid or expired reset token'));
  await RefreshToken.updateMany({ user: user._id, revoked: false }, { revoked: true }).exec();
  await recordAudit({ actor: String(user._id), action: 'auth.password_reset', resourceType: 'User', resourceId: String(user._id), ip: req.ip, userAgent: req.get('user-agent') });

  return res.json(success(null, 'Password updated successfully'));
});

router.post('/verify-otp', validateBody(verifyOtpSchema), async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json(failure('Email and OTP are required'));
  }

  const user = await userRepo.findByEmail(email);
  if (!user) {
    return res.status(400).json(failure('Invalid or expired OTP'));
  }

  if (user.resetToken !== hashResetToken(otp) || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
    return res.status(400).json(failure('Invalid or expired OTP'));
  }

  return res.json(success(null, 'OTP verified successfully'));
});

export default router;
