import { Router } from 'express';
import {
  getPlans,
  subscribeToPlan,
  getMySubscription,
  cancelSubscription,
  addPlan,
} from '../controllers/subscriptionController';
import { protect, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

// Public route to get available plans
router.get('/plans', getPlans);

// Admin route to add a new plan
router.post('/plans', protect, authorizeRoles('admin'), addPlan);


// Private routes for brand owners
// router.post('/', protect, authorizeRoles('brand'), subscribeToPlan);
// router.get('/my', protect, authorizeRoles('brand'), getMySubscription);
// router.put('/:id/cancel', protect, authorizeRoles('brand'), cancelSubscription);

router.post('/plans/subscribe', protect,  subscribeToPlan);
router.get('/my', protect, getMySubscription);
router.put('/:id/cancel',protect, cancelSubscription);

export default router;
