import { Router } from 'express';
import Table from '../models/Table.js';
import { paginated, success, failure } from '../utils/response.js';

const router = Router();

function paginate(items: any[], page: number, limit: number) {
  const start = (page - 1) * limit;
  return paginated(items.slice(start, start + limit), items.length, page, limit);
}

router.get('/', async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const status = String(req.query.status ?? '').trim();

  const filter: any = {};
  if (status) filter.status = status;

  const total = await Table.countDocuments(filter).exec();
  const tables = await Table.find(filter)
    .sort({ label: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();

  return res.json(paginate(tables, page, limit));
});

router.get('/:id', async (req, res) => {
  const table = await Table.findById(req.params.id).exec();
  if (!table) {
    return res.status(404).json(failure('Table not found'));
  }

  return res.json(success(table, 'Table loaded'));
});

router.post('/', async (req, res) => {
  const { label, status, capacity, location, notes } = req.body;
  if (!label || !capacity) {
    return res.status(400).json(failure('Label and capacity are required'));
  }

  const table = new Table({
    label,
    status: status || 'available',
    capacity,
    location,
    notes,
  });
  await table.save();

  return res.status(201).json(success(table, 'Table created successfully'));
});

router.patch('/:id', async (req, res) => {
  const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();
  if (!table) {
    return res.status(404).json(failure('Table not found'));
  }

  return res.json(success(table, 'Table updated successfully'));
});

router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json(failure('Status is required'));
  }

  const table = await Table.findByIdAndUpdate(req.params.id, { status }, { new: true }).exec();
  if (!table) {
    return res.status(404).json(failure('Table not found'));
  }

  return res.json(success(table, 'Table status updated successfully'));
});

router.delete('/:id', async (req, res) => {
  const table = await Table.findByIdAndDelete(req.params.id).exec();
  if (!table) {
    return res.status(404).json(failure('Table not found'));
  }

  return res.json(success(table, 'Table deleted successfully'));
});

export default router;
