import { Router } from 'express';
import { users } from '../data/mockData.js';
import { failure, success } from '../utils/response.js';

const router = Router();

function generateToken(id: string) {
  return `token-${id}-${Date.now()}`;
}

function sanitizeUser(user: any) {
  const { password, ...rest } = user;
  return rest;
}

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = users.find((item) => item.email === email && item.password === password);
  if (!user) {
    return res.status(401).json(failure('Invalid credentials'));
  }

  return res.json(
    success({ user: sanitizeUser(user), token: generateToken(user.id), refreshToken: generateToken(user.id + '-refresh') }, 'Login successful')
  );
});

router.post('/register', (req, res) => {
  const { email, password, firstName, lastName, phone } = req.body;
  const existing = users.find((item) => item.email === email);

  if (existing) {
    return res.status(409).json(failure('Email already registered'));
  }

  const newUser = {
    id: `u${users.length + 1}`,
    firstName,
    lastName,
    email,
    phone,
    password,
    role: 'customer',
  };

  users.push(newUser);
  return res.status(201).json(
    success({ user: sanitizeUser(newUser), token: generateToken(newUser.id), refreshToken: generateToken(newUser.id + '-refresh') }, 'Registration successful')
  );
});

router.post('/logout', (_req, res) => {
  return res.json(success(null, 'Logged out successfully'));
});

router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json(failure('Refresh token is required'));
  }

  return res.json(success({ token: generateToken('refreshed') }, 'Token refreshed'));
});

router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  const user = users.find((item) => item.email === email);
  if (!user) {
    return res.status(404).json(failure('Account not found'));
  }

  return res.json(success(null, 'Password reset instructions sent'));
});

router.post('/reset-password', (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json(failure('Token and new password are required'));
  }

  return res.json(success(null, 'Password updated successfully'));
});

router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json(failure('Email and OTP are required'));
  }

  return res.json(success(null, 'OTP verified successfully'));
});

export default router;
