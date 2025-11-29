export const THEMES = [
  { value: 'weaveLight', label: 'Weave Light', icon: '☀️' },
  { value: 'weaveDark', label: 'Weave Dark', icon: '🌙' },
  { value: 'light', label: 'Light', icon: '💡' },
  { value: 'dark', label: 'Dark', icon: '🌑' },
  { value: 'corporate', label: 'Corporate', icon: '💼' },
  { value: 'business', label: 'Business', icon: '👔' },
  { value: 'winter', label: 'Winter', icon: '❄️' },
  { value: 'lofi', label: 'Lo-Fi', icon: '🎵' },
  { value: 'nord', label: 'Nord', icon: '🏔️' },
  { value: 'sunset', label: 'Sunset', icon: '🌅' }
];

export const STATUS_OPTIONS = [
  { value: 'online', label: 'Online', color: 'success' },
  { value: 'away', label: 'Away', color: 'warning' },
  { value: 'busy', label: 'Busy', color: 'error' },
  { value: 'offline', label: 'Offline', color: 'base-300' }
];

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  FILE: 'file',
  LOCATION: 'location'
};

export const CALL_TYPES = {
  AUDIO: 'audio',
  VIDEO: 'video'
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
export const ALLOWED_AUDIO_TYPES = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg'];
export const ALLOWED_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
  ...ALLOWED_AUDIO_TYPES,
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];
