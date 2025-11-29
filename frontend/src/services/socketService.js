import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';
import useChatStore from '../store/chatStore';
import useCallStore from '../store/callStore';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect() {
    const { accessToken } = useAuthStore.getState();
    
    if (!accessToken) {
      console.error('No access token available');
      return;
    }

    this.socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: {
        token: accessToken
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.connected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.setupListeners();
  }

  setupListeners() {
    if (!this.socket) return;

    // Call events
    this.socket.on('incoming_call', ({ signal, from, caller, callType }) => {
      console.log('📞 Incoming call from:', caller);
      useCallStore.getState().receiveCall(callType, caller);
    });

    this.socket.on('call_accepted', ({ signal, from }) => {
      console.log('✅ Call accepted by:', from);
      // Handle peer connection setup with signal
    });

    this.socket.on('call_rejected', ({ from }) => {
      console.log('❌ Call rejected by:', from);
      useCallStore.getState().endCall();
    });

    this.socket.on('call_ended', ({ from }) => {
      console.log('📴 Call ended by:', from);
      useCallStore.getState().endCall();
    });

    // Message events
    this.socket.on('new_message', (message) => {
      console.log('📩 Received new message via socket:', message);
      
      // Only add message if it's for the current chat
      const currentChat = useChatStore.getState().currentChat;
      if (currentChat && currentChat._id === message.chat) {
        useChatStore.getState().addMessage(message);
      }
      
      // Update last message in chat
      useChatStore.getState().updateChat(message.chat, {
        lastMessage: message
      });
      
      // Increment unread count if not in current chat
      if (!currentChat || currentChat._id !== message.chat) {
        useChatStore.getState().incrementUnreadCount(message.chat);
      }
    });

    this.socket.on('message_updated', (message) => {
      useChatStore.getState().updateMessage(message._id, message);
    });

    this.socket.on('message_deleted', ({ messageId }) => {
      useChatStore.getState().deleteMessage(messageId);
    });

    this.socket.on('message_reaction', ({ messageId, reactions }) => {
      useChatStore.getState().updateMessage(messageId, { reactions });
    });

    // Typing events
    this.socket.on('user_typing', ({ chatId, userId, isTyping }) => {
      useChatStore.getState().setTyping(chatId, userId, isTyping);
    });

    // User status events
    this.socket.on('user_status_change', ({ userId, status, lastSeen }) => {
      if (status === 'online') {
        useChatStore.getState().addOnlineUser(userId);
      } else {
        useChatStore.getState().removeOnlineUser(userId);
      }
    });

    // Read receipts
    this.socket.on('message_read_receipt', ({ messageId, userId, readAt }) => {
      const messages = useChatStore.getState().messages;
      const message = messages.find(m => m._id === messageId);
      
      if (message) {
        const updatedReadBy = [...(message.readBy || []), { user: userId, readAt }];
        useChatStore.getState().updateMessage(messageId, { readBy: updatedReadBy });
      }
    });
  }

  // Chat operations
  joinChat(chatId) {
    if (this.socket) {
      this.socket.emit('join_chat', chatId);
    }
  }

  leaveChat(chatId) {
    if (this.socket) {
      this.socket.emit('leave_chat', chatId);
    }
  }

  // Typing indicators
  startTyping(chatId) {
    if (this.socket) {
      this.socket.emit('typing_start', { chatId });
    }
  }

  stopTyping(chatId) {
    if (this.socket) {
      this.socket.emit('typing_stop', { chatId });
    }
  }

  // Read receipts
  markMessageAsRead(messageId, chatId) {
    if (this.socket) {
      this.socket.emit('message_read', { messageId, chatId });
    }
  }

  markMessageAsDelivered(messageId, chatId) {
    if (this.socket) {
      this.socket.emit('message_delivered', { messageId, chatId });
    }
  }

  // User status
  changeStatus(status) {
    if (this.socket) {
      this.socket.emit('change_status', { status });
    }
  }

  // WebRTC call signaling
  initiateCall(userToCall, callType) {
    if (this.socket) {
      const { user } = useAuthStore.getState();
      console.log('🟢 Emitting call_user:', { userToCall, callType, from: this.socket.id });
      this.socket.emit('call_user', {
        userToCall,
        from: this.socket.id,
        caller: {
          _id: user._id,
          fullName: user.fullName,
          avatar: user.avatar
        },
        callType
      });
    } else {
      console.error('❌ Socket not connected');
    }
  }

  callUser(userToCall, signalData, callType) {
    if (this.socket) {
      const { user } = useAuthStore.getState();
      this.socket.emit('call_user', {
        userToCall,
        signalData,
        from: this.socket.id,
        name: user.fullName,
        callType
      });
    }
  }

  answerCall(signal, to) {
    if (this.socket) {
      this.socket.emit('answer_call', { signal, to });
    }
  }

  rejectCall(to) {
    if (this.socket) {
      this.socket.emit('reject_call', { to });
    }
  }

  endCall(to) {
    if (this.socket) {
      this.socket.emit('end_call', { to });
    }
  }

  sendIceCandidate(to, candidate) {
    if (this.socket) {
      this.socket.emit('ice_candidate', { to, candidate });
    }
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Get socket instance for custom listeners
  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.connected && this.socket?.connected;
  }
}

const socketService = new SocketService();

export default socketService;
