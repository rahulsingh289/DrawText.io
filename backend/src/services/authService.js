import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { config } from '../config/environment.js';

export class AuthService {
  static async register({ name, email, password }) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new Error('An account with this email already exists');
    }
    const user = await User.create({ name, email, password });
    const token = this.generateToken(user._id);
    return { user: this.sanitizeUser(user), token };
  }

  static async login({ email, password }) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error('Invalid email or password');
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }
    const token = this.generateToken(user._id);
    return { user: this.sanitizeUser(user), token };
  }

  static async getMe(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) throw new Error('User not found');
    return this.sanitizeUser(user);
  }

  static async updateTier(userId, tier) {
    const user = await User.findByIdAndUpdate(
      userId,
      { tier, accountStatus: `${tier.toUpperCase().replace('_', ' ')} Member` },
      { new: true }
    ).select('-password');
    return this.sanitizeUser(user);
  }

  static generateToken(userId) {
    return jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  }

  static sanitizeUser(user) {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      tier: user.tier,
      accountStatus: user.accountStatus || 'Pro Member',
      createdAt: user.createdAt
    };
  }
}
