import { Router } from 'express';
import { invoices } from '../data/mockData.js';
import { paginated, success, failure } from '../utils/response.js';

const router = Router();

function paginate(items: any[], page: number, limit: number) {
  const start = (page - 1) * limit;
  const data = items.slice(start, start + limit);
  return paginated(data, items.length, page, limit);
}

router.get('/', (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  return res.json(paginate(invoices, page, limit));
});

router.get('/:id', (req, res) => {
  const invoice = invoices.find((item) => item.id === req.params.id);
  if (!invoice) {
    return res.status(404).json(failure('Invoice not found'));
  }

  return res.json(success(invoice, 'Invoice loaded'));
});

export default router;
