
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import Order from "../models/Order";
import Cart from "../models/Cart";
import Product from "../models/Product";
import mongoose from "mongoose";
import sendEmail from "../utils/sendEmail";
import AuditLog from "../models/AuditLog";
import { createNotification } from "./notificationController";

const ObjectId = mongoose.Types.ObjectId;

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.user?._id;
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error("No order items");
    }

    console.log({orderItems});
    
    // Validate and fetch products
    const productIds = orderItems.map((item: any) => item.product);
    const products = await Product.find({ _id: { $in: productIds } }).session(session);

    console.log({productsL: products.length, productIds: productIds});
    

    if (products.length !== productIds.length) {
      res.status(404);
      throw new Error("One or more products not found");
    }

    // Check stock and calculate prices
    let itemsPrice = 0;
    for (const item of orderItems) {
      const product = products.find((p: any) => p._id.toString() === item.product);
      if (!product) {
        res.status(404);
        throw new Error(`Product not found: ${item.product}`);
      }
      if (product.countInStock < item.quantity) {
        res.status(400);
        throw new Error(`Not enough stock for product: ${product.name}`);
      }
      itemsPrice += product.price * item.quantity;
    }

    const taxPrice = parseFloat((itemsPrice * 0.18).toFixed(2)); // Example: 18% tax
    const shippingPrice = itemsPrice > 1000 ? 0 : 100; // Free shipping for orders over 1000
    const totalPrice = parseFloat((itemsPrice + taxPrice + shippingPrice).toFixed(2));

    // Create Order
    const order = new Order({
      user: userId,
      orderItems: orderItems.map((item: any) => ({
        product: item.product,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      })),
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: false,
      isDelivered: false,
      isCancelled: false,
    });

    console.log({order});
    
    const createdOrder = await order.save({ session });

    // Reduce stock quantity
    const bulkOperations = orderItems.map((item: any) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { countInStock: -item.quantity } },
      },
    }));

    await Product.bulkWrite(bulkOperations, { session });

    // Clear user's cart
    await Cart.findOneAndDelete({ user: userId }).session(session);

    // Send order confirmation email
    const emailSubject = `Order Confirmation - Your Order #${createdOrder._id}`;
    const emailBody = `
    <div style="font-family: 'Playfair Display', serif; color: #3d2f25; line-height: 1.6;">
      <h1 style="color: #3d2f25; font-size: 2rem;">Thank you for your order!</h1>
      <p style="font-size: 1.2rem;">Hi ${req.user?.name},</p>
      <p style="font-size: 1.2rem;">
        Your order has been placed successfully. Here are the details:
      </p>
      <div style="padding: 15px; background-color: #f8f8f8; border: 1px solid #d4cfc5; border-radius: 8px;">
        <p style="font-size: 1.1rem; margin: 0;">
          <strong>Order ID:</strong> ${createdOrder._id}
        </p>
        <p style="font-size: 1.1rem; margin: 5px 0;">
          <strong>Total Price:</strong> ₹${createdOrder.totalPrice.toFixed(2)}
        </p>
      </div>
      <p style="margin-top: 20px; font-size: 1.2rem;">
        We will notify you once your order is shipped.
      </p>
      <p style="font-size: 1.2rem;">Thank you for shopping with us!</p>
      <p style="font-size: 1rem; margin-top: 40px; color: #5b5347;">&copy; ${new Date().getFullYear()} Slay and Flex. All rights reserved.</p>
    </div>
  `;
  

    try {
      await sendEmail({
        to: req.user?.email!,
        subject: emailSubject,
        html: emailBody,
      });
    } catch (emailError) {
        console.log({emailError});
        
      // Optionally, proceed without failing the main operation
    }

    try {

      console.log({user: req.user});
      
        
    
    // Notify user about order confirmation
    await createNotification({
      userId: (userId as string).toString(),
      type: 'order_confirmation',
      message: `Your order #${createdOrder._id} has been successfully placed.`,
      emailSubject: 'Order Confirmation',
      emailBody: `
        <div style="font-family: 'Playfair Display', serif; color: #3d2f25; line-height: 1.6;">
          <h2 style="color: #3d2f25; font-size: 1.8rem;">Order Confirmation</h2>
          <p style="font-size: 1.2rem;">Hi ${req.user?.name},</p>
          <p style="font-size: 1.2rem;">
            Your order <strong>#${createdOrder._id}</strong> has been successfully placed. Thank you for shopping with us!
          </p>
          <div style="margin-top: 20px; padding: 15px; background-color: #f8f8f8; border: 1px solid #d4cfc5; border-radius: 8px;">
            <p style="font-size: 1.1rem; margin: 0;">We are currently processing your order, and will notify you once it is shipped.</p>
          </div>
          <p style="font-size: 1rem; margin-top: 40px; color: #5b5347;">&copy; ${new Date().getFullYear()} Slay and Flex. All rights reserved.</p>
        </div>
      `,
      smsBody: `Hi ${req.user?.name}, your order #${createdOrder._id} has been placed successfully.`,
    });
    
    } catch (error) {
        console.error("error in sending sms")
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(createdOrder);
  } catch (error) {
    console.log({error})
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.id;

    if (!ObjectId.isValid(orderId)) {
      res.status(400);
      throw new Error("Invalid order ID");
    }

    const order = await Order.findById(orderId)
      .populate("user", "name email")
      .populate("orderItems.product", "name price");

    if (order) {
      if (
        order.user._id.toString() !== (req.user?._id as string).toString() &&
        req.user?.role !== "admin"
      ) {
        res.status(401);
        throw new Error("Not authorized to view this order");
      }
      res.json(order);
    } else {
      res.status(404);
      throw new Error("Order not found");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await Order.find({ user: req.user?._id })
      .populate("orderItems.product", "name price")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await Order.find({})
      .populate("user", "id name email")
      .populate("orderItems.product", "name price")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order to delivered (Admin)
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.id;

    if (!ObjectId.isValid(orderId)) {
      res.status(400);
      throw new Error("Invalid order ID");
    }

    const order: any = await Order.findById(orderId).populate("user", "email name");

    if (order) {
      if (order.isDelivered) {
        res.status(400);
        throw new Error("Order is already delivered");
      }
      order.isDelivered = true;
      order.deliveredAt = new Date();

      const updatedOrder = await order.save();

      // Log the action
      await AuditLog.create({
        admin: req.user?._id,
        action: "Order Delivered",
        order: order._id,
        details: {
          deliveredAt: order.deliveredAt,
        },
      });

      // Send delivery confirmation email
      const emailSubject = `Your Order #${order._id} has been Delivered`;
      const emailBody = `
      <div style="font-family: 'Playfair Display', serif; color: #3d2f25; line-height: 1.6; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
        <h1 style="color: #3d2f25; font-size: 2rem; margin-bottom: 20px;">Your Order is Delivered!</h1>
        <p style="font-size: 1.2rem;">Hi ${order.user.name},</p>
        <p style="font-size: 1.2rem; margin-top: 10px;">
          Your order with ID <strong style="color: #5b5347;">${order._id}</strong> has been delivered.
        </p>
        <p style="font-size: 1.2rem; margin-top: 20px;">
          We hope you enjoy your purchase! Thank you for shopping with us.
        </p>
        <div style="margin-top: 40px; padding: 15px; background-color: #f0f0f0; border: 1px solid #d4cfc5; border-radius: 8px;">
          <p style="font-size: 1rem; margin: 0;">For any assistance, please contact our support team.</p>
        </div>
        <p style="font-size: 1rem; margin-top: 40px; color: #5b5347;">&copy; ${new Date().getFullYear()} Slay and Flex. All rights reserved.</p>
      </div>
    `;
    

      try {
        await sendEmail({
          to: order.user.email,
          subject: emailSubject,
          html: emailBody,
        });
      } catch (emailError) {
        
        // Optionally, proceed without failing the main operation
      }

      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error("Order not found");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.id;

    if (!ObjectId.isValid(orderId)) {
      res.status(400);
      throw new Error("Invalid order ID");
    }

    const order: any = await Order.findById(orderId).populate("user", "email name");

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    if (order.isPaid) {
      res.status(400);
      throw new Error("Order is already paid");
    }

    // Verify payment details (Assuming Razorpay integration)
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      res.status(400);
      throw new Error("Missing payment information");
    }

    // Verify Razorpay signature
    const crypto = require("crypto");
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      res.status(400);
      throw new Error("Invalid signature");
    }

    // Update order status
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    };

    const updatedOrder = await order.save();

    // Log the action
    await AuditLog.create({
      admin: req.user?._id,
      action: "Order Paid",
      order: order._id,
      details: {
        razorpayPaymentId,
        razorpayOrderId,
      },
    });

    // Send payment confirmation email
    const emailSubject = `Payment Confirmation - Your Order #${order._id}`;
    const emailBody = `
    <div style="font-family: 'Playfair Display', serif; color: #3d2f25; line-height: 1.6; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
      <h1 style="color: #3d2f25; font-size: 2rem; margin-bottom: 20px;">Payment Received!</h1>
      <p style="font-size: 1.2rem;">Hi ${order.user.name},</p>
      <p style="font-size: 1.2rem; margin-top: 10px;">
        We have received your payment for Order ID <strong style="color: #5b5347;">${order._id}</strong>.
      </p>
      <p style="font-size: 1.2rem; margin-top: 20px;">
        <strong>Amount Paid:</strong> ₹${order.totalPrice}
      </p>
      <p style="font-size: 1.2rem; margin-top: 20px;">
        We will notify you once your order is shipped. Thank you for shopping with us!
      </p>
      <div style="margin-top: 40px; padding: 15px; background-color: #f0f0f0; border: 1px solid #d4cfc5; border-radius: 8px;">
        <p style="font-size: 1rem; margin: 0;">For any assistance, please contact our support team.</p>
      </div>
      <p style="font-size: 1rem; margin-top: 40px; color: #5b5347;">&copy; ${new Date().getFullYear()} Slay and Flex. All rights reserved.</p>
    </div>
  `;
  

    try {
      await sendEmail({
        to: order.user.email,
        subject: emailSubject,
        html: emailBody,
      });
    } catch (emailError) {
      
      // Optionally, proceed without failing the main operation
    }

    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (e.g., mark as shipped or delivered)
// @route   PUT /api/orders/admin/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    if (!ObjectId.isValid(orderId)) {
      res.status(400);
      throw new Error("Invalid order ID");
    }

    if (!status) {
      res.status(400);
      throw new Error("Status is required");
    }

    const order: any = await Order.findById(orderId).populate("user", "email name");

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    let emailSubject = "";
    let emailBody = "";
    let action = "";

    // Update order status based on provided status
    switch (status.toLowerCase()) {
      case "shipped":
        if (!order.isPaid) {
          res.status(400);
          throw new Error("Cannot ship an unpaid order");
        }
        if (order.isShipped) {
          res.status(400);
          throw new Error("Order is already marked as shipped");
        }
        if (order.isDelivered) {
          res.status(400);
          throw new Error("Order is already delivered");
        }
        order.isShipped = true;
        order.shippedAt = new Date();

        action = "Order Shipped";
        emailSubject = `Your Order #${order._id} has been Shipped`;
        emailBody = `
        <div style="font-family: 'Playfair Display', serif; color: #3d2f25; line-height: 1.6; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
          <h1 style="color: #3d2f25; font-size: 2rem; margin-bottom: 20px;">Your Order is Shipped!</h1>
          <p style="font-size: 1.2rem;">Hi ${order.user.name},</p>
          <p style="font-size: 1.2rem; margin-top: 10px;">
            Your order with ID <strong style="color: #5b5347;">${order._id}</strong> has been shipped.
          </p>
          <p style="font-size: 1.2rem; margin-top: 20px;">
            Thank you for shopping with us! We hope you enjoy your purchase.
          </p>
          <div style="margin-top: 40px; padding: 15px; background-color: #f0f0f0; border: 1px solid #d4cfc5; border-radius: 8px;">
            <p style="font-size: 1rem; margin: 0;">For any assistance, please contact our support team.</p>
          </div>
          <p style="font-size: 1rem; margin-top: 40px; color: #5b5347;">&copy; ${new Date().getFullYear()} Slay and Flex. All rights reserved.</p>
        </div>
      `;
      
        break;

      case "delivered":
        if (!order.isPaid) {
          res.status(400);
          throw new Error("Cannot deliver an unpaid order");
        }
        if (!order.isShipped) {
          res.status(400);
          throw new Error("Order must be shipped before marking as delivered");
        }
        if (order.isDelivered) {
          res.status(400);
          throw new Error("Order is already marked as delivered");
        }
        order.isDelivered = true;
        order.deliveredAt = new Date();

        action = "Order Delivered";
        emailSubject = `Your Order #${order._id} has been Delivered`;
        emailBody = `
        <div style="font-family: 'Playfair Display', serif; color: #3d2f25; line-height: 1.6; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
          <h1 style="color: #3d2f25; font-size: 2rem; margin-bottom: 20px;">Your Order is Delivered!</h1>
          <p style="font-size: 1.2rem;">Hi ${order.user.name},</p>
          <p style="font-size: 1.2rem; margin-top: 10px;">
            Your order with ID <strong style="color: #5b5347;">${order._id}</strong> has been successfully delivered.
          </p>
          <p style="font-size: 1.2rem; margin-top: 20px;">
            We hope you enjoy your purchase!
          </p>
          <div style="margin-top: 40px; padding: 15px; background-color: #f0f0f0; border: 1px solid #d4cfc5; border-radius: 8px;">
            <p style="font-size: 1rem; margin: 0;">For any assistance, please contact our support team.</p>
          </div>
          <p style="font-size: 1rem; margin-top: 40px; color: #5b5347;">&copy; ${new Date().getFullYear()} Slay and Flex. All rights reserved.</p>
        </div>
      `;
      
        break;

      default:
        res.status(400);
        throw new Error("Invalid status value");
    }

    await order.save();

    // Log the action (optional)

    // Send email notification to the user
    try {
      await sendEmail({
        to: order.user.email,
        subject: emailSubject,
        html: emailBody,
      });
    } catch (emailError) {
      // Optionally, proceed without failing the main operation
    }

    res.status(200).json({ message: `Order marked as ${status}` });
  } catch (error) {
    next(error);
  }
};


// @desc    Cancel an order
// @route   DELETE /api/orders/:id
// @access  Private
export const cancelOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const orderId = req.params.id;
    const userId = req.user?._id;

    if (!ObjectId.isValid(orderId)) {
      res.status(400);
      throw new Error("Invalid order ID");
    }

    const order: any = await Order.findById(orderId).session(session);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    // Allow cancellation only if the user owns the order or is an admin
    if (
      order.user.toString() !== userId?.toString() &&
      req.user?.role !== "admin"
    ) {
      res.status(403);
      throw new Error("Not authorized to cancel this order");
    }

    // Only allow cancellation if not paid and not already canceled
    if (order.isPaid) {
      res.status(400);
      throw new Error("Cannot cancel a paid order");
    }

    if (order.isCancelled) {
      res.status(400);
      throw new Error("Order is already canceled");
    }

    // Update order status
    order.isCancelled = true;
    order.cancelledAt = new Date(); // Correctly assign a Date object
    await order.save({ session });

    // Increase stock for each product in the order
    const bulkOperations = order.orderItems.map((item: any) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { countInStock: item.quantity } },
      },
    }));

    await Product.bulkWrite(bulkOperations, { session });

    // Log the action
    await AuditLog.create(
      {
        admin: req.user?._id,
        action: "Order Canceled",
        order: order._id,
        details: {
          cancelledAt: order.cancelledAt,
        },
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Send cancellation email
    const emailSubject = `Order Canceled - Order #${order._id}`;
    const emailBody = `
    <div style="font-family: 'Playfair Display', serif; color: #3d2f25; line-height: 1.6; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
      <h1 style="color: #3d2f25; font-size: 2rem; margin-bottom: 20px;">Your Order has been Canceled</h1>
      <p style="font-size: 1.2rem;">Hi ${order.user.name},</p>
      <p style="font-size: 1.2rem; margin-top: 10px;">
        Your order with ID <strong style="color: #5b5347;">${order._id}</strong> has been canceled.
      </p>
      <p style="font-size: 1.2rem; margin-top: 20px;">
        If you have any questions, feel free to contact our support team. We're here to assist you with any concerns you might have.
      </p>
      <div style="margin-top: 40px; padding: 15px; background-color: #f0f0f0; border: 1px solid #d4cfc5; border-radius: 8px;">
        <p style="font-size: 1rem; margin: 0;">Contact support: <a href="mailto:support@slayandflex.com" style="color: #3d2f25; text-decoration: none;">support@slayandflex.com</a></p>
      </div>
      <p style="font-size: 1rem; margin-top: 40px; color: #5b5347;">&copy; ${new Date().getFullYear()} Slay and Flex. All rights reserved.</p>
    </div>
  `;
  

    try {
      await sendEmail({
        to: order.user.email,
        subject: emailSubject,
        html: emailBody,
      });
    } catch (emailError) {
    
      // Optionally, proceed without failing the main operation
    }

    res.status(200).json({ message: "Order has been canceled" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};


// @desc    Add Tracking Information to an Order (Admin)
// @route   PUT /api/orders/:id/tracking
// @access  Private/Admin
export const addTrackingInfo = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const orderId = req.params.id;
      const { carrier, trackingNumber, status, estimatedDelivery, trackingUrl } = req.body;
  
      if (!ObjectId.isValid(orderId)) {
        res.status(400);
        throw new Error("Invalid order ID");
      }
  
      const order: any = await Order.findById(orderId).populate("user", "email name");
  
      if (!order) {
        res.status(404);
        throw new Error("Order not found");
      }
  
      // Only allow admins to add tracking info
      if (req.user?.role !== "admin") {
        res.status(403);
        throw new Error("Not authorized to add tracking information");
      }
  
      // Update tracking information
      order.trackingInfo = {
        carrier,
        trackingNumber,
        status,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
        trackingUrl,
      };
  
      await order.save();
  
      // Log the action
      await AuditLog.create({
        admin: req.user?._id,
        action: "Tracking Info Added",
        order: order._id,
        details: {
          carrier,
          trackingNumber,
          status,
          estimatedDelivery,
          trackingUrl,
        },
      });
  
      // Send tracking information email to user
      const emailSubject = `Your Order #${order._id} is on the way!`;
      const emailBody = `
  <div style="font-family: 'Playfair Display', serif; color: #3d2f25; line-height: 1.6; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
    <h1 style="color: #3d2f25; font-size: 2rem; margin-bottom: 20px;">Order Shipped!</h1>
    <p style="font-size: 1.2rem;">Hi ${order.user.name},</p>
    <p style="font-size: 1.2rem; margin-top: 10px;">
      Your order with ID <strong style="color: #5b5347;">${order._id}</strong> has been shipped.
    </p>
    <div style="margin-top: 20px; padding: 15px; background-color: #ffffff; border: 1px solid #d4cfc5; border-radius: 8px;">
      <p style="font-size: 1.1rem; margin-bottom: 10px;"><strong>Carrier:</strong> ${carrier}</p>
      <p style="font-size: 1.1rem; margin-bottom: 10px;"><strong>Tracking Number:</strong> ${trackingNumber}</p>
      <p style="font-size: 1.1rem; margin-bottom: 10px;"><strong>Status:</strong> ${status}</p>
      ${
        estimatedDelivery
          ? `<p style="font-size: 1.1rem; margin-bottom: 10px;"><strong>Estimated Delivery:</strong> ${new Date(
              estimatedDelivery
            ).toLocaleDateString()}</p>`
          : ""
      }
      ${
        trackingUrl
          ? `<p style="font-size: 1.1rem;">You can track your package here: <a href="${trackingUrl}" style="color: #3d2f25; text-decoration: none;">Track your package</a></p>`
          : ""
      }
    </div>
    <p style="font-size: 1.2rem; margin-top: 30px;">Thank you for shopping with us!</p>
    <p style="font-size: 1rem; margin-top: 40px; color: #5b5347;">&copy; ${new Date().getFullYear()} Slay and Flex. All rights reserved.</p>
  </div>
`;

  
      try {
        await sendEmail({
          to: order.user.email,
          subject: emailSubject,
          html: emailBody,
        });
      } catch (emailError) {
        
        // Optionally, proceed without failing the main operation
      }
  
      res.status(200).json({ message: "Tracking information added successfully" });
    } catch (error) {
      next(error);
    }
  };


  // @desc    Get Tracking Information for an Order
// @route   GET /api/orders/:id/tracking
// @access  Private (Order Owner/Admin)
export const getTrackingInfo = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const orderId = req.params.id;
  
      if (!ObjectId.isValid(orderId)) {
        res.status(400);
        throw new Error("Invalid order ID");
      }
  
      const order = await Order.findById(orderId).populate("user", "email name");
  
      if (!order) {
        res.status(404);
        throw new Error("Order not found");
      }
  
      // Check if the requesting user is the owner or an admin
      if (
        order.user._id.toString() !== (req.user?._id as string).toString() &&
        req.user?.role !== "admin"
      ) {
        res.status(403);
        throw new Error("Not authorized to view tracking information");
      }
  
      if (!order.trackingInfo) {
        res.status(404);
        throw new Error("Tracking information not available for this order");
      }
  
      res.status(200).json(order.trackingInfo);
    } catch (error) {
      next(error);
    }
  };

// Note: No changes needed for existing getAllOrders and getMyOrders functions unless further enhancements are desired.
