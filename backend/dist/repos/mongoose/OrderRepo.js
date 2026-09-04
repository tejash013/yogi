import Order from '../../models/Order.js';
class OrderRepo {
    async count(filter) {
        return Order.countDocuments(filter).exec();
    }
    async findPaginated(filter, page = 1, limit = 10, sort = { createdAt: -1 }) {
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
    async findById(id, filter = {}) {
        return Order.findOne({ _id: id, ...filter })
            .populate('user', 'firstName lastName email')
            .populate('table', 'label status')
            .populate('items.menuItem', 'title price image')
            .exec();
    }
    async create(data) {
        const o = new Order(data);
        await o.save();
        return o;
    }
    async updateById(id, update, filter = {}) {
        return Order.findOneAndUpdate({ _id: id, ...filter }, update, { new: true }).exec();
    }
    async findByUser(userId, filter = {}) {
        return Order.find({ user: userId, ...filter })
            .populate('table', 'label status')
            .populate('items.menuItem', 'title price image')
            .exec();
    }
}
export default new OrderRepo();
