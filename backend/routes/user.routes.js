import express from 'express';
import {
  updateProfile,
  changePassword,
  updateAvatar,
  searchUsers,
  getUserById,
  updateStatus,
  updateTheme,
  updateSettings
} from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { updateProfileValidation, changePasswordValidation, validate } from '../middleware/validation.middleware.js';
import { upload } from '../utils/upload.utils.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/search', searchUsers);
router.get('/:id', getUserById);
router.put('/profile', updateProfileValidation, validate, updateProfile);
router.put('/password', changePasswordValidation, validate, changePassword);
router.put('/avatar', upload.single('avatar'), updateAvatar);
router.put('/status', updateStatus);
router.put('/theme', updateTheme);
router.put('/settings', updateSettings);

export default router;
