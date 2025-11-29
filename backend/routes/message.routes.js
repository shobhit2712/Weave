import express from 'express';
import {
  sendMessage,
  getMessages,
  updateMessage,
  deleteMessage,
  deleteMessageForMe,
  addReaction,
  removeReaction
} from '../controllers/message.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { upload } from '../utils/upload.utils.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', upload.single('file'), sendMessage);
router.get('/:chatId', getMessages);
router.put('/:id', updateMessage);
router.delete('/:id', deleteMessage);
router.delete('/:id/forme', deleteMessageForMe);
router.post('/:id/react', addReaction);
router.delete('/:id/react', removeReaction);

export default router;
