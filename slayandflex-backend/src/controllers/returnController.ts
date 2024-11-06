import { Request, Response, NextFunction } from 'express';
import ReturnRequest from '../models/ReturnRequest';
import Order from '../models/Order';
import Product from '../models/Product';
import { IUser } from '../models/User';
import mongoose from 'mongoose';
import { createNotification } from './notificationController';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';


// @desc    Create a return request
// @route   POST /api/returns
// @access  Private
export const createReturnRequest = async (
  req: AuthenticatedRequest & { user?: IUser },
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId, orderItemId, reason } = req.body;

    if (!orderId || !orderItemId || !reason) {
      res.status(400);
      throw new Error('Order ID, Order Item ID, and reason are required');
    }

    const order: any = await Order.findById(orderId);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Check if the order belongs to the user
    if (order.user.toString() !== req.user?._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to return items from this order');
    }

    // Find the specific order item
    const orderItem = order.orderItems.id(orderItemId);

    if (!orderItem) {
      res.status(404);
      throw new Error('Order item not found');
    }

    // Check if the item is eligible for return (e.g., within return window)
    const returnWindowDays = 30; // Example: 30 days return window
    const orderDate = new Date(order.createdAt);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - orderDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > returnWindowDays) {
      res.status(400);
      throw new Error('Return window has expired');
    }

    // Check if a return request already exists for this order item
    const existingReturn = await ReturnRequest.findOne({
      order: orderId,
      orderItem: { $elemMatch: { _id: orderItemId } },
    });

    if (existingReturn) {
      res.status(400);
      throw new Error('Return request already exists for this order item');
    }

    // Calculate refund amount
    const refundAmount = orderItem.price * orderItem.quantity;

    // Create the return request
    const returnRequest = new ReturnRequest({
      order: orderId,
      user: req.user?._id,
      orderItem: {
        product: orderItem.product,
        name: orderItem.name,
        image: orderItem.image,
        price: orderItem.price,
        quantity: orderItem.quantity,
      },
      reason,
      refundAmount,
    });

    await returnRequest.save();

    // Optionally, notify admins about the new return request
    const adminUsers = await mongoose.model('User').find({ role: 'admin' });

    for (const admin of adminUsers) {
      await createNotification({
        userId: admin._id.toString(),
        type: 'new_return_request',
        message: `A new return request has been submitted by ${req.user?.name} for order #${order._id}.`,
        emailSubject: 'New Return Request',
        emailBody: `<p>Hi ${admin.name},</p><p>A new return request has been submitted by ${req.user?.name} for order #${order._id}.</p>`,
        smsBody: `New return request by ${req.user?.name} for order #${order._id}.`,
      });
    }

    res.status(201).json(returnRequest);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all return requests (Admin)
// @route   GET /api/returns
// @access  Private/Admin
export const getAllReturnRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const returns = await ReturnRequest.find()
      .populate('order', 'orderNumber user totalPrice')
      .populate('user', 'name email')
      .populate('orderItem.product', 'name image price');

    res.status(200).json(returns);
  } catch (error) {
    next(error);
  }
};

// @desc    Get return requests for logged-in user
// @route   GET /api/returns/my-returns
// @access  Private
export const getMyReturnRequests = async (
  req: Request & { user?: IUser },
  res: Response,
  next: NextFunction
) => {
  try {
    const returns = await ReturnRequest.find({ user: req.user?._id })
      .populate('order', 'orderNumber totalPrice')
      .populate('orderItem.product', 'name image price');

    res.status(200).json(returns);
  } catch (error) {
    next(error);
  }
};

// @desc    Update return request status (Admin)
// @route   PUT /api/returns/:id
// @access  Private/Admin
export const updateReturnRequestStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const returnId = req.params.id;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Approved', 'Rejected', 'Refunded'];

    if (!validStatuses.includes(status)) {
      res.status(400);
      throw new Error('Invalid status value');
    }

    const returnRequest: any = await ReturnRequest.findById(returnId).populate('user', 'name email');

    if (!returnRequest) {
      res.status(404);
      throw new Error('Return request not found');
    }

    returnRequest.status = status;

    // If status is 'Refunded', process the refund
    if (status === 'Refunded') {
      // Implement refund logic here (e.g., integrate with payment gateway)
      // For demonstration, we'll assume the refund is successful
      returnRequest.refundAmount = returnRequest.refundAmount; // Already set during creation
    }

    await returnRequest.save();

    // Notify the user about the status update
    await createNotification({
      userId: returnRequest.user._id.toString(),
      type: 'return_status_update',
      message: `Your return request for order #${returnRequest.order} has been ${status}.`,
      emailSubject: 'Return Request Status Update',
      emailBody: `<p>Hi ${returnRequest.user.name},</p><p>Your return request for order #${returnRequest.order} has been <strong>${status}</strong>.</p>`,
      smsBody: `Your return request for order #${returnRequest.order} has been ${status}.`,
    });

    res.status(200).json(returnRequest);
  } catch (error) {
    next(error);
  }
};
