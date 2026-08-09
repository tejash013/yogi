import { Router } from 'express';
import { categories } from '../data/mockData.js';
import { success, failure } from '../utils/response.js';

const router = Router();

router.get('/', (_req, res) => {
  return res.json(success(categories, 'Categories loaded'));
});

router.get('/:id', (req, res) => {
  const category = categories.find((item) => item.id === req.params.id);
  if (!category) {
    return res.status(404).json(failure('Category not found'));
  }

  return res.json(success(category, 'Category loaded'));
});

export default router;
