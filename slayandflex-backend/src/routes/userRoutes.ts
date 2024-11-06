import { Router } from 'express';
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.put('/change-password', protect, changePassword);

// Address routes
router
  .route('/addresses')
  .get(protect, getAddresses)
  .post(protect, addAddress);

router
  .route('/addresses/:id')
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

export default router;
