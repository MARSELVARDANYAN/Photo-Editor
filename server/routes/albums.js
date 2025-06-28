import { Router } from 'express';
import {
  createAlbum,
  getUserAlbums,
  getAlbumById,
  updateAlbum,
  deleteAlbum,
  addImageToAlbum,
  removeImageFromAlbum,
  searchAlbums
} from '../controllers/albums.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.use(auth);

router.post('/', createAlbum);

router.get('/', getUserAlbums);

router.get('/search', searchAlbums);

router.route('/:id')
  .get(getAlbumById)
  .put(updateAlbum)
  .delete(deleteAlbum);

router.post('/:id/images', addImageToAlbum);
router.delete('/:id/images', removeImageFromAlbum);

export default router;