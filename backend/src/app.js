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
} from './routes/index.js';
import { checkDbConnection } from './db.js';
import { errorHandler } from './middleware/errorHandler.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pinoHttp = require('pino-http');
const logger = pinoHttp();

export const app = express();
app.use(logger);
app.use(helmet());
app.use(cors({ origin: true }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/db-health', async (_req, res) => {
  try {
    await checkDbConnection();
    res.json({ status: 'ok', db: 'connected' });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      db: 'disconnected',
      message: error instanceof Error ? error.message : 'Database health check failed',
    });
  }
});

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

app.use((_req, res) => {
  res.status(404).json({ success: false, data: null, message: 'Endpoint not found' });
});

app.use(errorHandler);
