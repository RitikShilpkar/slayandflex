
import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/authController';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.post('/logout', (req, res) => {
    res.clearCookie('token'); // Replace 'token' with your cookie name
    res.status(200).json({ message: 'Logged out successfully' });
  });

export default router;
