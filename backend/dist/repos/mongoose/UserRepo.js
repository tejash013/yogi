import User from '../../models/User.js';
class UserRepo {
    async findByEmail(email) {
        return User.findOne({ email }).exec();
    }
    async findByPhone(phone) {
        return User.findOne({ phone }).exec();
    }
    async create(data) {
        const u = new User(data);
        await u.save();
        return u;
    }
    async findById(id) {
        return User.findById(id).exec();
    }
    async update(id, update) {
        return User.findByIdAndUpdate(id, update, { new: true }).exec();
    }
}
export default new UserRepo();
