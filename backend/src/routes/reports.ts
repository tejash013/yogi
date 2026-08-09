import { Router } from 'express';
import { success } from '../utils/response.js';

const router = Router();

router.get('/sales', (req, res) => {
  const { startDate, endDate } = req.query;
  return res.json(
    success(
      { startDate, endDate, totalSales: 19234.5, currency: 'USD' },
      'Sales report loaded'
    )
  );
});

router.get('/revenue', (req, res) => {
  const { startDate, endDate } = req.query;
  return res.json(
    success(
      { startDate, endDate, totalRevenue: 13500.0, currency: 'USD' },
      'Revenue report loaded'
    )
  );
});

router.get('/expenses', (req, res) => {
  const { startDate, endDate } = req.query;
  return res.json(
    success(
      { startDate, endDate, totalExpenses: 5700.0, currency: 'USD' },
      'Expenses report loaded'
    )
  );
});

export default router;
