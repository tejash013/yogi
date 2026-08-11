import { Router } from 'express';
import User from '../models/User.js';
import Category from '../models/Category.js';
import MenuItem from '../models/MenuItem.js';
import Table from '../models/Table.js';
import Order from '../models/Order.js';
import Invoice from '../models/Invoice.js';
import Offer from '../models/Offer.js';
import Employee from '../models/Employee.js';
import Inventory from '../models/Inventory.js';
import { success, failure } from '../utils/response.js';

const router = Router();

router.get('/schema', (_req, res) => {
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
