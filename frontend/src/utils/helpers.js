export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

export const isImageFile = (filename) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const extension = getFileExtension(filename).toLowerCase();
  return imageExtensions.includes(extension);
};

export const isVideoFile = (filename) => {
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov'];
  const extension = getFileExtension(filename).toLowerCase();
  return videoExtensions.includes(extension);
};

export const isAudioFile = (filename) => {
  const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a'];
  const extension = getFileExtension(filename).toLowerCase();
  return audioExtensions.includes(extension);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const generateChatName = (participants, currentUserId) => {
  const otherParticipants = participants.filter(p => p._id !== currentUserId);
  if (otherParticipants.length === 0) return 'Unknown';
  if (otherParticipants.length === 1) return otherParticipants[0].fullName;
  return otherParticipants.map(p => p.fullName).join(', ');
};

export const getChatAvatar = (chat, currentUserId) => {
  if (chat.isGroupChat) {
    return chat.groupAvatar || null;
  }
  
  const otherParticipant = chat.participants?.find(p => p._id !== currentUserId);
  return otherParticipant?.avatar || null;
};
