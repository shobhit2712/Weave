# Quick Start Guide - Weave Chat Platform

## ⚡ Fastest Way to Get Started

### 1. Install All Dependencies (One Command)

```bash
npm run install-all
```

This will install dependencies for root, backend, and frontend.

### 2. Setup MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB from https://www.mongodb.com/try/download/community
# Then start it:
mongod
```

**Option B: Docker (Recommended)**
```bash
docker run -d -p 27017:27017 --name weave-mongodb mongo:latest
```

**Option C: MongoDB Atlas (Cloud)**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get connection string
- Use in .env file

### 3. Configure Environment

```bash
cd backend
cp .env.example .env
```

**Edit `backend/.env`:**
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/weave
JWT_SECRET=my_super_secret_jwt_key_12345678
JWT_REFRESH_SECRET=my_super_secret_refresh_key_87654321
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
CLIENT_URL=http://localhost:5173
ENCRYPTION_KEY=this_is_a_32_character_key_ok?
```

**Important:** Change secrets in production!

### 4. Start the Application

From the root directory:

```bash
npm run dev
```

This starts both backend (port 5000) and frontend (port 5173) simultaneously.

### 5. Open Your Browser

Navigate to: **http://localhost:5173**

## 🎯 What Works Out of the Box

✅ **Complete Backend:**
- User registration & login
- JWT authentication with refresh tokens
- MongoDB database with User, Chat, Message models
- Socket.io for real-time messaging
- Message encryption (AES)
- File upload support
- WebRTC signaling for calls
- Rate limiting & security headers

✅ **Frontend Core:**
- Login/Register pages with validation
- Profile & Settings pages
- Theme switcher (21 themes!)
- Zustand state management
- API & Socket services
- Beautiful UI with DaisyUI

✅ **Real-time Features:**
- Online/offline status
- Typing indicators
- Instant message delivery
- Read receipts

## 📦 What You Need to Add

You need to create these React components (templates provided in `COMPONENT_TEMPLATES.md`):

1. **ChatSidebar** - List of chats with search
2. **ChatWindow** - Message list and input area
3. **ChatHeader** - Chat info and call buttons
4. **Message** - Individual message component
5. **TypingIndicator** - Show when users are typing
6. **NewChatModal** - Create new chat dialog
7. **VideoCallModal** - WebRTC call interface (optional)

All templates are ready in `COMPONENT_TEMPLATES.md` - just copy and paste!

## 🧪 Test the Application

### 1. Register Two Users

1. Open http://localhost:5173/register
2. Create first user (e.g., alice@test.com)
3. Logout
4. Create second user (e.g., bob@test.com)

### 2. Create a Chat

1. Login as Alice
2. Click "New Chat" button
3. Search for Bob
4. Click to create chat

### 3. Send Messages

1. Type a message
2. Press Enter or click Send
3. See it appear instantly!

### 4. Test Real-time Features

1. Open two browser windows
2. Login as different users
3. Send messages back and forth
4. Watch typing indicators
5. See online/offline status

## 🎨 Try Different Themes

Click Settings → Choose from 21 beautiful themes:
- Light & Dark modes
- Cupcake, Bumblebee, Emerald
- Synthwave, Cyberpunk, Dracula
- And 15 more!

## 📱 Test PWA Features

### Desktop:
1. Open Chrome
2. Click install icon in address bar
3. App installs like native app!

### Mobile:
1. Open in Chrome/Safari
2. Click "Add to Home Screen"
3. Use like mobile app!

## 🔧 Common Setup Issues

### "Cannot find module" errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules backend/node_modules frontend/node_modules
npm run install-all
```

### MongoDB connection failed
```bash
# Check if MongoDB is running
mongod --version

# If using Docker, start container:
docker start weave-mongodb

# If new, create:
docker run -d -p 27017:27017 --name weave-mongodb mongo:latest
```

### Port 5000 already in use
```bash
# Option 1: Kill process on port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9

# Option 2: Change port in backend/.env
PORT=5001
```

### CORS errors
- Make sure `CLIENT_URL` in backend/.env matches frontend URL
- Default: `CLIENT_URL=http://localhost:5173`

### Socket not connecting
- Check browser console for errors
- Verify token is being sent
- Make sure backend is running

## 📂 Project Structure Overview

```
weave/
├── backend/
│   ├── controllers/      # API logic (COMPLETE ✅)
│   ├── models/          # Database schemas (COMPLETE ✅)
│   ├── routes/          # API endpoints (COMPLETE ✅)
│   ├── middleware/      # Auth, validation (COMPLETE ✅)
│   ├── socket/          # Real-time handlers (COMPLETE ✅)
│   ├── utils/           # Helpers (COMPLETE ✅)
│   └── server.js        # Main server (COMPLETE ✅)
│
├── frontend/
│   ├── src/
│   │   ├── components/  # UI components (TEMPLATES PROVIDED 📝)
│   │   ├── pages/       # Login, Register, Chat, etc (COMPLETE ✅)
│   │   ├── services/    # API, Socket (COMPLETE ✅)
│   │   ├── store/       # State management (COMPLETE ✅)
│   │   ├── utils/       # Helpers (COMPLETE ✅)
│   │   └── App.jsx      # Main app (COMPLETE ✅)
│   └── vite.config.js   # Build config + PWA (COMPLETE ✅)
│
├── IMPLEMENTATION_GUIDE.md  # Detailed documentation
├── COMPONENT_TEMPLATES.md   # Copy-paste components
└── QUICK_START.md          # This file!
```

## 🚀 Next Steps

1. ✅ **Backend is 100% complete** - No changes needed!
2. ✅ **Frontend core is complete** - Auth, routing, state, services all done!
3. 📝 **Add chat UI components** - Use templates from `COMPONENT_TEMPLATES.md`
4. 🎨 **Customize styling** - Themes already work, add your own touches!
5. 🎥 **Add video calls** - WebRTC signaling is ready, just need UI
6. 🚀 **Deploy** - See deployment guide in `IMPLEMENTATION_GUIDE.md`

## 💡 Pro Tips

### Development Workflow

**Terminal 1 (Root):**
```bash
npm run dev  # Runs both backend and frontend
```

**Or separate terminals:**

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### VS Code Extensions (Recommended)

- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- MongoDB for VS Code
- Thunder Client (API testing)

### Database Management

**View MongoDB data:**
```bash
# MongoDB Compass (GUI)
# Download: https://www.mongodb.com/products/compass

# Or use mongosh (CLI)
mongosh
use weave
db.users.find()
db.chats.find()
db.messages.find()
```

### API Testing

All endpoints are at: `http://localhost:5000/api`

**Test registration:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!",
    "fullName": "Test User"
  }'
```

## 📚 Additional Resources

- **Full Documentation:** See `IMPLEMENTATION_GUIDE.md`
- **Component Templates:** See `COMPONENT_TEMPLATES.md`
- **Backend API:** All endpoints documented in route files
- **Frontend Services:** Check `src/services/` for API usage

## 🎉 You're All Set!

The hardest part is done! The backend is complete, authentication works, real-time messaging is ready, and the UI foundation is solid. Just add the chat components using the provided templates, and you'll have a fully functional chat platform!

**Need help?** Check the documentation files or the inline comments in the code.

**Happy coding! 🚀**

---

**Built with:**
- ⚡ Vite + React
- 💚 MongoDB + Mongoose
- 🔐 JWT Authentication
- 🔌 Socket.io
- 🎨 TailwindCSS + DaisyUI
- 📹 WebRTC (signaling ready)
- 🔒 AES Encryption
- 📱 PWA Support
