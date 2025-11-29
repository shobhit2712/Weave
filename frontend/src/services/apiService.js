import api from './api';

export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  }
};

export const userAPI = {
  updateProfile: async (updates) => {
    const response = await api.put('/users/profile', updates);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/users/password', passwordData);
    return response.data;
  },

  updateAvatar: async (formData) => {
    const response = await api.put('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  searchUsers: async (query) => {
    const response = await api.get(`/users/search?q=${query}`);
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  updateStatus: async (status) => {
    const response = await api.put('/users/status', { status });
    return response.data;
  },

  updateTheme: async (theme) => {
    const response = await api.put('/users/theme', { theme });
    return response.data;
  },

  updateSettings: async (settings) => {
    const response = await api.put('/users/settings', { settings });
    return response.data;
  }
};

export const chatAPI = {
  getChats: async () => {
    const response = await api.get('/chats');
    return response.data;
  },

  getChatById: async (chatId) => {
    const response = await api.get(`/chats/${chatId}`);
    return response.data;
  },

  createChat: async (chatData) => {
    const response = await api.post('/chats', chatData);
    return response.data;
  },

  updateChat: async (chatId, updates) => {
    const response = await api.put(`/chats/${chatId}`, updates);
    return response.data;
  },

  deleteChat: async (chatId) => {
    const response = await api.delete(`/chats/${chatId}`);
    return response.data;
  },

  addParticipants: async (chatId, userIds) => {
    const response = await api.post(`/chats/${chatId}/participants`, { userIds });
    return response.data;
  },

  removeParticipant: async (chatId, userId) => {
    const response = await api.delete(`/chats/${chatId}/participants/${userId}`);
    return response.data;
  },

  leaveGroup: async (chatId) => {
    const response = await api.post(`/chats/${chatId}/leave`);
    return response.data;
  },

  markAsRead: async (chatId) => {
    const response = await api.post(`/chats/${chatId}/read`);
    return response.data;
  }
};

export const messageAPI = {
  getMessages: async (chatId, page = 1, limit = 50) => {
    const response = await api.get(`/messages/${chatId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  sendMessage: async (messageData) => {
    const response = await api.post('/messages', messageData, {
      headers: messageData instanceof FormData 
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  updateMessage: async (messageId, content) => {
    const response = await api.put(`/messages/${messageId}`, { content });
    return response.data;
  },

  deleteMessage: async (messageId) => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  },

  deleteMessageForMe: async (messageId) => {
    const response = await api.delete(`/messages/${messageId}/forme`);
    return response.data;
  },

  addReaction: async (messageId, emoji) => {
    const response = await api.post(`/messages/${messageId}/react`, { emoji });
    return response.data;
  },

  removeReaction: async (messageId) => {
    const response = await api.delete(`/messages/${messageId}/react`);
    return response.data;
  }
};
