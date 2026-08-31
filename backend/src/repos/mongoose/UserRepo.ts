import User from '../../models/User.js';
import type { IUserRepo } from '../interfaces.js';

class UserRepo implements IUserRepo {
  async findByEmail(email: string) {
    return User.findOne({ email }).exec();
  }

  async findByPhone(phone: string) {
    return User.findOne({ phone }).exec();
  }

  async create(data: any) {
    const u = new User(data);
    await u.save();
    return u;
  }

  async findById(id: string) {
    return User.findById(id).exec();
  }

  async update(id: string, update: any) {
    return User.findByIdAndUpdate(id, update, { new: true }).exec();
  }
}

export default new UserRepo();
