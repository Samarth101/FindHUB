const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { jwtSecret, jwtExpiry } = require('../config/env');

function signToken(userId, role) {
  return jwt.sign({ id: userId, role }, jwtSecret, { expiresIn: jwtExpiry });
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password, phone } = req.body
    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ message: 'Email already registered.' })
    const user = new User({ name, email, passwordHash: password, phone })
    await user.save()
    const token = signToken(user._id, user.role)
    res.status(201).json({ token, user })
  } catch (err) {
    next(err)
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email }).select('+passwordHash')
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }
    if (user.isBanned) {
      return res.status(403).json({ message: 'Account suspended. Contact admin.' })
    }
    const token = signToken(user._id, user.role)
    res.json({ token, user })
  } catch (err) {
    next(err)
  }
}

// GET /api/auth/me
async function me(req, res) {
  res.json({ user: req.user })
}

// POST /api/auth/logout
async function logout(req, res) {
  res.json({ message: 'Logged out.' })
}

// PUT /api/auth/profile
async function updateProfile(req, res, next) {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true, runValidators: true }
    )
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me, logout, updateProfile }