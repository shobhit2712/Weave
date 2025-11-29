import express from 'express';
import {
  createChat,
  getChats,
  getChatById,
  updateChat,
  deleteChat,
  addParticipants,
  removeParticipant,
  leaveGroup,
  markAsRead
} from '../controllers/chat.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', createChat);
router.get('/', getChats);
router.get('/:id', getChatById);
router.put('/:id', updateChat);
router.delete('/:id', deleteChat);
router.post('/:id/participants', addParticipants);
router.delete('/:id/participants/:userId', removeParticipant);
router.post('/:id/leave', leaveGroup);
router.post('/:id/read', markAsRead);

export default router;
