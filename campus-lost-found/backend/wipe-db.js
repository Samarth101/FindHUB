const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/campus-lost-found';

async function wipe() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    
    const collections = ['lostreports', 'founditems', 'matches', 'claims', 'notifications', 'communitythreads', 'messages'];
    
    for (const col of collections) {
      try {
        await mongoose.connection.db.dropCollection(col);
        console.log(`Dropped collection: ${col}`);
      } catch (e) {
        console.log(`Collection ${col} not found or already dropped`);
      }
    }
    
    console.log('Database wipe complete. Ready for new AI-powered schema.');
    process.exit(0);
  } catch (err) {
    console.error('Wipe failed:', err);
    process.exit(1);
  }
}

wipe();
