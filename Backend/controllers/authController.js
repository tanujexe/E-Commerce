import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.generateToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      address: user.address,
    },
  });
};

// ─── @POST /api/auth/register ─────────────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
  console.log('REGISTER HIT', req.method, req.originalUrl);
  console.log('BODY', req.body);

  const { name, email, password } = req.body;

  if (!name?.trim()) {
    res.status(400);
    throw new Error('Name is required');
  }

  if (!email?.trim() || !/\S+@\S+\.\S+/.test(email)) {
    res.status(400);
    throw new Error('Enter a valid email');
  }

  if (!password || password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  try {
    console.log('CREATING USER', { name, email });
    const user = await User.create({ name, email, password });
    console.log('USER CREATED', user._id);
    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error('USER CREATE ERROR', err);
    throw err;
  }
});

// ─── @POST /api/auth/login ────────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !/\S+@\S+\.\S+/.test(email)) {
    res.status(400);
    throw new Error('Enter a valid email');
  }

  if (!password) {
    res.status(400);
    throw new Error('Password is required');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('Your account has been deactivated. Contact support.');
  }

  sendTokenResponse(user, 200, res);
});

// ─── @GET /api/auth/me ────────────────────────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
});

// ─── @PUT /api/auth/profile ───────────────────────────────────────────────────
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.name = req.body.name || user.name;
  user.phone = req.body.phone || user.phone;

  if (req.body.address) {
    user.address = { ...user.address.toObject?.() || user.address, ...req.body.address };
  }

  // Update password if provided
  if (req.body.newPassword) {
    if (!req.body.currentPassword) {
      res.status(400);
      throw new Error('Current password is required to set a new password');
    }
    const fullUser = await User.findById(req.user._id).select('+password');
    const isMatch = await fullUser.matchPassword(req.body.currentPassword);
    if (!isMatch) {
      res.status(401);
      throw new Error('Current password is incorrect');
    }
    user.password = req.body.newPassword;
  }

  await user.save();
  sendTokenResponse(user, 200, res);
});