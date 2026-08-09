import { Router } from 'express';
import { menuItems } from '../data/mockData.js';
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
  const q = String(req.query.q ?? '').toLowerCase();

  const filtered = q
    ? menuItems.filter((item) => item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q))
    : menuItems;

  return res.json(paginate(filtered, page, limit));
});

router.get('/popular', (_req, res) => {
  return res.json(success(menuItems.filter((item) => item.isPopular), 'Popular menu items loaded'));
});

router.get('/recommended', (_req, res) => {
  return res.json(success(menuItems.filter((item) => item.isRecommended), 'Recommended items loaded'));
});

router.get('/search', (req, res) => {
  const q = String(req.query.q ?? '').toLowerCase();
  if (!q) {
    return res.status(400).json(failure('Search query is required'));
  }

  const results = menuItems.filter((item) => item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q));
  return res.json(paginated(results, results.length, 1, results.length));
});

router.get('/:id', (req, res) => {
  const item = menuItems.find((menu) => menu.id === req.params.id);
  if (!item) {
    return res.status(404).json(failure('Menu item not found'));
  }

  return res.json(success(item, 'Menu item loaded'));
});

export default router;
