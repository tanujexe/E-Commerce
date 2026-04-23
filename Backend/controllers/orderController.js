
import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// ─── @POST /api/orders ────────────────────────────────────────────────────────
export const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('Order must contain at least one item');
  }

  // Verify stock availability and update stock
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.name}`);
    }
    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for: ${product.name}`);
    }
    product.stock -= item.quantity;
    await product.save();
  }

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  res.status(201).json({ success: true, order });
});

// ─── @GET /api/orders/my ──────────────────────────────────────────────────────
export const getMyOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments({ user: req.user._id }),
  ]);

  res.json({ success: true, orders, page, pages: Math.ceil(total / limit), total });
});

// ─── @GET /api/orders/:id ─────────────────────────────────────────────────────
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Ensure the order belongs to the requesting user OR user is admin
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Access denied — not your order');
  }

  res.json({ success: true, order });
});

// ─── @PUT /api/orders/:id/pay ─────────────────────────────────────────────────
export const markOrderPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.orderStatus = 'processing';
  order.paymentResult = {
    id: req.body.id,
    status: req.body.status,
    updateTime: req.body.update_time,
    emailAddress: req.body.payer?.email_address,
  };

  const updatedOrder = await order.save();
  res.json({ success: true, order: updatedOrder });
});

// ─── @GET /api/orders ─── Admin ───────────────────────────────────────────────
export const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.status) query.orderStatus = req.query.status;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(query),
  ]);

  // Aggregate stats
  const stats = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalPrice' },
        totalOrders: { $sum: 1 },
        paidOrders: { $sum: { $cond: ['$isPaid', 1, 0] } },
      },
    },
  ]);

  res.json({
    success: true,
    orders,
    page,
    pages: Math.ceil(total / limit),
    total,
    stats: stats[0] || { totalRevenue: 0, totalOrders: 0, paidOrders: 0 },
  });
});

// ─── @PUT /api/orders/:id/status ─── Admin ────────────────────────────────────
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, trackingNumber } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(orderStatus)) {
    res.status(400);
    throw new Error('Invalid order status');
  }

  order.orderStatus = orderStatus;
  if (trackingNumber) order.trackingNumber = trackingNumber;

  if (orderStatus === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  // Restore stock on cancellation
  if (orderStatus === 'cancelled' && !order.isCancelled) {
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }
  }

  const updatedOrder = await order.save();
  res.json({ success: true, order: updatedOrder });
});