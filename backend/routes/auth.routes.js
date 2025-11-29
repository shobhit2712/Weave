import express from 'express';
import { 
  register, 
  login, 
  logout, 
  refreshToken, 
  getMe,
  verifyEmail
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { 
  registerValidation, 
  loginValidation, 
  validate 
} from '../middleware/validation.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/refresh', refreshToken);
router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;
