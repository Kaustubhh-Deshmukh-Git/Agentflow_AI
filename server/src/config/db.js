const mongoose = require('mongoose');
const dns = require('dns');
const env = require('./env');

// Set reliable public DNS resolvers to prevent Windows/ISP querySrv ECONNREFUSED issues with mongodb+srv://
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (_) {
  // If in restricted environment, continue with system defaults
}

const connectDB = async () => {
  if (!env.MONGODB_URI) {
    console.warn('\n⚠️  No MONGODB_URI provided in environment.');
    console.warn('   Operating in in-memory fallback mode (data stored in memory for testing).\n');
    return;
  }

  try {
    console.log('🔄 Connecting to MongoDB Cloud / Atlas...');
    
    // Connection options optimized for MongoDB Atlas and cloud hosting
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${mongoose.connection.host} (DB: ${mongoose.connection.name})`);
  } catch (error) {
    console.error('❌ MongoDB Cloud Connection Error:', error.message);
    console.warn('   Falling back to in-memory mode so the server remains functional.\n');
  }

  // Monitor connection lifecycle events
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected. Attempting auto-reconnect...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected successfully.');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB runtime error:', err.message);
  });
};

module.exports = connectDB;
