// server/routes/galleryRoutes.module.js
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import GalleryItem from '../../models/Gallery/GalleryItem.js';

const router = express.Router();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload file to Cloudinary
const uploadToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(file.buffer);
  });
};

// GET all gallery items
router.get('/', async (req, res) => {
  try {
    const galleryItems = await GalleryItem.find().sort({ createdAt: -1 });
    res.json(galleryItems);
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST upload new gallery items
router.post('/upload', upload.array('files'), async (req, res) => {
  try { 
    const files = req.files;
    const title = req.body.title;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const uploadPromises = files.map(async (file) => {
      const result = await uploadToCloudinary(file);

      const newItem = new GalleryItem({
        title,
        url: result.secure_url,
        publicId: result.public_id,
        mediaType: result.resource_type,
      });

      await newItem.save();
      return newItem;
    });

    const uploadedItems = await Promise.all(uploadPromises);

    res.status(201).json({
      message: `Successfully uploaded ${uploadedItems.length} files`,
      items: uploadedItems,
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
});

// DELETE a gallery item
router.delete('/:id', async (req, res) => {
  try {
    const item = await GalleryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    await cloudinary.uploader.destroy(item.publicId, {
      resource_type: item.mediaType,
    });

    await GalleryItem.findByIdAndDelete(req.params.id);

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
