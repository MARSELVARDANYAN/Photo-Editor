import Image from '../models/Image.js';
import Album from '../models/Album.js';
import mongoose from 'mongoose';

export const uploadImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const newImage = new Image({
      user: req.user.id,
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      data: req.file.buffer 
    });

    await newImage.save();
    res.status(201).json({ id: newImage._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getImages = async (req, res) => {
  try {
    const images = await Image.find({ user: req.user.id }).select('-data');
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ message: 'Image not found' });

    // Используйте переменную окружения для клиентского URL
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    
    res.set({
      'Content-Type': image.contentType,
      'Access-Control-Allow-Origin': clientUrl,
      'Access-Control-Expose-Headers': 'Content-Type',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    });
    
    res.send(image.data);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// server/controllers/images.js

export const deleteImage = async (req, res) => {
  try {
    const imageId = req.params.id;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(imageId)) {
      return res.status(400).json({ message: 'Invalid image ID' });
    }

    const image = await Image.findById(imageId);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    if (image.user.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    await Album.updateMany(
      { images: imageId },
      { $pull: { images: imageId } }
    );

    await Image.findByIdAndDelete(imageId);

    res.json({ message: 'Image deleted successfully' });
  } catch (err) {
    console.error('Error deleting image:', err);
    
    let errorMessage = 'Server error';
    if (err.name === 'CastError') {
      errorMessage = 'Invalid image ID format';
    } else if (err.name === 'ValidationError') {
      errorMessage = 'Validation failed: ' + Object.values(err.errors).map(e => e.message).join(', ');
    }
    
    res.status(500).json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};