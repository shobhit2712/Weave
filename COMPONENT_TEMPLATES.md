# Weave - Component Templates

This file contains code templates for the remaining UI components you need to create.

## 1. ChatWindow Component

Create: `frontend/src/components/chat/ChatWindow.jsx`

```jsx
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

    try {
      await messageAPI.sendMessage({
        chatId: chat._id,
        content: messageContent,
        messageType: 'text'
      });
    } catch (error) {
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
```

## 2. Message Component

Create: `frontend/src/components/chat/Message.jsx`

```jsx
import { useState } from 'react';
import { MoreVertical, Reply, Trash2, Edit2, Check, CheckCheck } from 'lucide-react';
import { formatMessageTime } from '../../utils/dateUtils';
import { messageAPI } from '../../services/apiService';
import { toast } from 'react-hot-toast';

function Message({ message, isOwn }) {
  const [showMenu, setShowMenu] = useState(false);

  const handleReact = async (emoji) => {
    try {
      await messageAPI.addReaction(message._id, emoji);
    } catch (error) {
      toast.error('Failed to add reaction');
    }
  };

  const handleDelete = async () => {
    try {
      await messageAPI.deleteMessage(message._id);
      toast.success('Message deleted');
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  if (message.isDeleted) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className="message-bubble bg-base-300 text-base-content/50 italic">
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group`}>
      <div className="flex flex-col max-w-[70%]">
        {/* Sender Name (for group chats) */}
        {!isOwn && (
          <span className="text-xs text-base-content/60 mb-1 px-2">
            {message.sender.fullName}
          </span>
        )}

        {/* Message Content */}
        <div className={`message-bubble ${isOwn ? 'sent' : 'received'} relative`}>
          {/* Reply to message */}
          {message.replyTo && (
            <div className="border-l-4 border-primary pl-2 mb-2 text-sm opacity-70">
              <p className="font-semibold">{message.replyTo.sender.fullName}</p>
              <p className="truncate">{message.replyTo.content}</p>
            </div>
          )}

          {/* Text Content */}
          {message.messageType === 'text' && (
            <p className="break-words whitespace-pre-wrap">{message.content}</p>
          )}

          {/* Image */}
          {message.messageType === 'image' && (
            <div>
              <img 
                src={`http://localhost:5000${message.fileUrl}`}
                alt="Shared image"
                className="rounded-lg max-w-full h-auto cursor-pointer"
                onClick={() => window.open(`http://localhost:5000${message.fileUrl}`, '_blank')}
              />
              {message.content && <p className="mt-2">{message.content}</p>}
            </div>
          )}

          {/* File */}
          {message.messageType === 'file' && (
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <p className="font-medium">{message.fileName}</p>
                <p className="text-xs opacity-70">{(message.fileSize / 1024).toFixed(2)} KB</p>
              </div>
              <a 
                href={`http://localhost:5000${message.fileUrl}`}
                download
                className="btn btn-sm btn-circle"
              >
                📥
              </a>
            </div>
          )}

          {/* Message Menu */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="absolute -right-8 top-0 btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical size={16} />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-base-100 shadow-lg rounded-lg p-2 z-10">
              <button className="btn btn-ghost btn-sm w-full justify-start">
                <Reply size={16} /> Reply
              </button>
              {isOwn && (
                <>
                  <button className="btn btn-ghost btn-sm w-full justify-start">
                    <Edit2 size={16} /> Edit
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="btn btn-ghost btn-sm w-full justify-start text-error"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex gap-1 mt-1 px-2">
            {message.reactions.map((reaction, idx) => (
              <div key={idx} className="badge badge-sm">
                {reaction.emoji}
              </div>
            ))}
          </div>
        )}

        {/* Timestamp and Status */}
        <div className={`flex items-center gap-1 text-xs text-base-content/60 mt-1 px-2 ${isOwn ? 'justify-end' : ''}`}>
          <span>{formatMessageTime(message.createdAt)}</span>
          {message.isEdited && <span>(edited)</span>}
          {isOwn && (
            message.readBy?.length > 0 ? <CheckCheck size={14} className="text-primary" /> : <Check size={14} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Message;
```

## 3. ChatHeader Component

Create: `frontend/src/components/chat/ChatHeader.jsx`

```jsx
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
```

## 4. Additional Helper Components

### TypingIndicator.jsx
```jsx
import useChatStore from '../../store/chatStore';

function TypingIndicator({ chatId }) {
  const { typingUsers } = useChatStore();
  const typing = typingUsers[chatId] || [];

  if (typing.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex gap-1">
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
      </div>
      <span className="text-sm text-base-content/60">
        {typing.length === 1 ? 'Someone is' : `${typing.length} people are`} typing...
      </span>
    </div>
  );
}

export default TypingIndicator;
```

### NewChatModal.jsx
```jsx
import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { userAPI, chatAPI } from '../../services/apiService';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function NewChatModal({ onClose }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await userAPI.searchUsers(query);
      setSearchResults(response.users);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateChat = async (userId) => {
    try {
      const response = await chatAPI.createChat({
        participantId: userId,
        isGroupChat: false
      });
      navigate(`/chat/${response.chat._id}`);
      onClose();
      toast.success('Chat created');
    } catch (error) {
      toast.error('Failed to create chat');
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">New Chat</h3>
          <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm">
            <X size={20} />
          </button>
        </div>

        <label className="input input-bordered flex items-center gap-2 mb-4">
          <Search size={20} className="opacity-70" />
          <input
            type="text"
            placeholder="Search users..."
            className="grow"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
          />
        </label>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner"></span>
            </div>
          ) : searchResults.length === 0 ? (
            <p className="text-center text-base-content/60 py-8">
              {searchQuery ? 'No users found' : 'Search for users to chat with'}
            </p>
          ) : (
            searchResults.map(user => (
              <div
                key={user._id}
                onClick={() => handleCreateChat(user._id)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 cursor-pointer"
              >
                <div className="avatar">
                  <div className="w-10 h-10 rounded-full">
                    <img src={user.avatar} alt={user.fullName} />
                  </div>
                </div>
                <div>
                  <p className="font-medium">{user.fullName}</p>
                  <p className="text-sm text-base-content/60">@{user.username}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}

export default NewChatModal;
```

---

Copy these templates and adjust as needed. All the backend logic and state management is already complete!
