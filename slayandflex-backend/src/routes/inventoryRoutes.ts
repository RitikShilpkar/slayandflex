import { Router, Request, Response, NextFunction } from 'express';
import { updateProductStock } from '../controllers/inventoryController';
import { protect, authorizeRoles } from '../middlewares/authMiddleware';
import { check, validationResult } from 'express-validator';

const router = Router();

/**
 * @route   PUT /api/inventory/:productId
 * @desc    Update product stock
 * @access  Private/Admin
 */
router.put(
  '/:productId',
  protect,
  authorizeRoles('admin'),
  [
    check('countInStock', 'countInStock is required and must be a number')
      .isInt({ min: 0 }),
  ],
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      throw new Error(errors.array()[0].msg);
    }
    next();
  },
  updateProductStock
);

export default router;
