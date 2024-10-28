import { Router } from 'express';
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from '../controllers/wishlistController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.post('/:productId', protect, addToWishlist);
router.delete('/:productId', protect, removeFromWishlist);
router.get('/', protect, getWishlist);

export default router;
