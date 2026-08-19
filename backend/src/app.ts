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
  tablesRouter,
  usersRouter,
} from './routes/index.js';
import { checkDbConnection } from './db.js';
import { errorHandler } from './middleware/errorHandler.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createRequire } from 'module';

// pino-http is a CommonJS module; use createRequire to import it in ESM runtime
const require = createRequire(import.meta.url);
const pinoHttp = require('pino-http') as any;
const logger = pinoHttp({
  redact: ['req.headers.authorization', 'req.headers.cookie', 'res.headers.set-cookie'],
});

export const app = express();
// Security and parsing middleware
app.set('trust proxy', 1);
app.use(logger);
app.use(helmet());
const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:5173,http://localhost:3000')
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
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX ?? 10),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
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
  res.json({ status: 'ok' });
});

app.get('/db-health', async (_req, res) => {
  try {
    await checkDbConnection();
    res.json({ status: 'ok' });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Database health check failed',
    });
  }
});

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
app.use('/api/users', usersRouter);

app.use((_req, res) => {
  res.status(404).json({ success: false, data: null, message: 'Endpoint not found' });
});

// Central error handler
app.use(errorHandler);
