
import Notification from '../models/Notification';
import User from '../models/User';
import sendEmail from '../utils/emailService';
import sendSMS from '../utils/smsService';
import { IUser } from '../models/User';
import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

interface CreateNotificationOptions {
  userId: string;
  type: string;
  message: string;
  emailSubject?: string;
  emailBody?: string;
  smsBody?: string;
}

export const createNotification = async ({
  userId,
  type,
  message,
  emailSubject,
  emailBody,
  smsBody,
}: CreateNotificationOptions) => {
  try {
    const user: any | null = await User.findById(userId);
    if (!user) {
      return;
    }

    // Create In-App Notification
    const notification = new Notification({
      user: userId,
      type,
      message,
    });
    await notification.save();

    // Send Email Notification if enabled
    if (user.notificationPreferences.email && emailSubject && emailBody) {
      await sendEmail({
        to: user.email,
        subject: emailSubject,
        html: emailBody,
      });
    }

    // Send SMS Notification if enabled and phone number exists
    if (user.notificationPreferences.sms && user.phoneNumber && smsBody) {
      await sendSMS({
        to: user.phoneNumber,
        body: smsBody,
      });
    }

    return notification;
  } catch (error) {
    throw error;
  }
};


// @desc    Get User Notifications
// @route   GET /api/notifications
// @access  Private
export const getUserNotifications = async (
  req: AuthenticatedRequest & { user?: any },
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to latest 50 notifications

    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};


// @desc    Mark Notification as Read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markNotificationAsRead = async (
    req: AuthenticatedRequest & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const notificationId = req.params.id;
      const userId = req.user._id;
  
      const notification = await Notification.findOne({ _id: notificationId, user: userId });
  
      if (!notification) {
        res.status(404);
        throw new Error('Notification not found');
      }
  
      notification.read = true;
      await notification.save();
  
      res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
      next(error);
    }
  };