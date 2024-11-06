
import express from 'express';
import {
  getUserNotifications,
  markNotificationAsRead,
} from '../controllers/notificationController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Get all notifications for the logged-in user
router.get('/', protect, getUserNotifications);

// Mark a specific notification as read
router.put('/:id/read', protect, markNotificationAsRead);

export default router;
