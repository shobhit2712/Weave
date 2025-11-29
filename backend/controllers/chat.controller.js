import Chat from '../models/Chat.model.js';
import Message from '../models/Message.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';

// @desc    Create new chat
// @route   POST /api/chats
// @access  Private
export const createChat = asyncHandler(async (req, res) => {
  const { participantId, isGroupChat, name, participants, groupDescription } = req.body;

  if (!isGroupChat) {
    // One-on-one chat
    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required'
      });
    }

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      isGroupChat: false,
      participants: { $all: [req.user._id, participantId], $size: 2 }
    })
      .populate('participants', 'username fullName avatar status lastSeen')
      .populate('lastMessage');

    if (existingChat) {
      return res.status(200).json({
        success: true,
        message: 'Chat already exists',
        chat: existingChat
      });
    }

    // Create new one-on-one chat
    const chat = await Chat.create({
      participants: [req.user._id, participantId],
      isGroupChat: false,
      createdBy: req.user._id
    });

    const populatedChat = await Chat.findById(chat._id)
      .populate('participants', 'username fullName avatar status lastSeen');

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      chat: populatedChat
    });
  } else {
    // Group chat
    if (!name || !participants || participants.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Group name and at least 2 participants are required'
      });
    }

    // Add creator to participants if not included
    const allParticipants = [...new Set([req.user._id.toString(), ...participants])];

    if (allParticipants.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Group chat must have at least 3 participants'
      });
    }

    const chat = await Chat.create({
      name,
      isGroupChat: true,
      participants: allParticipants,
      admins: [req.user._id],
      createdBy: req.user._id,
      groupDescription: groupDescription || ''
    });

    const populatedChat = await Chat.findById(chat._id)
      .populate('participants', 'username fullName avatar status lastSeen')
      .populate('admins', 'username fullName avatar');

    res.status(201).json({
      success: true,
      message: 'Group chat created successfully',
      chat: populatedChat
    });
  }
});

// @desc    Get user's chats
// @route   GET /api/chats
// @access  Private
export const getChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({
    participants: req.user._id
  })
    .populate('participants', 'username fullName avatar status lastSeen')
    .populate('admins', 'username fullName')
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'username fullName avatar'
      }
    })
    .sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    count: chats.length,
    chats
  });
});

// @desc    Get chat by ID
// @route   GET /api/chats/:id
// @access  Private
export const getChatById = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id)
    .populate('participants', 'username fullName avatar status lastSeen')
    .populate('admins', 'username fullName avatar')
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'username fullName avatar'
      }
    });

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found'
    });
  }

  // Check if user is participant
  if (!chat.participants.some(p => p._id.toString() === req.user._id.toString())) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this chat'
    });
  }

  res.status(200).json({
    success: true,
    chat
  });
});

// @desc    Update chat
// @route   PUT /api/chats/:id
// @access  Private
export const updateChat = asyncHandler(async (req, res) => {
  const { name, groupDescription, groupAvatar } = req.body;

  const chat = await Chat.findById(req.params.id);

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found'
    });
  }

  // Check if user is admin (for group chats)
  if (chat.isGroupChat && !chat.admins.includes(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: 'Only admins can update group chat'
    });
  }

  if (!chat.isGroupChat) {
    return res.status(400).json({
      success: false,
      message: 'Cannot update one-on-one chat'
    });
  }

  if (name) chat.name = name;
  if (groupDescription !== undefined) chat.groupDescription = groupDescription;
  if (groupAvatar) chat.groupAvatar = groupAvatar;

  await chat.save();

  const populatedChat = await Chat.findById(chat._id)
    .populate('participants', 'username fullName avatar status lastSeen')
    .populate('admins', 'username fullName avatar');

  res.status(200).json({
    success: true,
    message: 'Chat updated successfully',
    chat: populatedChat
  });
});

// @desc    Delete chat
// @route   DELETE /api/chats/:id
// @access  Private
export const deleteChat = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id);

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found'
    });
  }

  // Only creator or admin can delete
  if (chat.isGroupChat) {
    if (!chat.admins.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete group chat'
      });
    }
  } else {
    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this chat'
      });
    }
  }

  // Delete all messages in chat
  await Message.deleteMany({ chat: chat._id });

  // Delete chat
  await chat.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Chat deleted successfully'
  });
});

// @desc    Add participants to group
// @route   POST /api/chats/:id/participants
// @access  Private
export const addParticipants = asyncHandler(async (req, res) => {
  const { userIds } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'User IDs are required'
    });
  }

  const chat = await Chat.findById(req.params.id);

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found'
    });
  }

  if (!chat.isGroupChat) {
    return res.status(400).json({
      success: false,
      message: 'Can only add participants to group chats'
    });
  }

  // Check if user is admin
  if (!chat.admins.includes(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: 'Only admins can add participants'
    });
  }

  // Add new participants
  const newParticipants = userIds.filter(id => !chat.participants.includes(id));
  chat.participants.push(...newParticipants);

  await chat.save();

  const populatedChat = await Chat.findById(chat._id)
    .populate('participants', 'username fullName avatar status lastSeen')
    .populate('admins', 'username fullName avatar');

  res.status(200).json({
    success: true,
    message: 'Participants added successfully',
    chat: populatedChat
  });
});

// @desc    Remove participant from group
// @route   DELETE /api/chats/:id/participants/:userId
// @access  Private
export const removeParticipant = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const chat = await Chat.findById(req.params.id);

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found'
    });
  }

  if (!chat.isGroupChat) {
    return res.status(400).json({
      success: false,
      message: 'Can only remove participants from group chats'
    });
  }

  // Check if user is admin
  if (!chat.admins.includes(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: 'Only admins can remove participants'
    });
  }

  // Remove participant
  chat.participants = chat.participants.filter(p => p.toString() !== userId);
  chat.admins = chat.admins.filter(a => a.toString() !== userId);

  await chat.save();

  const populatedChat = await Chat.findById(chat._id)
    .populate('participants', 'username fullName avatar status lastSeen')
    .populate('admins', 'username fullName avatar');

  res.status(200).json({
    success: true,
    message: 'Participant removed successfully',
    chat: populatedChat
  });
});

// @desc    Leave group
// @route   POST /api/chats/:id/leave
// @access  Private
export const leaveGroup = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id);

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found'
    });
  }

  if (!chat.isGroupChat) {
    return res.status(400).json({
      success: false,
      message: 'Can only leave group chats'
    });
  }

  // Remove user from participants and admins
  chat.participants = chat.participants.filter(p => p.toString() !== req.user._id.toString());
  chat.admins = chat.admins.filter(a => a.toString() !== req.user._id.toString());

  // If no participants left, delete chat
  if (chat.participants.length === 0) {
    await Message.deleteMany({ chat: chat._id });
    await chat.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Group chat deleted as no participants remain'
    });
  }

  // If no admins left, make first participant admin
  if (chat.admins.length === 0 && chat.participants.length > 0) {
    chat.admins.push(chat.participants[0]);
  }

  await chat.save();

  res.status(200).json({
    success: true,
    message: 'Left group successfully'
  });
});

// @desc    Mark chat as read
// @route   POST /api/chats/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id);

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found'
    });
  }

  // Reset unread count for user
  chat.unreadCount.set(req.user._id.toString(), 0);
  await chat.save();

  // Mark all messages as read
  await Message.updateMany(
    {
      chat: chat._id,
      sender: { $ne: req.user._id },
      'readBy.user': { $ne: req.user._id }
    },
    {
      $push: {
        readBy: {
          user: req.user._id,
          readAt: new Date()
        }
      }
    }
  );

  res.status(200).json({
    success: true,
    message: 'Chat marked as read'
  });
});
