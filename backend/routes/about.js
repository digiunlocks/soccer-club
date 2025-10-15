const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { superAdminAuth } = require('./auth');
const AboutPage = require('../models/AboutPage');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/about';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'gallery-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit (increased from 5MB)
    files: 10 // Max 10 images
  },
  fileFilter: (req, file, cb) => {
    console.log('Multer fileFilter called for file:', file.originalname);
    console.log('File mimetype:', file.mimetype);
    
    // Expanded list of supported image types
    const allowedTypes = /jpeg|jpg|png|webp|gif|bmp|tiff|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    console.log('File extension test:', extname);
    console.log('File mimetype test:', mimetype);
    
    if (mimetype && extname) {
      console.log('File accepted:', file.originalname);
      return cb(null, true);
    } else {
      console.log('File rejected:', file.originalname);
      cb(new Error('Only image files (JPEG, JPG, PNG, WebP, GIF, BMP, TIFF, SVG) are allowed!'));
    }
  }
});

// GET /api/about - Get public about page content
router.get('/', async (req, res) => {
  try {
    const aboutPage = await AboutPage.getCurrent();
    res.json(aboutPage);
  } catch (error) {
    console.error('Error fetching about page:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/about/admin - Get about page content for admin (with all details)
router.get('/admin', superAdminAuth, async (req, res) => {
  try {
    const aboutPage = await AboutPage.getCurrent();
    res.json(aboutPage);
  } catch (error) {
    console.error('Error fetching about page for admin:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/about - Update about page content
router.put('/', superAdminAuth, async (req, res) => {
  try {
    const { title, description, additionalInfo, highlights } = req.body;
    
    let aboutPage = await AboutPage.findOne().sort({ createdAt: -1 });
    
    if (!aboutPage) {
      aboutPage = new AboutPage();
    }
    
    if (title) aboutPage.title = title;
    if (description) aboutPage.description = description;
    if (additionalInfo) aboutPage.additionalInfo = additionalInfo;
    if (highlights && Array.isArray(highlights)) aboutPage.highlights = highlights;
    
    aboutPage.lastUpdated = new Date();
    await aboutPage.save();
    
    res.json({ message: 'About page updated successfully', aboutPage });
  } catch (error) {
    console.error('Error updating about page:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/about/gallery - Upload gallery images
router.post('/gallery', superAdminAuth, (req, res, next) => {
  console.log('Gallery upload route hit');
  console.log('Request headers:', req.headers);
  console.log('Request body keys:', Object.keys(req.body));
  
  upload.array('images', 10)(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: 'File upload error', error: err.message });
    }
    
    console.log('Multer processing completed');
    console.log('Files received:', req.files ? req.files.length : 0);
    
    // Continue with the rest of the handler
    handleGalleryUpload(req, res);
  });
});

async function handleGalleryUpload(req, res) {
  try {
    console.log('Gallery upload request received');
    console.log('Files received:', req.files ? req.files.length : 0);
    console.log('Body:', req.body);
    
    const { captions, alts } = req.body;
    const captionsArray = captions ? JSON.parse(captions) : [];
    const altsArray = alts ? JSON.parse(alts) : [];
    
    console.log('Parsed captions:', captionsArray);
    console.log('Parsed alts:', altsArray);
    
    let aboutPage = await AboutPage.findOne().sort({ createdAt: -1 });
    if (!aboutPage) {
      console.log('No about page found, creating new one');
      aboutPage = new AboutPage();
    }
    console.log('About page loaded, current gallery count:', aboutPage.gallery.length);
    
    const processedImages = [];
    if (req.files && req.files.length > 0) {
      console.log('Processing', req.files.length, 'files');
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const filename = file.filename;
        const imagePath = file.path;
        
        console.log(`Processing file ${i + 1}: ${filename}`);
        console.log(`File path: ${imagePath}`);
        
        // Create thumbnail
        const thumbnailPath = path.join(path.dirname(imagePath), 'thumb_' + filename);
        console.log(`Creating thumbnail at: ${thumbnailPath}`);
        
        await sharp(imagePath)
          .resize(400, 300, { fit: 'cover' })
          .jpeg({ quality: 80 })
          .toFile(thumbnailPath);
        
        console.log(`Thumbnail created successfully for ${filename}`);
        
        processedImages.push({
          url: `/uploads/about/${filename}`,
          thumbnail: `/uploads/about/thumb_${filename}`,
          caption: captionsArray[i] || '',
          alt: altsArray[i] || 'Club scene',
          order: aboutPage.gallery.length + i
        });
      }
    }
    
    console.log('Adding', processedImages.length, 'images to gallery');
    aboutPage.gallery.push(...processedImages);
    aboutPage.lastUpdated = new Date();
    
    console.log('Saving about page...');
    await aboutPage.save();
    console.log('About page saved successfully');
    
    res.status(201).json({
      message: 'Gallery images uploaded successfully',
      images: processedImages
    });
  } catch (error) {
    console.error('Error uploading gallery images:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// PUT /api/about/gallery/:id - Update gallery image
router.put('/gallery/:id', superAdminAuth, async (req, res) => {
  try {
    const { caption, alt, order } = req.body;
    
    let aboutPage = await AboutPage.findOne().sort({ createdAt: -1 });
    if (!aboutPage) {
      return res.status(404).json({ message: 'About page not found' });
    }
    
    const imageIndex = aboutPage.gallery.findIndex(img => img._id.toString() === req.params.id);
    if (imageIndex === -1) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    if (caption !== undefined) aboutPage.gallery[imageIndex].caption = caption;
    if (alt !== undefined) aboutPage.gallery[imageIndex].alt = alt;
    if (order !== undefined) aboutPage.gallery[imageIndex].order = order;
    
    aboutPage.lastUpdated = new Date();
    await aboutPage.save();
    
    res.json({ message: 'Gallery image updated successfully' });
  } catch (error) {
    console.error('Error updating gallery image:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/about/gallery/:id - Delete gallery image
router.delete('/gallery/:id', superAdminAuth, async (req, res) => {
  try {
    console.log('Delete request received for image ID:', req.params.id);
    
    let aboutPage = await AboutPage.findOne().sort({ createdAt: -1 });
    if (!aboutPage) {
      console.log('No about page found');
      return res.status(404).json({ message: 'About page not found' });
    }
    
    console.log('About page found, gallery count:', aboutPage.gallery.length);
    
    const imageIndex = aboutPage.gallery.findIndex(img => img._id.toString() === req.params.id);
    if (imageIndex === -1) {
      console.log('Image not found in gallery');
      return res.status(404).json({ message: 'Image not found' });
    }
    
    const image = aboutPage.gallery[imageIndex];
    console.log('Found image to delete:', {
      id: image._id,
      url: image.url,
      thumbnail: image.thumbnail
    });
    
    // Temporarily skip file deletion to isolate the issue
    console.log('Skipping file deletion for now to test database deletion');
    
    console.log('Removing image from gallery array at index:', imageIndex);
    // Remove from gallery array
    aboutPage.gallery.splice(imageIndex, 1);
    
    // Reorder remaining images
    aboutPage.gallery.forEach((img, index) => {
      img.order = index;
    });
    
    aboutPage.lastUpdated = new Date();
    console.log('Saving about page with updated gallery...');
    await aboutPage.save();
    console.log('About page saved successfully');
    
    res.json({ message: 'Gallery image deleted successfully' });
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/about/gallery/reorder - Reorder gallery images
router.put('/gallery/reorder', superAdminAuth, async (req, res) => {
  try {
    const { imageIds } = req.body; // Array of image IDs in new order
    
    let aboutPage = await AboutPage.findOne().sort({ createdAt: -1 });
    if (!aboutPage) {
      return res.status(404).json({ message: 'About page not found' });
    }
    
    // Reorder gallery based on provided image IDs
    const reorderedGallery = [];
    imageIds.forEach((imageId, index) => {
      const image = aboutPage.gallery.find(img => img._id.toString() === imageId);
      if (image) {
        image.order = index;
        reorderedGallery.push(image);
      }
    });
    
    aboutPage.gallery = reorderedGallery;
    aboutPage.lastUpdated = new Date();
    await aboutPage.save();
    
    res.json({ message: 'Gallery reordered successfully' });
  } catch (error) {
    console.error('Error reordering gallery:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
