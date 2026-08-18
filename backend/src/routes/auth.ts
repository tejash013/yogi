import crypto from 'crypto';
import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate.js';
import { userRepo } from '../repos/index.js';
import RefreshToken from '../models/RefreshToken.js';
import { failure, success } from '../utils/response.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { sendEmail } from '../utils/email.js';

const router = Router();

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

function sanitizeUser(user: any) {
  const sanitized = user.toObject ? user.toObject() : { ...user };
  delete sanitized.password;
  delete sanitized.resetToken;
  delete sanitized.resetTokenExpires;
  return sanitized;
}

async function persistRefreshToken(userId: any, token: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const rt = new RefreshToken({ token, user: userId, expiresAt });
  await rt.save();
}

const nameRegex = /^[A-Za-z][A-Za-z\s'\-]{0,}$/;
const phoneRegex = /^\+?[0-9\s\-]{7,15}$/;
const localPartHasLetter = (email: string) => {
  const parts = email.split('@');
  return parts.length === 2 && /[A-Za-z]/.test(parts[0]);
};

const loginSchema = z.object({ email: z.string().email().refine(localPartHasLetter, { message: 'Invalid email' }), password: z.string().min(1) });
const registerSchema = z.object({
  email: z.string().email().refine(localPartHasLetter, { message: 'Invalid email' }),
  password: z.string().min(6),
  firstName: z.string().min(1).regex(nameRegex, { message: 'First name must contain only letters, spaces, hyphens or apostrophes' }),
  lastName: z.string().min(1).regex(nameRegex, { message: 'Last name must contain only letters, spaces, hyphens or apostrophes' }),
  phone: z.string().regex(phoneRegex, { message: 'Invalid phone number' }),
  role: z.string().optional(),
});
const forgotSchema = z.object({ email: z.string().email().refine(localPartHasLetter, { message: 'Invalid email' }) });
const resetSchema = z.object({ email: z.string().email().refine(localPartHasLetter, { message: 'Invalid email' }), token: z.string().min(1), password: z.string().min(6) });
const verifyOtpSchema = z.object({ email: z.string().email().refine(localPartHasLetter, { message: 'Invalid email' }), otp: z.string().min(1) });

router.post('/login', validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json(failure('Email and password are required'));
  }

  const user = await userRepo.findByEmail(email);
  console.log('DEBUG login - user found:', Boolean(user));
  console.log('DEBUG login - stored password present:', Boolean(user && user.password));
  const passwordValid = user && user.password ? verifyPassword(password, user.password) : false;
  console.log('DEBUG login - password valid:', passwordValid);
  if (!user || !user.password || !passwordValid) {
    return res.status(401).json(failure('Invalid credentials'));
  }

  const payload = { id: user._id, role: user.role, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ id: user._id });
  await persistRefreshToken(user._id, refreshToken);

  return res.json(
    success(
      {
        user: sanitizeUser(user),
        token: accessToken,
        refreshToken,
      },
      'Login successful'
    )
  );
});

router.post('/register', validateBody(registerSchema), async (req, res) => {
  const { email, password, firstName, lastName, phone, role } = req.body;
  if (!email || !password || !firstName || !lastName || !phone) {
    return res.status(400).json(failure('Required fields are missing'));
  }

  const existing = await userRepo.findByEmail(email);
  if (existing) {
    return res.status(409).json(failure('Email already registered'));
  }

  const hashedPassword = hashPassword(password);
  const newUser = await userRepo.create({
    firstName,
    lastName,
    email,
    phone,
    password: hashedPassword,
    role: role || 'customer',
  });

  const payload = { id: newUser._id, role: newUser.role, email: newUser.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ id: newUser._id });
  await persistRefreshToken(newUser._id, refreshToken);

  return res.status(201).json(
    success(
      {
        user: sanitizeUser(newUser),
        token: accessToken,
        refreshToken,
      },
      'Registration successful'
    )
  );
});

router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await RefreshToken.findOneAndUpdate({ token: refreshToken }, { revoked: true }).exec();
  }
  return res.json(success(null, 'Logged out successfully'));
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json(failure('Refresh token is required'));
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const stored = await RefreshToken.findOne({ token: refreshToken, revoked: false }).exec();
    if (!stored) return res.status(401).json(failure('Invalid refresh token'));

    // rotate
    stored.revoked = true;
    await stored.save();

    const newRefreshToken = signRefreshToken({ id: payload.id });
    await persistRefreshToken(payload.id, newRefreshToken);
    const accessToken = signAccessToken({ id: payload.id, role: payload.role });

    return res.json(success({ token: accessToken, refreshToken: newRefreshToken }, 'Token refreshed'));
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
  if (!user) {
    return res.status(404).json(failure('Account not found'));
  }

  const token = crypto.randomBytes(20).toString('hex');
  await userRepo.update(String(user._id), { resetToken: token, resetTokenExpires: new Date(Date.now() + 60 * 60 * 1000) });

  try {
    const resetLink = `${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/reset-password?token=${token}&email=${encodeURIComponent(
      user.email
    )}`;
    await sendEmail(user.email, 'Password reset', `<p>Reset your password: <a href="${resetLink}">Reset</a></p>`);
  } catch (err) {
    // ignore email errors for now
    console.error('Failed sending reset email', err);
  }

  return res.json(success(null, 'Password reset instructions sent'));
});

router.post('/reset-password', validateBody(resetSchema), async (req, res) => {
  const { email, token, password } = req.body;
  if (!email || !token || !password) {
    return res.status(400).json(failure('Email, token, and password are required'));
  }

  const user = await userRepo.findByEmail(email);
  if (!user) {
    return res.status(404).json(failure('Account not found'));
  }

  if (!user.resetToken || user.resetToken !== token || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
    return res.status(400).json(failure('Invalid or expired reset token'));
  }

  await userRepo.update(String(user._id), { password: hashPassword(password), resetToken: undefined, resetTokenExpires: undefined });

  return res.json(success(null, 'Password updated successfully'));
});

router.post('/verify-otp', validateBody(verifyOtpSchema), async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json(failure('Email and OTP are required'));
  }

  const user = await userRepo.findByEmail(email);
  if (!user) {
    return res.status(404).json(failure('Account not found'));
  }

  if (user.resetToken !== otp || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
    return res.status(400).json(failure('Invalid or expired OTP'));
  }

  return res.json(success(null, 'OTP verified successfully'));
});

export default router;
