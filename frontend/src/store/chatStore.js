import { create } from 'zustand';

const useChatStore = create((set, get) => ({
  chats: [],
  currentChat: null,
  messages: [],
  onlineUsers: [],
  typingUsers: {},
  unreadCounts: {},

  setChats: (chats) => set({ chats }),
  
  addChat: (chat) => set((state) => ({
    chats: [chat, ...state.chats]
  })),
  
  updateChat: (chatId, updates) => set((state) => ({
    chats: state.chats.map(chat => 
      chat._id === chatId ? { ...chat, ...updates } : chat
    )
  })),
  
  removeChat: (chatId) => set((state) => ({
    chats: state.chats.filter(chat => chat._id !== chatId),
    currentChat: state.currentChat?._id === chatId ? null : state.currentChat
  })),
  
  setCurrentChat: (chat) => set({ currentChat: chat, messages: [] }),
  
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  updateMessage: (messageId, updates) => set((state) => ({
    messages: state.messages.map(msg => 
      msg._id === messageId ? { ...msg, ...updates } : msg
    )
  })),
  
  deleteMessage: (messageId) => set((state) => ({
    messages: state.messages.filter(msg => msg._id !== messageId)
  })),
  
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  
  addOnlineUser: (userId) => set((state) => ({
    onlineUsers: [...new Set([...state.onlineUsers, userId])]
  })),
  
  removeOnlineUser: (userId) => set((state) => ({
    onlineUsers: state.onlineUsers.filter(id => id !== userId)
  })),
  
  setTyping: (chatId, userId, isTyping) => set((state) => {
    const typingUsers = { ...state.typingUsers };
    if (!typingUsers[chatId]) {
      typingUsers[chatId] = [];
    }
    
    if (isTyping) {
      if (!typingUsers[chatId].includes(userId)) {
        typingUsers[chatId].push(userId);
      }
    } else {
      typingUsers[chatId] = typingUsers[chatId].filter(id => id !== userId);
    }
    
    return { typingUsers };
  }),
  
  setUnreadCount: (chatId, count) => set((state) => ({
    unreadCounts: { ...state.unreadCounts, [chatId]: count }
  })),
  
  incrementUnreadCount: (chatId) => set((state) => ({
    unreadCounts: { 
      ...state.unreadCounts, 
      [chatId]: (state.unreadCounts[chatId] || 0) + 1 
    }
  })),
  
  clearUnreadCount: (chatId) => set((state) => ({
    unreadCounts: { ...state.unreadCounts, [chatId]: 0 }
  })),
  
  reset: () => set({
    chats: [],
    currentChat: null,
    messages: [],
    onlineUsers: [],
    typingUsers: {},
    unreadCounts: {}
  })
}));

export default useChatStore;
