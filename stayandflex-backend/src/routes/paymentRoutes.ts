import { Router } from 'express';
import {
  createRazorpayOrder,
  verifyPaymentSignature,
} from '../controllers/paymentController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPaymentSignature);

export default router;
