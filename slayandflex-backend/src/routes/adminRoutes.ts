
import { Router } from 'express';
import { getAllUsers } from '../controllers/authController';
import { protect, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

router.get('/users', protect, authorizeRoles('admin'), getAllUsers);

export default router;
