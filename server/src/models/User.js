const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    select: false, // Do not return by default
  },
  role: {
    type: String,
    enum: ['admin', 'operator'],
    default: 'operator',
  },
  lastLogin: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
