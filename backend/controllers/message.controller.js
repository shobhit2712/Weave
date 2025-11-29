import Message from '../models/Message.model.js';
import Chat from '../models/Chat.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { encryptMessage, decryptMessage } from '../utils/encryption.utils.js';

// @desc    Send message
// @route   POST /api/messages
// @access  Private
export const sendMessage = asyncHandler(async (req, res) => {
  const { chatId, content, messageType = 'text', replyTo } = req.body;
  const io = req.app.get('io');

  if (!chatId) {
    return res.status(400).json({
      success: false,
      message: 'Chat ID is required'
    });
  }

  // Check if chat exists and user is participant
  const chat = await Chat.findById(chatId);

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found'
    });
  }

  if (!chat.participants.includes(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to send message in this chat'
    });
  }

  // Prepare message data
  const messageData = {
    chat: chatId,
    sender: req.user._id,
    messageType
  };

  // Handle text messages
  if (messageType === 'text') {
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }
    // Encrypt message content
    messageData.content = encryptMessage(content);
    messageData.encrypted = true;
  }

  // Handle file messages
  if (messageType !== 'text') {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File is required for media messages'
      });
    }

    messageData.fileUrl = `/uploads/${messageType === 'image' ? 'images' : 'files'}/${req.file.filename}`;
    messageData.fileName = req.file.originalname;
    messageData.fileSize = req.file.size;
    messageData.mimeType = req.file.mimetype;

    // Add caption if provided
    if (content) {
      messageData.content = encryptMessage(content);
      messageData.encrypted = true;
    }
  }

  // Handle reply
  if (replyTo) {
    const replyMessage = await Message.findById(replyTo);
    if (replyMessage && replyMessage.chat.toString() === chatId) {
      messageData.replyTo = replyTo;
    }
  }

  // Create message
  const message = await Message.create(messageData);

  // Populate message
  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'username fullName avatar')
    .populate({
      path: 'replyTo',
      populate: { path: 'sender', select: 'username fullName avatar' }
    });

  // Update chat's last message
  chat.lastMessage = message._id;
  
  // Increment unread count for all participants except sender
  chat.participants.forEach(participantId => {
    if (participantId.toString() !== req.user._id.toString()) {
      const currentCount = chat.unreadCount.get(participantId.toString()) || 0;
      chat.unreadCount.set(participantId.toString(), currentCount + 1);
    }
  });

  await chat.save();

  // Prepare message for client (decrypt content)
  const messageForClient = populatedMessage.toObject();
  if (messageForClient.encrypted && messageForClient.content) {
    messageForClient.content = decryptMessage(messageForClient.content);
  }

  // Emit socket event
  io.to(chatId).emit('new_message', messageForClient);

  res.status(201).json({
    success: true,
    message: messageForClient
  });
});

// @desc    Get messages for a chat
// @route   GET /api/messages/:chatId
// @access  Private
export const getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  // Check if user is participant
  const chat = await Chat.findById(chatId);

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found'
    });
  }

  if (!chat.participants.includes(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view messages'
    });
  }

  // Get messages with pagination
  const messages = await Message.find({
    chat: chatId,
    $or: [
      { isDeleted: false },
      { isDeleted: true, deletedFor: { $ne: req.user._id } }
    ]
  })
    .populate('sender', 'username fullName avatar')
    .populate({
      path: 'replyTo',
      populate: { path: 'sender', select: 'username fullName avatar' }
    })
    .populate('reactions.user', 'username fullName avatar')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Decrypt messages
  const decryptedMessages = messages.map(msg => {
    const msgObj = msg.toObject();
    if (msgObj.encrypted && msgObj.content) {
      try {
        msgObj.content = decryptMessage(msgObj.content);
      } catch (error) {
        console.error('Decryption error:', error);
        msgObj.content = '[Decryption failed]';
      }
    }
    return msgObj;
  });

  const total = await Message.countDocuments({
    chat: chatId,
    $or: [
      { isDeleted: false },
      { isDeleted: true, deletedFor: { $ne: req.user._id } }
    ]
  });

  res.status(200).json({
    success: true,
    count: messages.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    messages: decryptedMessages.reverse()
  });
});

// @desc    Update message
// @route   PUT /api/messages/:id
// @access  Private
export const updateMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;

  const message = await Message.findById(req.params.id);

  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  // Only sender can edit
  if (message.sender.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to edit this message'
    });
  }

  // Can only edit text messages
  if (message.messageType !== 'text') {
    return res.status(400).json({
      success: false,
      message: 'Can only edit text messages'
    });
  }

  // Update message
  message.content = encryptMessage(content);
  message.isEdited = true;
  message.editedAt = new Date();

  await message.save();

  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'username fullName avatar');

  const messageForClient = populatedMessage.toObject();
  messageForClient.content = content;

  // Emit socket event
  const io = req.app.get('io');
  io.to(message.chat.toString()).emit('message_updated', messageForClient);

  res.status(200).json({
    success: true,
    message: messageForClient
  });
});

// @desc    Delete message for everyone
// @route   DELETE /api/messages/:id
// @access  Private
export const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  // Only sender can delete for everyone
  if (message.sender.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this message'
    });
  }

  // Mark as deleted
  message.isDeleted = true;
  message.deletedAt = new Date();
  message.content = '';

  await message.save();

  // Emit socket event
  const io = req.app.get('io');
  io.to(message.chat.toString()).emit('message_deleted', {
    messageId: message._id,
    chatId: message.chat
  });

  res.status(200).json({
    success: true,
    message: 'Message deleted successfully'
  });
});

// @desc    Delete message for me
// @route   DELETE /api/messages/:id/forme
// @access  Private
export const deleteMessageForMe = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  // Add user to deletedFor array
  if (!message.deletedFor.includes(req.user._id)) {
    message.deletedFor.push(req.user._id);
    await message.save();
  }

  res.status(200).json({
    success: true,
    message: 'Message deleted for you'
  });
});

// @desc    Add reaction to message
// @route   POST /api/messages/:id/react
// @access  Private
export const addReaction = asyncHandler(async (req, res) => {
  const { emoji } = req.body;

  if (!emoji) {
    return res.status(400).json({
      success: false,
      message: 'Emoji is required'
    });
  }

  const message = await Message.findById(req.params.id);

  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  // Remove existing reaction from user if any
  message.reactions = message.reactions.filter(
    r => r.user.toString() !== req.user._id.toString()
  );

  // Add new reaction
  message.reactions.push({
    user: req.user._id,
    emoji
  });

  await message.save();

  const populatedMessage = await Message.findById(message._id)
    .populate('reactions.user', 'username fullName avatar');

  // Emit socket event
  const io = req.app.get('io');
  io.to(message.chat.toString()).emit('message_reaction', {
    messageId: message._id,
    reactions: populatedMessage.reactions
  });

  res.status(200).json({
    success: true,
    reactions: populatedMessage.reactions
  });
});

// @desc    Remove reaction from message
// @route   DELETE /api/messages/:id/react
// @access  Private
export const removeReaction = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  // Remove user's reaction
  message.reactions = message.reactions.filter(
    r => r.user.toString() !== req.user._id.toString()
  );

  await message.save();

  // Emit socket event
  const io = req.app.get('io');
  io.to(message.chat.toString()).emit('message_reaction', {
    messageId: message._id,
    reactions: message.reactions
  });

  res.status(200).json({
    success: true,
    reactions: message.reactions
  });
});
