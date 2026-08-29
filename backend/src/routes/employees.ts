import { Router } from 'express';
import Employee from '../models/Employee.js';
import { paginated, success, failure } from '../utils/response.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js';
import { employeeCreateSchema, employeeQuerySchema, employeeUpdateSchema, idParamSchema } from '../validation/schemas.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { permissions } from '../auth/permissions.js';
import { tenantFilter } from '../utils/tenant.js';

const router = Router();

function paginate(items: any[], page: number, limit: number) {
  const start = (page - 1) * limit;
  return paginated(items.slice(start, start + limit), items.length, page, limit);
}

router.get('/', authenticate, requirePermission(permissions.employeesRead), validateQuery(employeeQuerySchema), async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const q = String(req.query.q ?? '').trim();
  const filter: any = { ...tenantFilter(req), isActive: true };

  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
      { role: { $regex: q, $options: 'i' } },
    ];
  }

  const employees = await Employee.find(filter)
    .sort({ name: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();

  return res.json(paginate(employees, page, limit));
});

router.get('/:id', authenticate, requirePermission(permissions.employeesRead), validateParams(idParamSchema), async (req, res) => {
  const employee = await Employee.findOne({ _id: req.params.id, ...tenantFilter(req) }).exec();
  if (!employee) {
    return res.status(404).json(failure('Employee not found'));
  }

  return res.json(success(employee, 'Employee loaded'));
});

router.post('/', authenticate, requirePermission(permissions.employeesManage), validateBody(employeeCreateSchema), async (req, res) => {
  const { name, email, phone, role, shift, salary, joiningDate } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json(failure('Name, email, and phone are required'));
  }

  const employee = new Employee({
    ...tenantFilter(req),
    name,
    email,
    phone,
    role,
    shift,
    salary,
    joiningDate,
  });

  await employee.save();
  return res.status(201).json(success(employee, 'Employee created successfully'));
});

router.patch('/:id', authenticate, requirePermission(permissions.employeesManage), validateParams(idParamSchema), validateBody(employeeUpdateSchema), async (req, res) => {
  const employee = await Employee.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req) }, req.body, { new: true }).exec();
  if (!employee) {
    return res.status(404).json(failure('Employee not found'));
  }

  return res.json(success(employee, 'Employee updated successfully'));
});

router.delete('/:id', authenticate, requirePermission(permissions.employeesManage), validateParams(idParamSchema), async (req, res) => {
  const employee = await Employee.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req) }, { isActive: false }, { new: true }).exec();
  if (!employee) {
    return res.status(404).json(failure('Employee not found'));
  }

  return res.json(success(employee, 'Employee deactivated successfully'));
});

export default router;
