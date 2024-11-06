
import { Router } from 'express';
import {
  addToCart,
  removeFromCart,
  getCart,
  clearCart,
} from '../controllers/cartController';
import { protect } from '../middlewares/authMiddleware';
import { check, validationResult } from 'express-validator';
import { Request } from 'express-validator/lib/base';

const router = Router();

/**
 * @route   POST /api/cart
 * @desc    Add item to cart
 * @access  Private
 */
router.post(
  '/',
  protect,
  [
    check('productId', 'Product ID is required').not().isEmpty(),
    check('quantity', 'Quantity is required and must be a number')
      .isInt({ min: 1 }),
  ],
  (req: Request, res: { status: (arg0: number) => void; }, next: () => void) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      throw new Error(errors.array()[0].msg);
    }
    next();
  },
  addToCart
);

/**
 * @route   DELETE /api/cart/:productId
 * @desc    Remove item from cart
 * @access  Private
 */
router.delete(
  '/:productId',
  protect,
  removeFromCart
);

/**
 * @route   GET /api/cart
 * @desc    Get user's cart
 * @access  Private
 */
router.get(
  '/',
  protect,
  getCart
);

/**
 * @route   DELETE /api/cart
 * @desc    Clear user's cart
 * @access  Private
 */
router.delete(
  '/',
  protect,
  clearCart
);

export default router;
