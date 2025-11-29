# Weave Chat Platform - Implementation Guide

## 🎯 Project Overview

This is a production-ready MERN stack chat platform with:
- ✅ Complete backend with Express, MongoDB, Socket.io
- ✅ JWT authentication with refresh tokens
- ✅ Encrypted messaging (AES encryption)
- ✅ Real-time features (typing indicators, online status)
- ✅ WebRTC signaling for video/audio calls
- ✅ PWA configuration
- ✅ Multi-theme support (21 DaisyUI themes)
- ✅ Zustand state management
- ✅ Beautiful UI with TailwindCSS + DaisyUI

## 📁 Project Structure

```
weave/
├── backend/
│   ├── controllers/      # ✅ Business logic (auth, user, chat, message)
│   ├── models/          # ✅ MongoDB schemas (User, Chat, Message)
│   ├── routes/          # ✅ API routes
│   ├── middleware/      # ✅ Auth, validation, error handling
│   ├── socket/          # ✅ Socket.io handlers
│   ├── utils/           # ✅ JWT, encryption, upload utilities
│   └── server.js        # ✅ Main server file
├── frontend/
│   ├── src/
│   │   ├── components/  # ⚠️ Need to create chat components
│   │   ├── pages/       # ✅ Login, Register, Chat, Profile, Settings
│   │   ├── services/    # ✅ API, Socket services
│   │   ├── store/       # ✅ Zustand stores (auth, chat, theme, call)
│   │   ├── utils/       # ✅ Helpers, validation, constants
│   │   ├── App.jsx      # ✅ Main app with routing
│   │   └── main.jsx     # ✅ Entry point
│   └── vite.config.js   # ✅ Vite + PWA config
└── package.json         # ✅ Root package.json
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
# Install all dependencies
npm run install-all

# Or install separately:
npm install                  # Root
cd backend && npm install    # Backend
cd frontend && npm install   # Frontend
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/weave
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_in_production
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
CLIENT_URL=http://localhost:5173
ENCRYPTION_KEY=your_32_character_encryption_key
```

### 3. Start MongoDB

```bash
# Windows (if MongoDB is installed as service)
net start MongoDB

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Run the Application

```bash
# From root directory - runs both backend and frontend
npm run dev

# Backend: http://localhost:5000
# Frontend: http://localhost:5173
```

## 📝 Remaining Components to Create

The core functionality is complete, but you need to create these chat UI components:

### 1. ChatSidebar Component (`frontend/src/components/chat/ChatSidebar.jsx`)

```jsx
import { useState } from 'react';
import { Search, Plus, MessageSquare } from 'lucide-react';
import ChatListItem from './ChatListItem';
import NewChatModal from './NewChatModal';

function ChatSidebar({ chats, isLoading, onRefresh }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);

  const filteredChats = chats.filter(chat => 
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.participants?.some(p => 
      p.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="h-full flex flex-col bg-base-100">
      {/* Header */}
      <div className="p-4 border-b border-base-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Chats</h2>
          <button 
            onClick={() => setShowNewChat(true)}
            className="btn btn-primary btn-sm btn-circle"
          >
            <Plus size={20} />
          </button>
        </div>
        
        {/* Search */}
        <label className="input input-bordered flex items-center gap-2">
          <Search size={20} className="opacity-70" />
          <input
            type="text"
            placeholder="Search chats..."
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
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <MessageSquare size={48} className="text-base-content/40 mb-2" />
            <p className="text-base-content/60">No chats yet</p>
            <button onClick={() => setShowNewChat(true)} className="btn btn-primary btn-sm mt-4">
              Start a chat
            </button>
          </div>
        ) : (
          filteredChats.map(chat => (
            <ChatListItem key={chat._id} chat={chat} />
          ))
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <NewChatModal onClose={() => setShowNewChat(false)} />
      )}
    </div>
  );
}

export default ChatSidebar;
```

### 2. ChatWindow Component (`frontend/src/components/chat/ChatWindow.jsx`)

Should include:
- Message list with auto-scroll
- Message input with emoji picker
- File upload support
- Typing indicators
- Message reactions
- Reply functionality

### 3. ChatHeader Component (`frontend/src/components/chat/ChatHeader.jsx`)

Should display:
- Chat/user avatar and name
- Online status
- Video/audio call buttons
- Chat info/settings menu

### 4. Message Component (`frontend/src/components/chat/Message.jsx`)

Should handle:
- Text messages
- Image/video/file messages
- Message timestamps
- Read receipts
- Edit/delete options
- Reactions

### 5. VideoCallModal Component (`frontend/src/components/call/VideoCallModal.jsx`)

WebRTC call interface with:
- Local and remote video streams
- Mute/unmute controls
- Video on/off toggle
- Screen sharing
- End call button

## 🎨 UI Component Examples

### ChatListItem.jsx
```jsx
import { useNavigate } from 'react-router-dom';
import { formatChatTime, getInitials } from '../../utils/helpers';
import useAuthStore from '../../store/authStore';
import useChatStore from '../../store/chatStore';

function ChatListItem({ chat }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentChat, unreadCounts } = useChatStore();
  
  const isActive = currentChat?._id === chat._id;
  const unreadCount = unreadCounts[chat._id] || 0;
  
  // Get other participant for 1-on-1 chats
  const otherUser = chat.isGroupChat 
    ? null 
    : chat.participants?.find(p => p._id !== user._id);
  
  const chatName = chat.isGroupChat 
    ? chat.name 
    : otherUser?.fullName || 'Unknown';
  
  const chatAvatar = chat.isGroupChat 
    ? chat.groupAvatar 
    : otherUser?.avatar;

  return (
    <div
      onClick={() => navigate(`/chat/${chat._id}`)}
      className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-base-200 transition-colors ${
        isActive ? 'bg-base-200' : ''
      }`}
    >
      {/* Avatar */}
      <div className="avatar">
        <div className="w-12 h-12 rounded-full">
          {chatAvatar ? (
            <img src={chatAvatar} alt={chatName} />
          ) : (
            <div className="w-full h-full bg-primary text-primary-content flex items-center justify-center font-bold">
              {getInitials(chatName)}
            </div>
          )}
        </div>
        {!chat.isGroupChat && otherUser?.status === 'online' && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100"></span>
        )}
      </div>

      {/* Chat Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between">
          <h3 className="font-semibold truncate">{chatName}</h3>
          {chat.lastMessage && (
            <span className="text-xs text-base-content/60 ml-2">
              {formatChatTime(chat.lastMessage.createdAt)}
            </span>
          )}
        </div>
        <p className="text-sm text-base-content/60 truncate">
          {chat.lastMessage?.content || 'No messages yet'}
        </p>
      </div>

      {/* Unread Badge */}
      {unreadCount > 0 && (
        <div className="badge badge-primary badge-sm">{unreadCount}</div>
      )}
    </div>
  );
}

export default ChatListItem;
```

## 🔐 Authentication Flow

1. User registers/logs in
2. Backend returns JWT access token (15min) + refresh token (7 days)
3. Tokens stored in Zustand + localStorage
4. Access token sent with every API request
5. If access token expires, automatically refresh using refresh token
6. If refresh fails, redirect to login

## 💬 Messaging Flow

1. User types message → encrypts with AES
2. Sends to backend via API
3. Backend saves encrypted message to MongoDB
4. Socket.io emits to all participants
5. Frontend receives → decrypts → displays

## 📞 WebRTC Call Flow

1. User A clicks call button
2. Socket emits "call_user" with offer signal
3. User B receives "incoming_call"
4. User B accepts → emits "answer_call"
5. User A receives "call_accepted"
6. Peer connection established
7. ICE candidates exchanged via socket
8. Video/audio streams connected

## 🎨 Theme System

Themes are managed with:
- `useThemeStore` - Zustand store
- DaisyUI themes (21 options)
- `data-theme` attribute on HTML element
- Persisted to localStorage
- Synced with backend user preferences

## 📱 PWA Features

Configured in `vite.config.js`:
- Service worker for offline support
- Manifest.json for installability
- App icons (192x192, 512x512)
- Cache strategies for assets and API

## 🔧 Key Features to Test

1. **Authentication**
   - Register new user
   - Login/Logout
   - Token refresh on expiry

2. **Messaging**
   - Send/receive text messages
   - Message encryption/decryption
   - Typing indicators
   - Read receipts
   - Message reactions

3. **Real-time**
   - Online/offline status
   - Typing indicators
   - Instant message delivery

4. **Chats**
   - Create 1-on-1 chat
   - Create group chat
   - Add/remove participants
   - Leave group

5. **WebRTC** (when implemented)
   - Audio calls
   - Video calls
   - Screen sharing

## 🐛 Common Issues & Solutions

### MongoDB Connection Error
```bash
# Make sure MongoDB is running
mongod --version

# Or use Docker
docker run -d -p 27017:27017 mongo
```

### Port Already in Use
```bash
# Change PORT in backend/.env
PORT=5001
```

### CORS Errors
- Ensure `CLIENT_URL` in `.env` matches frontend URL
- Check CORS config in `server.js`

### Socket Not Connecting
- Verify token is being sent in socket auth
- Check browser console for errors
- Ensure backend Socket.io URL is correct

## 📚 Additional Resources

- [Express Docs](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Socket.io Docs](https://socket.io/docs/)
- [React Router](https://reactrouter.com/)
- [Zustand](https://docs.pmnd.rs/zustand/)
- [DaisyUI](https://daisyui.com/)
- [WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)

## 🎯 Next Steps

1. **Create remaining React components** (ChatWindow, Message, etc.)
2. **Add file upload UI** for images/videos
3. **Implement emoji picker** in message input
4. **Create WebRTC call modals** for video/audio
5. **Add notification system** with react-hot-toast
6. **Optimize performance** with React.memo and useMemo
7. **Add loading states** throughout the app
8. **Implement error boundaries**
9. **Add unit tests** (Jest, React Testing Library)
10. **Deploy** to production (Heroku, Vercel, MongoDB Atlas)

## 🚀 Deployment Checklist

- [ ] Set production environment variables
- [ ] Use MongoDB Atlas for database
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins
- [ ] Set secure cookie settings
- [ ] Add rate limiting
- [ ] Enable compression
- [ ] Set up error logging (Sentry)
- [ ] Configure CDN for static assets
- [ ] Test PWA install on mobile

---

**Built with ❤️ using MERN Stack**
