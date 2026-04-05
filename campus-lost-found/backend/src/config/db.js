const mongoose = require('mongoose');
const { mongoUri, nodeEnv } = require('./env');

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('[DB] MongoDB connected:', mongoUri.replace(/\/\/.*@/, '//***@'));
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    if (nodeEnv === 'production') process.exit(1);
    throw err;
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('[DB] MongoDB disconnected');
  isConnected = false;
});

module.exports = { connectDB };
