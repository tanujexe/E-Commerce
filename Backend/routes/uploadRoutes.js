import express from 'express';
import path from 'path';
import { protect } from '../middleware/authMiddleware.js';
import { upload, uploadToCloudinary } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// @POST /api/upload - Upload single image, returns URL
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Try Cloudinary first, fallback to local path
    let imageData;
    try {
      imageData = await uploadToCloudinary(req.file.path, 'ecommerce/misc');
    } catch {
      // Fallback: serve from local uploads directory
      imageData = {
        public_id: req.file.filename,
        url: `/uploads/${req.file.filename}`,
      };
    }

    res.json({ success: true, ...imageData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;