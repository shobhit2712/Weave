# Weave - AI + Social Chat Platform

A modern, privacy-first PWA chat platform with real-time encrypted messaging, WebRTC video/audio calls, and beautiful UI.

## Features

- 🔐 **Secure Authentication**: JWT-based auth with refresh tokens and secure cookie handling
- 💬 **Real-time Messaging**: Encrypted instant messaging with Socket.io
- 📞 **WebRTC Calls**: High-quality video and audio calls with screen sharing
- 🎨 **Multi-theme UI**: Beautiful interface with DaisyUI and ShadCN components
- 📱 **Progressive Web App**: Installable with offline support
- 🔒 **Privacy-First**: End-to-end message encryption and secure data handling
- ⚡ **High Performance**: Optimized for speed and scalability

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS, DaisyUI, ShadCN UI
- **Backend**: Node.js, Express, MongoDB, Socket.io
- **Real-time**: Socket.io, WebRTC (Simple Peer)
- **Authentication**: JWT, bcrypt
- **Security**: Helmet, rate limiting, crypto-js encryption

## Quick Start

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm run install-all
   ```

2. **Configure environment variables**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your MongoDB URI and secrets
   ```

3. **Start development servers**:
   ```bash
   npm run dev
   ```

   This runs both backend (port 5000) and frontend (port 5173)

### Individual Commands

- Backend only: `npm run server`
- Frontend only: `npm run client`
- Production build: `npm run build`

## Project Structure

```
weave/
├── backend/
│   ├── config/         # Database and configuration
│   ├── models/         # MongoDB schemas
│   ├── routes/         # Express routes
│   ├── controllers/    # Business logic
│   ├── middleware/     # Auth, validation, error handling
│   ├── socket/         # Socket.io handlers
│   └── utils/          # Helpers and utilities
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── store/      # Zustand state management
│   │   ├── services/   # API and Socket services
│   │   ├── hooks/      # Custom React hooks
│   │   └── utils/      # Helper functions
│   └── public/         # Static assets and PWA files
└── package.json
```

## Security Features

- JWT access and refresh tokens
- Secure HTTP-only cookies
- Password hashing with bcrypt
- Message encryption with AES
- Rate limiting on API endpoints
- Helmet security headers
- XSS protection
- CORS configuration

## Contributing

This is a portfolio project. Feel free to fork and customize!

## Author

**Shobhit Pandey**
- Email: techslave19@gmail.com
- GitHub: shobhit2712

## License

MIT License

## Copyright

© 2024-2025 Shobhit Pandey. All rights reserved.
