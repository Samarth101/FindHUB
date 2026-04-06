const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES, ALL_ROLES } = require('../constants/roles');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  phone: { type: String, trim: true, default: '' },
  role: { type: String, enum: ALL_ROLES, default: ROLES.STUDENT },
  avatar: { type: String, default: '' },
  isBanned: { type: Boolean, default: false },
  banReason: { type: String, default: '' },
  lostCount: { type: Number, default: 0 },
  foundCount: { type: Number, default: 0 },
  returnedCount: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if(!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.set('toJSON', {
  transform: (_, obj) => {
    delete obj.passwordHash;
    delete obj.__v;
    return obj;
  },
});

module.exports = mongoose.model('User', userSchema);
