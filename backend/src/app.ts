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

export const app = express();

app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
