
import { Router } from 'express';
import {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderToDelivered,
  updateOrderToPaid,
  updateOrderStatus,
  cancelOrder,
  addTrackingInfo,
  getTrackingInfo,
} from '../controllers/orderController';
import { protect, authorizeRoles, admin } from '../middlewares/authMiddleware';
import { check, validationResult } from 'express-validator';
import { Request } from 'express-validator/lib/base';

const router = Router();

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private
 */
router.post(
  '/',
  protect,
  [
    // Validate shipping address fields
    check('shippingAddress.fullName', 'Full name is required').not().isEmpty(),
    check('shippingAddress.addressLine1', 'Address Line 1 is required').not().isEmpty(),
    check('shippingAddress.city', 'City is required').not().isEmpty(),
    check('shippingAddress.state', 'State is required').not().isEmpty(),
    check('shippingAddress.postalCode', 'Postal code is required').not().isEmpty(),
    check('shippingAddress.country', 'Country is required').not().isEmpty(),
    // check('shippingAddress.phoneNumber', 'Valid phone number is required').isMobilePhone(),
    // Additional validations can be added here (e.g., paymentMethod)
  ],
  (req: Request, res: { status: (arg0: number) => void; }, next: () => void) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      throw new Error(errors.array()[0].msg);
    }
    next();
  },
  createOrder
);

/**
 * @route   GET /api/orders
 * @desc    Get all orders (Admin)
 * @access  Private/Admin
 */
router.get('/', protect, authorizeRoles('admin'), getAllOrders);

/**
 * @route   GET /api/orders/myorders
 * @desc    Get logged-in user's orders
 * @access  Private
 */
router.get('/myorders', protect, getMyOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
router.get('/:id', protect, getOrderById);

/**
 * @route   PUT /api/orders/:id/deliver
 * @desc    Update order to delivered (Admin)
 * @access  Private/Admin
 */
router.put('/:id/deliver', protect, authorizeRoles('admin'), updateOrderToDelivered);

/**
 * @route   PUT /api/orders/:id/pay
 * @desc    Update order to paid
 * @access  Private
 */
router.put(
  '/:id/pay',
  protect,
  [
    check('razorpayPaymentId', 'razorpayPaymentId is required').not().isEmpty(),
    check('razorpayOrderId', 'razorpayOrderId is required').not().isEmpty(),
    check('razorpaySignature', 'razorpaySignature is required').not().isEmpty(),
  ],
  (req: Request, res: { status: (arg0: number) => void; }, next: () => void) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      throw new Error(errors.array()[0].msg);
    }
    next();
  },
  updateOrderToPaid
);

/**
 * @route   PUT /api/orders/admin/:id/status
 * @desc    Update order status (e.g., shipped, delivered) (Admin)
 * @access  Private/Admin
 */
router.put(
  '/admin/:id/status',
  protect,
  authorizeRoles('admin'),
  [
    check('status', 'Status is required').not().isEmpty(),
    // Optionally, validate that status is one of the allowed values
    check('status', 'Invalid status value').isIn(['shipped', 'delivered']),
  ],
  (req: Request, res: { status: (arg0: number) => void; }, next: () => void) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      throw new Error(errors.array()[0].msg);
    }
    next();
  },
  updateOrderStatus
);


// Tracking Routes
router.route("/:id/tracking").get(protect, getTrackingInfo).put(protect, admin, addTrackingInfo);
router.route("/:id/deliver").put(protect, admin, updateOrderToDelivered);
router.route("/:id/pay").put(protect, updateOrderToPaid);
router.route("/admin/:id/status").put(protect, admin, updateOrderStatus);

/**
 * @route   DELETE /api/orders/:id
 * @desc    Cancel an order
 * @access  Private
 */
router.delete('/:id', protect, cancelOrder);

export default router;
