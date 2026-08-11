import crypto from 'crypto';
import { Router } from 'express';
import User from '../models/User.js';
import { failure, success } from '../utils/response.js';

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
  return sanitized;
}

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json(failure('Email and password are required'));
  }

  const user = await User.findOne({ email }).exec();
  if (!user || !user.password || !verifyPassword(password, user.password)) {
    return res.status(401).json(failure('Invalid credentials'));
  }

  return res.json(
    success(
      {
        user: sanitizeUser(user),
        token: `token-${crypto.randomUUID()}`,
        refreshToken: `refresh-${crypto.randomUUID()}`,
      },
      'Login successful'
    )
  );
});

router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName, phone, role } = req.body;
  if (!email || !password || !firstName || !lastName || !phone) {
    return res.status(400).json(failure('Required fields are missing'));
  }

  const existing = await User.findOne({ email }).exec();
  if (existing) {
    return res.status(409).json(failure('Email already registered'));
  }

  const hashedPassword = hashPassword(password);
  const newUser = new User({
    firstName,
    lastName,
    email,
    phone,
    password: hashedPassword,
    role: role || 'customer',
  });

  await newUser.save();

  return res.status(201).json(
    success(
      {
        user: sanitizeUser(newUser),
        token: `token-${crypto.randomUUID()}`,
        refreshToken: `refresh-${crypto.randomUUID()}`,
      },
      'Registration successful'
    )
  );
});

router.post('/logout', (_req, res) => {
  return res.json(success(null, 'Logged out successfully'));
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json(failure('Refresh token is required'));
  }

  return res.json(success({ token: `token-${crypto.randomUUID()}` }, 'Token refreshed'));
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json(failure('Email is required'));
  }

  const user = await User.findOne({ email }).exec();
  if (!user) {
    return res.status(404).json(failure('Account not found'));
  }

  return res.json(success(null, 'Password reset instructions sent'));
});

router.post('/reset-password', async (req, res) => {
  const { email, token, password } = req.body;
  if (!email || !token || !password) {
    return res.status(400).json(failure('Email, token, and password are required'));
  }

  const user = await User.findOne({ email }).exec();
  if (!user) {
    return res.status(404).json(failure('Account not found'));
  }

  user.password = hashPassword(password);
  await user.save();

  return res.json(success(null, 'Password updated successfully'));
});

router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json(failure('Email and OTP are required'));
  }

  const user = await User.findOne({ email }).exec();
  if (!user) {
    return res.status(404).json(failure('Account not found'));
  }

  return res.json(success(null, 'OTP verified successfully'));
});

export default router;
