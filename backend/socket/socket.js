import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

// Store active users and their socket connections
const activeUsers = new Map(); // userId -> Set of socketIds
const socketToUser = new Map(); // socketId -> userId

export const initializeSocket = (io) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password -refreshToken');

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    
    console.log(`✅ User connected: ${socket.user.username} (${socket.id})`);

    // Add user to active users
    if (!activeUsers.has(userId)) {
      activeUsers.set(userId, new Set());
    }
    activeUsers.get(userId).add(socket.id);
    socketToUser.set(socket.id, userId);

    // Update user status to online
    User.findByIdAndUpdate(userId, {
      status: 'online',
      lastSeen: new Date()
    }).exec();

    // Notify others that user is online
    socket.broadcast.emit('user_status_change', {
      userId,
      status: 'online',
      lastSeen: new Date()
    });

    // Join user's personal room
    socket.join(userId);

    // Handle joining chat rooms
    socket.on('join_chat', (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.user.username} joined chat: ${chatId}`);
    });

    // Handle leaving chat rooms
    socket.on('leave_chat', (chatId) => {
      socket.leave(chatId);
      console.log(`User ${socket.user.username} left chat: ${chatId}`);
    });

    // Handle typing indicator
    socket.on('typing_start', ({ chatId }) => {
      socket.to(chatId).emit('user_typing', {
        chatId,
        userId,
        username: socket.user.username,
        isTyping: true
      });
    });

    socket.on('typing_stop', ({ chatId }) => {
      socket.to(chatId).emit('user_typing', {
        chatId,
        userId,
        username: socket.user.username,
        isTyping: false
      });
    });

    // Handle message read receipts
    socket.on('message_read', ({ messageId, chatId }) => {
      socket.to(chatId).emit('message_read_receipt', {
        messageId,
        userId,
        readAt: new Date()
      });
    });

    // Handle message delivered receipts
    socket.on('message_delivered', ({ messageId, chatId }) => {
      socket.to(chatId).emit('message_delivered_receipt', {
        messageId,
        userId,
        deliveredAt: new Date()
      });
    });

    // WebRTC Signaling for video/audio calls
    socket.on('call_user', ({ userToCall, signalData, from, caller, callType }) => {
      console.log(`📞 Call from ${caller?.fullName || 'unknown'} to ${userToCall}, type: ${callType}`);
      
      // Send incoming call notification to the receiver
      io.to(userToCall).emit('incoming_call', {
        signal: signalData,
        from: from || socket.id,
        caller: caller || {
          _id: userId,
          fullName: socket.user.fullName,
          avatar: socket.user.avatar
        },
        callType
      });
    });

    socket.on('answer_call', ({ signal, to }) => {
      io.to(to).emit('call_accepted', {
        signal,
        from: userId
      });
    });

    socket.on('reject_call', ({ to }) => {
      io.to(to).emit('call_rejected', {
        from: userId
      });
    });

    socket.on('end_call', ({ to }) => {
      io.to(to).emit('call_ended', {
        from: userId
      });
    });

    socket.on('ice_candidate', ({ to, candidate }) => {
      io.to(to).emit('ice_candidate', {
        candidate,
        from: userId
      });
    });

    // Handle user status change
    socket.on('change_status', async ({ status }) => {
      try {
        await User.findByIdAndUpdate(userId, {
          status,
          lastSeen: new Date()
        });

        socket.broadcast.emit('user_status_change', {
          userId,
          status,
          lastSeen: new Date()
        });
      } catch (error) {
        console.error('Error changing status:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${socket.user.username} (${socket.id})`);

      // Remove socket from active users
      if (activeUsers.has(userId)) {
        activeUsers.get(userId).delete(socket.id);

        // If user has no more active connections, mark as offline
        if (activeUsers.get(userId).size === 0) {
          activeUsers.delete(userId);

          try {
            await User.findByIdAndUpdate(userId, {
              status: 'offline',
              lastSeen: new Date()
            });

            socket.broadcast.emit('user_status_change', {
              userId,
              status: 'offline',
              lastSeen: new Date()
            });
          } catch (error) {
            console.error('Error updating user status on disconnect:', error);
          }
        }
      }

      socketToUser.delete(socket.id);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};

// Helper function to get user's socket IDs
export const getUserSockets = (userId) => {
  return activeUsers.get(userId) || new Set();
};

// Helper function to check if user is online
export const isUserOnline = (userId) => {
  return activeUsers.has(userId);
};

// Helper function to get all online users
export const getOnlineUsers = () => {
  return Array.from(activeUsers.keys());
};
