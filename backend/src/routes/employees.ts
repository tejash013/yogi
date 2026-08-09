import { Router } from 'express';
import { employees } from '../data/mockData.js';
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
  return res.json(paginate(employees, page, limit));
});

router.get('/:id', (req, res) => {
  const employee = employees.find((item) => item.id === req.params.id);
  if (!employee) {
    return res.status(404).json(failure('Employee not found'));
  }

  return res.json(success(employee, 'Employee loaded'));
});

export default router;
