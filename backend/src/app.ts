import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import {
  authRouter,
  categoriesRouter,
  employeesRouter,
  inventoryRouter,
  invoicesRouter,
  menuRouter,
  offersRouter,
  ordersRouter,
  reportsRouter,
  schemaRouter,
  settingsRouter,
  tablesRouter,
  usersRouter,
} from './routes/index.js';
import { checkDbConnection } from './db.js';
import { errorHandler } from './middleware/errorHandler.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createRequire } from 'module';
import { randomUUID } from 'crypto';
import { logger as appLogger } from './utils/logger.js';
import paymentWebhookRouter from './routes/paymentWebhook.js';
import tenantsRouter from './routes/tenants.js';

// pino-http is a CommonJS module; use createRequire to import it in ESM runtime
const require = createRequire(import.meta.url);
const pinoHttp = require('pino-http') as any;
const logger = pinoHttp({
  logger: appLogger,
  genReqId: (req: any, res: any) => {
    const requestId = req.headers['x-request-id'] || randomUUID();
    res.setHeader('x-request-id', requestId);
    return requestId;
  },
  redact: ['req.headers.authorization', 'req.headers.cookie', 'res.headers.set-cookie'],
});

export const app = express();
// Security and parsing middleware
app.set('trust proxy', 1);
app.use(logger);
app.use(helmet());
const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  'http://127.0.0.1:5176',
  'http://localhost:3000',
];
const allowedOrigins = (process.env.FRONTEND_URL ?? defaultAllowedOrigins.join(','))
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed'));
  },
  credentials: true,
}));
app.use('/api/payments/webhook', express.raw({ type: 'application/json', limit: '1mb' }), paymentWebhookRouter);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
const isDev = process.env.NODE_ENV !== 'production';

const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.GLOBAL_RATE_LIMIT_MAX ?? (isDev ? 50000 : 3000)),
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      data: null,
      message: 'Too many requests. Please wait a moment and try again.',
      errors: [],
    });
  },
});
app.use(generalRateLimit);

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX ?? (isDev ? 5000 : 50)),
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    const identifier = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : 'anonymous';
    return `${req.ip}:${identifier}`;
  },
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      data: null,
      message: 'Too many authentication attempts. Please try again later.',
      errors: [],
    });
  },
  message: { success: false, data: null, message: 'Too many authentication attempts. Please try again later.', errors: [] },
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'restaurantos-backend' });
});

app.get('/ready', async (_req, res) => {
  try {
    await checkDbConnection();
    res.json({ status: 'ready', database: 'ok' });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      message: 'Database health check failed',
    });
  }
});

app.get('/db-health', (_req, res) => res.redirect(307, '/ready'));

app.use('/api/auth/login', authRateLimit);
app.use('/api/auth/register', authRateLimit);
app.use('/api/auth/forgot-password', authRateLimit);
app.use('/api/auth/reset-password', authRateLimit);
app.use('/api/auth/verify-otp', authRateLimit);
app.use('/api/auth', authRouter);
app.use('/api/menu', menuRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/tables', tablesRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/offers', offersRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/schema', schemaRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/users', usersRouter);
app.use('/api/tenants', tenantsRouter);

app.use((_req, res) => {
  res.status(404).json({ success: false, data: null, message: 'Endpoint not found' });
});

// Central error handler
app.use(errorHandler);
