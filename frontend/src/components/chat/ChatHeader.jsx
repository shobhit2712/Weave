import { Phone, Video, MoreVertical, Menu } from 'lucide-react';
import { getChatAvatar, generateChatName } from '../../utils/helpers';
import useAuthStore from '../../store/authStore';
import useCallStore from '../../store/callStore';

function ChatHeader({ chat, onToggleSidebar }) {
  const { user } = useAuthStore();
  const { startCall } = useCallStore();

  const chatName = chat.isGroupChat 
    ? chat.name 
    : generateChatName(chat.participants, user._id);
  
  const chatAvatar = getChatAvatar(chat, user._id);

  const otherUser = !chat.isGroupChat 
    ? chat.participants?.find(p => p._id !== user._id) 
    : null;

  const handleCall = (type) => {
    if (!chat.isGroupChat && otherUser) {
      startCall(type, otherUser._id);
    }
  };

  return (
    <div className="h-16 border-b border-base-300 px-4 flex items-center justify-between bg-base-100">
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="btn btn-ghost btn-circle lg:hidden">
          <Menu size={20} />
        </button>

        <div className="avatar">
          <div className="w-10 h-10 rounded-full">
            {chatAvatar ? (
              <img src={chatAvatar} alt={chatName} />
            ) : (
              <div className="w-full h-full bg-primary text-primary-content flex items-center justify-center font-bold">
                {chatName[0]}
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="font-semibold">{chatName}</h2>
          {otherUser && (
            <p className="text-xs text-base-content/60">
              {otherUser.status === 'online' ? 'Online' : 'Offline'}
            </p>
          )}
          {chat.isGroupChat && (
            <p className="text-xs text-base-content/60">
              {chat.participants.length} members
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!chat.isGroupChat && (
          <>
            <button 
              onClick={() => handleCall('audio')}
              className="btn btn-ghost btn-circle"
            >
              <Phone size={20} />
            </button>
            <button 
              onClick={() => handleCall('video')}
              className="btn btn-ghost btn-circle"
            >
              <Video size={20} />
            </button>
          </>
        )}
        <button className="btn btn-ghost btn-circle">
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  );
}

export default ChatHeader;
