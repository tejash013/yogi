import { Router } from 'express';
import { success } from '../utils/response.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/schema', authenticate, requireRole('manager'), (_req, res) => {
  return res.json(
    success(
      {
        models: [
          'User',
          'Category',
          'MenuItem',
          'Table',
          'Order',
          'Invoice',
          'Offer',
          'Employee',
          'Inventory',
        ],
        description: 'Mongoose schemas are defined for RestaurantOS entities.',
      },
      'Schema metadata loaded'
    )
  );
});

export default router;
