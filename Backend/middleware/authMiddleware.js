/**
 * Auth Middleware
 * Protects routes using JWT verification and role-based access control
 */

import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// ─── Verify JWT Token ─────────────────────────────────────────────────────────
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized — no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user || !req.user.isActive) {
      res.status(401);
      throw new Error('User account not found or deactivated');
    }

    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized — token invalid or expired');
  }
});

// ─── Admin Only ───────────────────────────────────────────────────────────────
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403);
  throw new Error('Access denied — admins only');
};

// ─── Optional Auth (attach user if token present) ─────────────────────────────
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch {
      req.user = null;
    }
  }
  next();
});