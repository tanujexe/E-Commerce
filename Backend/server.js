/**
 * MERN E-Commerce - Express Server Entry Point (FIXED)
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

dotenv.config();

// ✅ Connect DB
connectDB();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── 🔥 MIDDLEWARE (IMPORTANT ORDER) ─────────────────────────────────────────

// ✅ Allow frontend connection - support multiple origins and localhost for dev
const rawClientUrls = process.env.CLIENT_URLS || process.env.CLIENT_URL || '';
const ALLOWED_ORIGINS = rawClientUrls
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    // Allow non-browser requests like curl or server-to-server (no origin)
    if (!origin) return cb(null, true);

    // Allow if explicitly listed
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);

    // Allow local development origins
    if (/^https?:\/\/localhost(:\d+)?$/.test(origin) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
      return cb(null, true);
    }

    return cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ✅ Parse JSON (VERY IMPORTANT)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ✅ Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API ROUTES ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payment', paymentRoutes);

// ✅ Test route (debug)
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', time: new Date() });
});

// ─── ERROR HANDLING ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── START SERVER ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});