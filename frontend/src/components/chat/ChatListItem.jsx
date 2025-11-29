import { formatMessageTime } from '../../utils/dateUtils';
import { getChatAvatar, generateChatName } from '../../utils/helpers';
import useAuthStore from '../../store/authStore';
import useChatStore from '../../store/chatStore';

function ChatListItem({ chat, isSelected, onClick }) {
  const { user } = useAuthStore();
  const { unreadCounts } = useChatStore();

  const chatName = chat.isGroupChat 
    ? chat.name 
    : generateChatName(chat.participants, user._id);
  
  const chatAvatar = getChatAvatar(chat, user._id);
  const unreadCount = unreadCounts[chat._id] || 0;

  const lastMessage = chat.lastMessage;
  const lastMessageText = lastMessage 
    ? lastMessage.messageType === 'text' 
      ? lastMessage.content 
      : `📎 ${lastMessage.messageType}`
    : 'No messages yet';

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-4 cursor-pointer transition-all duration-200 border-b border-base-300 hover:bg-gradient-to-r hover:from-base-200 hover:to-base-100 hover:shadow-sm ${
        isSelected ? 'bg-gradient-to-r from-primary/10 to-primary/5 border-l-4 border-l-primary' : ''
      }`}
    >
      {/* Avatar */}
      <div className="avatar">
        <div className="w-12 h-12 rounded-full">
          {chatAvatar ? (
            <img src={chatAvatar} alt={chatName} />
          ) : (
            <div className="w-full h-full bg-primary text-primary-content flex items-center justify-center font-bold text-lg">
              {chatName[0]}
            </div>
          )}
        </div>
      </div>

      {/* Chat Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold truncate">{chatName}</h3>
          {lastMessage && (
            <span className="text-xs text-base-content/60 whitespace-nowrap ml-2">
              {formatMessageTime(lastMessage.createdAt)}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-base-content/70 truncate flex-1">
            {lastMessageText}
          </p>
          
          {unreadCount > 0 && (
            <span className="badge badge-primary badge-sm ml-2">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatListItem;
