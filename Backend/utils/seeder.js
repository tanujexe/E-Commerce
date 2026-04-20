import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

dotenv.config();
await connectDB();

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    name: 'Amit',
    email: 'amit@example.com',
    password: 'password123',
    role: 'user',
  },
  {
    name: 'James',
    email: 'janmes@example.com',
    password: 'password123',
    role: 'user',
  },
];

const sampleProducts = (adminId) => [
  {
    name: 'Apple AirPods Pro (2nd Gen)',
    description: 'Active Noise Cancellation for immersive sound. Transparency mode for hearing what\'s around you. Personalized Spatial Audio with dynamic head tracking. Up to 6 hours of listening time with ANC.',
    shortDescription: 'Premium wireless earbuds with ANC and Spatial Audio.',
    price: 249.99,
    discountedPrice: 199.99,
    category: 'Electronics',
    brand: 'Apple',
    stock: 50,
    rating: 4.8,
    numReviews: 320,
    isFeatured: true,
    images: [{ public_id: 'airpods', url: 'https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?w=500' }],
    createdBy: adminId,
    tags: ['apple', 'earbuds', 'wireless', 'anc'],
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    description: 'Industry-leading noise canceling with two processors and 8 microphones. Crystal clear hands-free calling. Up to 30-hour battery life with quick charge.',
    shortDescription: 'Best-in-class noise canceling over-ear headphones.',
    price: 399.99,
    discountedPrice: 349.99,
    category: 'Electronics',
    brand: 'Sony',
    stock: 35,
    rating: 4.7,
    numReviews: 215,
    isFeatured: true,
    images: [{ public_id: 'sony_wh', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500' }],
    createdBy: adminId,
    tags: ['sony', 'headphones', 'noise-canceling'],
  },
  {
    name: 'Nike Air Max 270',
    description: 'The Nike Air Max 270 draws inspiration from two icons of Air: the Air Max 180 and Air Max 93. Its large Air unit — the tallest Air bag yet in a lifestyle shoe — provides all-day comfort.',
    shortDescription: 'Iconic lifestyle sneaker with Max Air cushioning.',
    price: 150.00,
    discountedPrice: 119.99,
    category: 'Clothing',
    brand: 'Nike',
    stock: 100,
    rating: 4.5,
    numReviews: 540,
    isFeatured: true,
    images: [{ public_id: 'nike_am', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500' }],
    createdBy: adminId,
    tags: ['nike', 'shoes', 'sneakers', 'running'],
  },
  {
    name: 'Samsung 65" QLED 4K Smart TV',
    description: 'Quantum Dot technology delivers breathtaking color. Motion Xcelerator Turbo+ for smooth action. Real Game Enhancer+ for peak gaming performance. Object Tracking Sound+.',
    shortDescription: '65-inch QLED 4K TV with 120Hz and gaming features.',
    price: 1299.99,
    discountedPrice: 999.99,
    category: 'Electronics',
    brand: 'Samsung',
    stock: 15,
    rating: 4.6,
    numReviews: 128,
    isFeatured: false,
    images: [{ public_id: 'samsung_tv', url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`' }],
    createdBy: adminId,
    tags: ['samsung', 'tv', '4k', 'smart-tv'],
  },
  {
    name: 'Atomic Habits – James Clear',
    description: 'No matter your goals, Atomic Habits offers a proven framework for improving every day. James Clear reveals practical strategies for forming good habits, breaking bad ones, and mastering the tiny behaviors that lead to remarkable results.',
    shortDescription: 'Bestselling book on building better habits.',
    price: 27.99,
    discountedPrice: 18.99,
    category: 'Books',
    brand: 'Penguin Random House',
    stock: 200,
    rating: 4.9,
    numReviews: 1200,
    isFeatured: true,
    images: [{ public_id: 'atomic_habits', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500' }],
    createdBy: adminId,
    tags: ['books', 'habits', 'self-help', 'bestseller'],
  },
  {
    name: 'Instant Pot Duo 7-in-1',
    description: 'The most versatile kitchen appliance — pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker, and warmer. 6 quart capacity.',
    shortDescription: '7-in-1 multi-use pressure cooker, 6Qt.',
    price: 99.99,
    discountedPrice: 79.99,
    category: 'Home & Garden',
    brand: 'Instant Pot',
    stock: 75,
    rating: 4.7,
    numReviews: 890,
    isFeatured: false,
    images: [{ public_id: 'instant_pot', url: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500' }],
    createdBy: adminId,
    tags: ['kitchen', 'cooking', 'appliance', 'pressure-cooker'],
  },
];

const seedDB = async () => {
  try {
    console.log('🗑️  Clearing existing data...');
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('👤 Creating users...');
  const hashedUsers = await Promise.all(
    users.map(async (user) => ({
      ...user,
      password: await bcrypt.hash(user.password, 12),
    }))
  );

  const createdUsers = await User.insertMany(hashedUsers);
  const adminUser = createdUsers.find((u) => u.role === 'admin');

  console.log('📦 Creating products...');
  await Product.insertMany(sampleProducts(adminUser._id));

    console.log('\n✅ Database seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin Login:');
    console.log('  Email:    admin@example.com');
    console.log('  Password: admin123');
    console.log('');
    console.log('User Login:');
    console.log('  Email:    john@example.com');
    console.log('  Password: password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDB();