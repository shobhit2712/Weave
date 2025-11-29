import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';

export const formatMessageTime = (date) => {
  const messageDate = typeof date === 'string' ? parseISO(date) : date;
  return format(messageDate, 'HH:mm');
};

export const formatChatTime = (date) => {
  if (!date) return '';
  
  const messageDate = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(messageDate)) {
    return format(messageDate, 'HH:mm');
  } else if (isYesterday(messageDate)) {
    return 'Yesterday';
  } else {
    return format(messageDate, 'MMM d');
  }
};

export const formatLastSeen = (date) => {
  if (!date) return 'Never';
  
  const lastSeenDate = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(lastSeenDate, { addSuffix: true });
};

export const formatFullDate = (date) => {
  const messageDate = typeof date === 'string' ? parseISO(date) : date;
  return format(messageDate, 'PPpp');
};
