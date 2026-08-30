const crypto = require('crypto');
const env = require('../config/env');
const Integration = require('../models/Integration');
const mongoose = require('mongoose');

// Spec requires encryption at rest using CREDENTIAL_ENCRYPTION_KEY (must be 32 bytes hex)
const ENCRYPTION_KEY = env.CREDENTIAL_ENCRYPTION_KEY 
  ? Buffer.from(env.CREDENTIAL_ENCRYPTION_KEY, 'hex') 
  : crypto.randomBytes(32); // Fallback for dev only
const ALGORITHM = 'aes-256-gcm';

class IntegrationService {
  static encrypt(text) {
    if (!text) return null;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${encrypted}:${authTag}`;
  }

  static decrypt(encryptedData) {
    if (!encryptedData) return null;
    const parts = encryptedData.split(':');
    if (parts.length !== 3) return null;
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const authTag = Buffer.from(parts[2], 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  static async saveCredentials(userId, provider, tokens) {
    const encryptedTokens = this.encrypt(JSON.stringify(tokens));
    
    if (mongoose.connection.readyState === 1) {
      await Integration.findOneAndUpdate(
        { owner: userId, provider },
        { 
          isConnected: true, 
          encryptedTokens,
          expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null
        },
        { upsert: true, returnDocument: 'after', new: true }
      );
    }
  }

  static async getCredentials(userId, provider) {
    if (mongoose.connection.readyState !== 1) return null;
    
    const integration = await Integration.findOne({ owner: userId, provider });
    if (!integration || !integration.isConnected || !integration.encryptedTokens) {
      throw new Error('INTEGRATION_NOT_CONNECTED');
    }

    if (integration.expiresAt && new Date() > integration.expiresAt) {
      // In a real app we would use the refresh token here
      throw new Error('AUTH_EXPIRED');
    }

    return JSON.parse(this.decrypt(integration.encryptedTokens));
  }

  static async getStatus(userId) {
    const providers = ['gmail', 'slack', 'discord', 'google-sheets'];
    const statuses = {};
    
    if (mongoose.connection.readyState === 1) {
      const integrations = await Integration.find({ owner: userId });
      for (const p of providers) {
        const found = integrations.find(i => i.provider === p);
        statuses[p] = found ? found.isConnected : false;
      }
    } else {
      providers.forEach(p => statuses[p] = false);
    }
    
    return statuses;
  }
}

module.exports = IntegrationService;
