const mongoose = require('mongoose');
const User = require('./src/models/User');

async function main() {
  await mongoose.connect('mongodb://localhost:27017/campus-lost-found');
  
  // List existing users
  const users = await User.find().select('name email role');
  console.log('=== Existing Users ===');
  users.forEach(u => console.log(`  ${u.name} | ${u.email} | role: ${u.role}`));
  
  // Check if admin exists
  const admin = await User.findOne({ role: 'admin' });
  if (admin) {
    console.log(`\nAdmin already exists: ${admin.email}`);
  } else {
    // Create admin account
    const newAdmin = new User({
      name: 'Admin',
      email: 'admin@findhub.campus',
      passwordHash: 'admin1234',
      role: 'admin',
    });
    await newAdmin.save();
    console.log('\n=== Admin Created ===');
    console.log('  Email:    admin@findhub.campus');
    console.log('  Password: admin1234');
  }
  
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
