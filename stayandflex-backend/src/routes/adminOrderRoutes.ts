import { NextFunction, Router } from 'express';
import { getAllOrders, updateOrderStatus } from '../controllers/orderController';
import { protect, authorizeRoles } from '../middlewares/authMiddleware';
import { check, validationResult } from 'express-validator';

const router = Router();

// Middleware to validate status input
const validateStatus = [
  check('status', 'Status is required and must be either "shipped" or "delivered"')
    .isIn(['shipped', 'delivered']),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    //   res.status(400);
      throw new Error(errors.array()[0].msg);
    }
    next();
  },
];

// Route to get all orders (Admin only)
router.get('/', protect, authorizeRoles('admin'), getAllOrders);

// Route to update order status (Admin only)
router.put(
  '/:id/status',
  protect,
  authorizeRoles('admin'),
//   validateStatus,
  updateOrderStatus
);

export default router;
