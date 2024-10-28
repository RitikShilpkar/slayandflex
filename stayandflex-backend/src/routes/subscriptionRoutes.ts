import { Router } from 'express';
import {
  getPlans,
  subscribeToPlan,
  getMySubscriptions,
  cancelSubscription,
} from '../controllers/subscriptionController';
import { protect, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

// Public route to get available plans
router.get('/plans', getPlans);

// Private routes for brand owners
router.post('/', protect, authorizeRoles('brand'), subscribeToPlan);
router.get('/my', protect, authorizeRoles('brand'), getMySubscriptions);
router.put('/:id/cancel', protect, authorizeRoles('brand'), cancelSubscription);

export default router;
