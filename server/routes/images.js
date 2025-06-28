import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { 
  uploadImage, 
  getImages, 
  getImage,
  deleteImage
} from '../controllers/images.js';

const router = Router();

router.post('/', auth, upload.single('image'), uploadImage);
router.get('/', auth, getImages);
router.get('/:id', getImage);
router.delete('/:id', auth, deleteImage); 

export default router;