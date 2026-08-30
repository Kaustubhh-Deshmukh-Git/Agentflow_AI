const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const mongoose = require('mongoose');

// In-memory fallback if MongoDB is not connected
const memoryUsers = [];

class AuthService {
  static async register({ name, email, password }) {
    // Check in-memory store if DB is down
    if (mongoose.connection.readyState !== 1) {
      if (memoryUsers.find(u => u.email === email)) {
        throw new Error('User already exists');
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = { _id: Date.now().toString(), name, email, password: hashedPassword, role: 'operator' };
      memoryUsers.push(newUser);
      return this.generateToken(newUser);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return this.generateToken(user);
  }

  static async login({ email, password }) {
    let user;
    if (mongoose.connection.readyState !== 1) {
      user = memoryUsers.find(u => u.email === email);
      if (!user) throw new Error('Invalid credentials');
    } else {
      user = await User.findOne({ email }).select('+password');
      if (!user) throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');

    if (mongoose.connection.readyState === 1) {
      user.lastLogin = new Date();
      await user.save();
    }

    return this.generateToken(user);
  }

  static async getProfile(userId) {
    if (mongoose.connection.readyState !== 1) {
      const user = memoryUsers.find(u => u._id === userId);
      if (!user) throw new Error('User not found');
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    return user;
  }

  static generateToken(user) {
    return jwt.sign({ id: user._id, role: user.role }, env.JWT_SECRET, {
      expiresIn: '7d',
    });
  }
}

module.exports = AuthService;
