const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: String, enum: ['gmail', 'slack', 'discord', 'google-sheets', 'openrouter', 'gemini'], required: true },
  isConnected: { type: Boolean, default: false },
  scopes: { type: [String], default: [] },
  encryptedTokens: { type: String }, // Stores IV and encrypted text
  expiresAt: { type: Date }
}, { timestamps: true });

// Compound index to ensure one provider per user
integrationSchema.index({ owner: 1, provider: 1 }, { unique: true });

module.exports = mongoose.model('Integration', integrationSchema);
