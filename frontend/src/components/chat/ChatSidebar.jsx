import { useState, useEffect } from 'react';
import { Search, Plus, Menu } from 'lucide-react';
import useChatStore from '../../store/chatStore';
import { chatAPI } from '../../services/apiService';
import { toast } from 'react-hot-toast';
import ChatListItem from './ChatListItem';
import NewChatModal from './NewChatModal';

function ChatSidebar({ onChatSelect, selectedChatId }) {
  const { chats, setChats } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setIsLoading(true);
      const response = await chatAPI.getChats();
      setChats(response.chats);
    } catch (error) {
      toast.error('Failed to load chats');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredChats = chats.filter(chat => {
    const chatName = chat.isGroupChat 
      ? chat.name 
      : chat.participants[0]?.fullName || '';
    return chatName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-full lg:w-80 border-r border-base-300 flex flex-col bg-base-100">
      {/* Header */}
      <div className="p-4 border-b border-base-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Messages</h2>
          <button 
            onClick={() => setShowNewChatModal(true)}
            className="btn btn-primary btn-circle btn-sm"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Search */}
        <label className="input input-bordered flex items-center gap-2">
          <Search size={18} className="opacity-70" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="grow"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <p className="text-base-content/60 mb-4">
              {searchQuery ? 'No chats found' : 'No conversations yet'}
            </p>
            <button 
              onClick={() => setShowNewChatModal(true)}
              className="btn btn-primary btn-sm"
            >
              Start a conversation
            </button>
          </div>
        ) : (
          <div>
            {filteredChats.map(chat => (
              <ChatListItem
                key={chat._id}
                chat={chat}
                isSelected={chat._id === selectedChatId}
                onClick={() => onChatSelect(chat)}
              />
            ))}
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <NewChatModal onClose={() => setShowNewChatModal(false)} />
      )}
    </div>
  );
}

export default ChatSidebar;
