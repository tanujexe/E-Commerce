

import asyncHandler from 'express-async-handler';
import Product from '../models/product.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../middleware/uploadMiddleware.js';

// ─── @GET /api/products ───────────────────────────────────────────────────────
export const getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  // Build query object
  const query = {};

  // Search
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }

  // Category filterjhgjhgjhhj
  if (req.query.category) query.category = req.query.category;

  // Brand filter
  if (req.query.brand) query.brand = { $regex: req.query.brand, $options: 'i' };

  // Price range
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
  }

  // Rating filter
  if (req.query.minRating) {
    query.rating = { $gte: Number(req.query.minRating) };
  }

  // Featured filter
  if (req.query.featured === 'true') query.isFeatured = true;

  // Sort options
  let sortBy = {};
  switch (req.query.sort) {
    case 'price_asc': sortBy = { price: 1 }; break;
    case 'price_desc': sortBy = { price: -1 }; break;
    case 'rating': sortBy = { rating: -1 }; break;
    case 'newest': sortBy = { createdAt: -1 }; break;
    default: sortBy = { createdAt: -1 };
  }

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('createdBy', 'name')
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query),
  ]);

  res.json({
    success: true,
    products,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});

// ─── @GET /api/products/:id ───────────────────────────────────────────────────
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('createdBy', 'name')
    .populate('reviews.user', 'name avatar');

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({ success: true, product });
});

// ─── @POST /api/products ─── Admin ────────────────────────────────────────────
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, shortDescription, price, discountedPrice, category, brand, stock, tags, isFeatured } = req.body;

  // Handle image uploads
  const images = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const uploaded = await uploadToCloudinary(file.path, 'ecommerce/products');
      images.push(uploaded);
    }
  }

  // Default placeholder if no images
  if (images.length === 0) {
    images.push({
      public_id: 'placeholder',
      url: 'https://via.placeholder.com/400x400?text=No+Image',
    });
  }

  const product = await Product.create({
    name, description, shortDescription, price,
    discountedPrice: discountedPrice || 0,
    category, brand, stock,
    tags: tags ? tags.split(',').map((t) => t.trim()) : [],
    isFeatured: isFeatured === 'true',
    images,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, product });
});

// ─── @PUT /api/products/:id ─── Admin ─────────────────────────────────────────
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const { name, description, shortDescription, price, discountedPrice, category, brand, stock, tags, isFeatured } = req.body;

  product.name = name || product.name;
  product.description = description || product.description;
  product.shortDescription = shortDescription || product.shortDescription;
  product.price = price !== undefined ? price : product.price;
  product.discountedPrice = discountedPrice !== undefined ? discountedPrice : product.discountedPrice;
  product.category = category || product.category;
  product.brand = brand || product.brand;
  product.stock = stock !== undefined ? stock : product.stock;
  product.isFeatured = isFeatured !== undefined ? isFeatured === 'true' : product.isFeatured;
  if (tags) product.tags = tags.split(',').map((t) => t.trim());

  // Handle new image uploads
  if (req.files && req.files.length > 0) {
    // Delete old images from Cloudinary
    for (const img of product.images) {
      if (img.public_id !== 'placeholder') {
        await deleteFromCloudinary(img.public_id);
      }
    }
    product.images = [];
    for (const file of req.files) {
      const uploaded = await uploadToCloudinary(file.path, 'ecommerce/products');
      product.images.push(uploaded);
    }
  }

  await product.save();
  res.json({ success: true, product });
});

// ─── @DELETE /api/products/:id ─── Admin ──────────────────────────────────────
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Delete images from Cloudinary
  for (const img of product.images) {
    if (img.public_id !== 'placeholder') {
      await deleteFromCloudinary(img.public_id);
    }
  }

  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted successfully' });
});

// ─── @POST /api/products/:id/reviews ─────────────────────────────────────────
export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || !comment) {
    res.status(400);
    throw new Error('Rating and comment are required');
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if user already reviewed
  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  product.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  });

  product.updateRating();
  await product.save();

  res.status(201).json({ success: true, message: 'Review added successfully' });
});

// ─── @GET /api/products/categories ───────────────────────────────────────────
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');
  res.json({ success: true, categories });
});