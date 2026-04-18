/**
 * User Controller
 * Admin: list, get, update, delete users
 */

import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// ─── @GET /api/users ─── Admin ────────────────────────────────────────────────
export const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(query),
  ]);

  res.json({ success: true, users, page, pages: Math.ceil(total / limit), total });
});

// ─── @GET /api/users/:id ─── Admin ───────────────────────────────────────────
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, user });
});

// ─── @PUT /api/users/:id ─── Admin ───────────────────────────────────────────
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.role = req.body.role || user.role;
  user.isActive = req.body.isActive !== undefined ? req.body.isActive : user.isActive;

  await user.save();
  res.json({ success: true, user });
});

// ─── @DELETE /api/users/:id ─── Admin ────────────────────────────────────────
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent deleting yourself
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot delete your own account');
  }

  await user.deleteOne();
  res.json({ success: true, message: 'User deleted successfully' });
});

// ─── @GET /api/users/stats ─── Admin ─────────────────────────────────────────
export const getUserStats = asyncHandler(async (req, res) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
      },
    },
  ]);
  const total = await User.countDocuments();
  res.json({ success: true, stats, total });
});