/**
 * Auth Routes
 */
import express from 'express';
import { register, login, getMe, updateProfile, registerValidation, loginValidation } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;