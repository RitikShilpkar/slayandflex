import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import Razorpay from 'razorpay';
import Order from '../models/Order';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private
export const createRazorpayOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.body;

    // Fetch the order
    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (order.isPaid) {
      res.status(400);
      throw new Error('Order is already paid');
    }

    // Create a Razorpay Order
    const options = {
      amount: Math.round(order.totalPrice * 100), // Amount in paise (smallest currency unit)
      currency: 'INR',
      receipt: (order._id as string).toString(),
      payment_capture: 1, // Auto capture
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payments/verify
// @access  Private
export const verifyPaymentSignature = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { razorpayPaymentId, razorpayOrderId, razorpaySignature, orderId } =
        req.body;
  
      const bodyText = razorpayOrderId + '|' + razorpayPaymentId;
  
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(bodyText)
        .digest('hex');
  
      if (expectedSignature === razorpaySignature) {
        // Signature is valid; update order to paid
        const order = await Order.findById(orderId);
  
        if (!order) {
          res.status(404);
          throw new Error('Order not found');
        }
  
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentResult = {
          razorpayPaymentId,
          razorpayOrderId,
          razorpaySignature,
        };
  
        const updatedOrder = await order.save();
  
        res.json(updatedOrder);
      } else {
        res.status(400);
        throw new Error('Invalid payment signature');
      }
    } catch (error) {
      next(error);
    }
  };
  