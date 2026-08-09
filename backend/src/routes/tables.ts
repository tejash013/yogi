import { Router } from 'express';
import { tables } from '../data/mockData.js';
import { success, failure } from '../utils/response.js';

const router = Router();

router.get('/', (_req, res) => {
  return res.json(success(tables, 'Tables loaded'));
});

router.get('/:id', (req, res) => {
  const table = tables.find((item) => item.id === req.params.id);
  if (!table) {
    return res.status(404).json(failure('Table not found'));
  }

  return res.json(success(table, 'Table loaded'));
});

router.patch('/:id/status', (req, res) => {
  const table = tables.find((item) => item.id === req.params.id);
  if (!table) {
    return res.status(404).json(failure('Table not found'));
  }

  table.status = req.body.status ?? table.status;
  return res.json(success(table, 'Table status updated'));
});

export default router;
