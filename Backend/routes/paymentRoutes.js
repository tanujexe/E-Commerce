import express from 'express';
import {
  createStripeIntent,
  stripeWebhook,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Stripe
router.post('/stripe/create-intent', protect, createStripeIntent);
router.post('/stripe/webhook', stripeWebhook); // No auth - Stripe calls this

// Razorpay
router.post('/razorpay/create-order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

export default router;