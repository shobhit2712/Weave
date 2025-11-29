# MongoDB Setup Guide for Windows

## Option 1: MongoDB Community Server (Recommended for Windows)

### Step 1: Download MongoDB
1. Go to https://www.mongodb.com/try/download/community
2. Select:
   - Version: 7.0.x (current)
   - Platform: Windows
   - Package: MSI
3. Download and run the installer

### Step 2: Install MongoDB
1. Run the MSI installer
2. Choose "Complete" installation
3. **Important:** Check "Install MongoDB as a Service"
4. Leave default settings (Port 27017)
5. **Optional:** Install MongoDB Compass (GUI tool)
6. Complete the installation

### Step 3: Verify Installation
```powershell
# Check if MongoDB service is running
Get-Service MongoDB

# Should show:
# Status   Name               DisplayName
# ------   ----               -----------
# Running  MongoDB            MongoDB
```

### Step 4: Test Connection
```powershell
# Open MongoDB Shell (if installed)
mongosh

# Or test with your app - MongoDB will be at:
# mongodb://localhost:27017
```

### Default Connection String
```
MONGO_URI=mongodb://localhost:27017/weave
```

---

## Option 2: MongoDB Atlas (Cloud - Free Tier)

### Benefits
- ✅ No local installation needed
- ✅ Free 512MB storage
- ✅ Always accessible
- ✅ Automatic backups
- ✅ Production-ready

### Setup Steps

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up for free

2. **Create Cluster**
   - Choose "Create a FREE cluster"
   - Select region closest to you
   - Cluster name: `Weave` (or any name)
   - Click "Create Cluster" (takes 3-5 minutes)

3. **Create Database User**
   - Go to "Database Access" → "Add New Database User"
   - Authentication: Password
   - Username: `weaveuser`
   - Password: Generate or create strong password
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Whitelist IP Address**
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Or add your specific IP
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Databases" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Driver: Node.js, Version: 5.5 or later
   - Copy connection string, looks like:
   ```
   mongodb+srv://weaveuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

6. **Update .env File**
   ```env
   MONGO_URI=mongodb+srv://weaveuser:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/weave?retryWrites=true&w=majority
   ```
   Replace `<password>` with your actual password and `YOUR_PASSWORD` in the example.

---

## Option 3: Docker Desktop (If You Want to Use It)

### Step 1: Install Docker Desktop
1. Download from https://www.docker.com/products/docker-desktop
2. Install Docker Desktop for Windows
3. **Restart your computer** (required)
4. Start Docker Desktop from Start Menu
5. Wait for Docker to fully start (whale icon in system tray)

### Step 2: Run MongoDB Container
```powershell
# Once Docker Desktop is running:
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Verify it's running:
docker ps
```

### Connection String
```
MONGO_URI=mongodb://localhost:27017/weave
```

---

## Quick Decision Guide

| Option | Best For | Setup Time | Pros |
|--------|----------|------------|------|
| **Community Server** | Local development | 10 min | No internet needed, full control |
| **Atlas Cloud** | Quick start, production | 5 min | No installation, free, scalable |
| **Docker** | DevOps, consistency | 15 min | Isolated, easy cleanup |

---

## Recommended: MongoDB Community Server

For Windows development, **MongoDB Community Server** is the easiest:

1. Download installer: https://www.mongodb.com/try/download/community
2. Run MSI → Complete installation → Install as Service
3. Done! MongoDB runs automatically at `mongodb://localhost:27017`

---

## Troubleshooting

### MongoDB Service Not Starting (Community Server)
```powershell
# Start service manually
net start MongoDB

# Or restart it
net stop MongoDB
net start MongoDB
```

### Check if Port 27017 is Available
```powershell
netstat -ano | findstr :27017
```

### MongoDB Compass (GUI Tool)
- Download separately: https://www.mongodb.com/products/compass
- Connect to: `mongodb://localhost:27017`
- View your databases visually

---

## Next Steps After MongoDB Setup

1. **Update backend/.env**
   ```env
   MONGO_URI=mongodb://localhost:27017/weave
   # Or your Atlas connection string
   ```

2. **Install dependencies**
   ```powershell
   npm run install-all
   ```

3. **Start the application**
   ```powershell
   npm run dev
   ```

4. **MongoDB will automatically create the `weave` database** when you register your first user!

---

## Verification

Once MongoDB is running, test the connection:

```powershell
# In backend directory
cd backend
npm install
npm run dev

# You should see:
# "MongoDB connected successfully"
```

---

**My Recommendation:** Use **MongoDB Community Server** for local development. It's simple, fast, and doesn't require Docker or internet connectivity.
