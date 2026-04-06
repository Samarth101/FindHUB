const mongoose = require('mongoose');
const { mongoUri } = require('./env');

let isConnected = false;
async function connectDB() {
  if (isConnected) return
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('database connected');
  } catch (err) {
    console.error('Database connection failed:', err.message);
    throw err;
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('Database disconnected');
  isConnected = false;
});

module.exports = { connectDB };
