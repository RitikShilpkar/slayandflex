import express from 'express';
import {
  createReturnRequest,
  getAllReturnRequests,
  getMyReturnRequests,
  updateReturnRequestStatus,
} from '../controllers/returnController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

// User Routes
router.post('/', protect, createReturnRequest);
router.get('/my-returns', protect, getMyReturnRequests);

// Admin Routes
router.get('/', protect, admin, getAllReturnRequests);
router.put('/:id', protect, admin, updateReturnRequestStatus);

export default router;
