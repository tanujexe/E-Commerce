/**
 * Payment Controller
 * Stripe and Razorpay integration (test mode)
 */

import asyncHandler from 'express-async-handler';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// ─── Stripe Client ────────────────────────────────────────────────────────────
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// ─── Razorpay Client ──────────────────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder',
});

// ─── @POST /api/payment/stripe/create-intent ─────────────────────────────────
export const createStripeIntent = asyncHandler(async (req, res) => {
  const { amount, currency = 'usd' } = req.body;

  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error('Invalid payment amount');
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    automatic_payment_methods: { enabled: true },
    metadata: { userId: req.user._id.toString() },
  });

  res.json({
    success: true,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  });
});

// ─── @POST /api/payment/stripe/webhook ───────────────────────────────────────
export const stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    res.status(400);
    throw new Error(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    console.log(`✅ Payment succeeded: ${paymentIntent.id}`);
    // Handle successful payment (update order status)
  }

  res.json({ received: true });
});

// ─── @POST /api/payment/razorpay/create-order ────────────────────────────────
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR' } = req.body;

  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error('Invalid payment amount');
  }

  const options = {
    amount: Math.round(amount * 100), // Convert to paise
    currency,
    receipt: `receipt_${Date.now()}`,
    notes: { userId: req.user._id.toString() },
  };

  const order = await razorpay.orders.create(options);

  res.json({
    success: true,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
});

// ─── @POST /api/payment/razorpay/verify ──────────────────────────────────────
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder')
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error('Payment verification failed — invalid signature');
  }

  res.json({
    success: true,
    message: 'Payment verified successfully',
    paymentId: razorpay_payment_id,
  });
});