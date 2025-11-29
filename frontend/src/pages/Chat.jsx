import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import useChatStore from '../store/chatStore';
import { chatAPI } from '../services/apiService';
import socketService from '../services/socketService';
import toast from 'react-hot-toast';

// Import chat components (to be created)
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import ChatHeader from '../components/chat/ChatHeader';
import VideoCallModal from '../components/call/VideoCallModal';

function Chat() {
  const { chatId } = useParams();
  const { chats, setChats, currentChat, setCurrentChat } = useChatStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (chatId && chats.length > 0) {
      const chat = chats.find(c => c._id === chatId);
      if (chat) {
        setCurrentChat(chat);
        socketService.joinChat(chatId);
      }
    }
  }, [chatId, chats]);

  const loadChats = async () => {
    try {
      setIsLoading(true);
      const response = await chatAPI.getChats();
      setChats(response.chats);
    } catch (error) {
      toast.error('Failed to load chats');
      console.error('Load chats error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSelect = (chat) => {
    setCurrentChat(chat);
    setIsSidebarOpen(false); // Close sidebar on mobile after selecting chat
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-base-100 via-base-200/30 to-base-100">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} lg:block lg:w-80 shadow-lg`}>
        <ChatSidebar 
          onChatSelect={handleChatSelect}
          selectedChatId={currentChat?._id}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            <ChatHeader 
              chat={currentChat}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            <ChatWindow chat={currentChat} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-base-200 mb-4">
                <MessageSquare size={48} className="text-base-content/40" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Weave</h2>
              <p className="text-base-content/60">
                Select a chat to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Video Call Modal */}
      <VideoCallModal />
    </div>
  );
}

export default Chat;
