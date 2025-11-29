import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, Image as ImageIcon } from 'lucide-react';
import useChatStore from '../../store/chatStore';
import useAuthStore from '../../store/authStore';
import { messageAPI } from '../../services/apiService';
import socketService from '../../services/socketService';
import { toast } from 'react-hot-toast';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import EmojiPicker from 'emoji-picker-react';

function ChatWindow({ chat }) {
  const { user } = useAuthStore();
  const { messages, setMessages, addMessage } = useChatStore();
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (chat) {
      loadMessages();
      socketService.joinChat(chat._id);
      
      return () => {
        socketService.leaveChat(chat._id);
      };
    }
  }, [chat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await messageAPI.getMessages(chat._id);
      setMessages(response.messages);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socketService.startTyping(chat._id);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.stopTyping(chat._id);
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsTyping(false);
    socketService.stopTyping(chat._id);

    console.log('📤 Sending message:', { chatId: chat._id, content: messageContent });

    try {
      const response = await messageAPI.sendMessage({
        chatId: chat._id,
        content: messageContent,
        messageType: 'text'
      });
      console.log('✅ Message sent successfully:', response);
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      toast.error('Failed to send message');
      setNewMessage(messageContent); // Restore message on error
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('chatId', chat._id);
    
    // Determine message type
    let messageType = 'file';
    if (file.type.startsWith('image/')) messageType = 'image';
    else if (file.type.startsWith('video/')) messageType = 'video';
    else if (file.type.startsWith('audio/')) messageType = 'audio';
    
    formData.append('messageType', messageType);

    try {
      await messageAPI.sendMessage(formData);
      toast.success('File sent successfully');
    } catch (error) {
      toast.error('Failed to send file');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <Message 
                key={message._id} 
                message={message} 
                isOwn={message.sender._id === user._id}
              />
            ))}
            <TypingIndicator chatId={chat._id} />
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-base-300 p-4">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          {/* File Upload */}
          <label className="btn btn-ghost btn-circle">
            <Paperclip size={20} />
            <input
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            />
          </label>

          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Type a message..."
              className="chat-input"
              rows="1"
            />
            
            {/* Emoji Picker Toggle */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-3 bottom-3 btn btn-ghost btn-xs btn-circle"
            >
              <Smile size={20} />
            </button>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
          </div>

          {/* Send Button */}
          <button
            type="submit"
            className="btn btn-primary btn-circle"
            disabled={!newMessage.trim()}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatWindow;
