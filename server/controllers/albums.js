import Album from '../models/Album.js';
import Image from '../models/Image.js';

export const createAlbum = async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ message: 'Album title is required' });
    }

    const newAlbum = new Album({
      user: userId,
      title
    });

    await newAlbum.save();
    res.status(201).json(newAlbum);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getUserAlbums = async (req, res) => {
  try {
    const albums = await Album.find({ user: req.user.id })
      .populate({
        path: 'images',
        select: '_id filename contentType createdAt',
        options: { limit: 4 } 
      })
      .sort({ createdAt: -1 });

    res.json(albums);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getAlbumById = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id)
      .populate({
        path: 'images',
        select: '_id filename contentType createdAt'
      })
      .populate('user', 'username');

    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    if (album.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    res.json(album);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const updateAlbum = async (req, res) => {
  try {
    const { title } = req.body;
    const album = await Album.findById(req.params.id);

    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    if (album.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    album.title = title || album.title;
    await album.save();

    res.json(album);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const deleteAlbum = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);

    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    if (album.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    await Album.findByIdAndDelete(req.params.id);
    res.json({ message: 'Album deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const addImageToAlbum = async (req, res) => {
  try {
    const { imageId } = req.body;
    const albumId = req.params.id;

    const album = await Album.findById(albumId);
    const image = await Image.findById(imageId);

    if (!album || !image) {
      return res.status(404).json({ message: 'Album or image not found' });
    }

    if (album.user.toString() !== req.user.id || image.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    if (!album.images.includes(imageId)) {
      album.images.push(imageId);
      await album.save();
    }

    res.json(album);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const removeImageFromAlbum = async (req, res) => {
  try {
    const { imageId } = req.body;
    const albumId = req.params.id;

    const album = await Album.findById(albumId);

    if (!album) {
      return res.status(404).json({ message: 'Album not found' });
    }

    if (album.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    album.images = album.images.filter(id => id.toString() !== imageId);
    await album.save();

    res.json(album);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const searchAlbums = async (req, res) => {
  try {
    const { query } = req.query;
    
    const albums = await Album.find({
      user: req.user.id,
      title: { $regex: query, $options: 'i' }
    }).populate({
      path: 'images',
      select: '_id',
      options: { limit: 1 }
    });

    res.json(albums);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};