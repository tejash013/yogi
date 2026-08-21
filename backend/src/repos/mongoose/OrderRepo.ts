import Order from '../../models/Order.js';
import type { IOrderRepo } from '../interfaces.js';

class OrderRepo implements IOrderRepo {
  async count(filter: any) {
    return Order.countDocuments(filter).exec();
  }

  async findPaginated(filter: any, page = 1, limit = 10, sort: any = { createdAt: -1 }) {
    const total = await Order.countDocuments(filter).exec();
    const items = await Order.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('table', 'label status')
      .populate('items.menuItem', 'title price image')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return { items, total };
  }

  async findById(id: string, filter: any = {}) {
    return Order.findOne({ _id: id, ...filter })
      .populate('user', 'firstName lastName email')
      .populate('table', 'label status')
      .populate('items.menuItem', 'title price image')
      .exec();
  }

  async create(data: any) {
    const o = new Order(data);
    await o.save();
    return o;
  }

  async updateById(id: string, update: any, filter: any = {}) {
    return Order.findOneAndUpdate({ _id: id, ...filter }, update, { new: true }).exec();
  }

  async findByUser(userId: string, filter: any = {}) {
    return Order.find({ user: userId, ...filter })
      .populate('table', 'label status')
      .populate('items.menuItem', 'title price image')
      .exec();
  }
}

export default new OrderRepo();
