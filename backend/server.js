const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const locationRoutes = require('./routes/location');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://13.48.10.255", "http://13.48.10.255:80", "http://localhost:4200"],
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: ["http://13.48.10.255", "http://13.48.10.255:80", "http://localhost:4200", "http://127.0.0.1:4200"],
  credentials: true
}));
app.use(express.json());

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://minerbitcoin003:AD2OScP3FIZQLSCH@cluster0.la4l4mq.mongodb.net/findpeople?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/location', locationRoutes);

// Root route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Find People Near You API Server',
    status: 'running',
    endpoints: {
      auth: '/api/auth/login, /api/auth/register',
      users: '/api/users/profile, /api/users/nearby',
      location: '/api/location/update'
    }
  });
});

// Test endpoint to check users
app.get('/api/test/users', async (req, res) => {
  try {
    const User = require('./models/User');
    const users = await User.find({}, 'username name').limit(5);
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.IO for real-time updates
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('user-online', (userData) => {
    activeUsers.set(socket.id, {
      ...userData,
      socketId: socket.id,
      lastSeen: new Date()
    });
    console.log(`User ${userData.username} is online`);
  });

  socket.on('location-update', (locationData) => {
    const user = activeUsers.get(socket.id);
    if (user) {
      user.latitude = locationData.latitude;
      user.longitude = locationData.longitude;
      user.lastSeen = new Date();
      
      // Broadcast to nearby users
      broadcastToNearbyUsers(user, locationData);
    }
  });

  socket.on('disconnect', () => {
    activeUsers.delete(socket.id);
    console.log('User disconnected:', socket.id);
  });
});

function broadcastToNearbyUsers(currentUser, locationData) {
  console.log(`Broadcasting nearby users for ${currentUser.username}`);
  
  // Send nearby users to ALL active users, not just the one who moved
  activeUsers.forEach((targetUser, targetSocketId) => {
    const nearbyUsers = [];
    
    // Find users near this target user
    activeUsers.forEach((otherUser, otherSocketId) => {
      if (targetSocketId !== otherSocketId && otherUser.latitude && otherUser.longitude) {
        const distance = calculateDistance(
          targetUser.latitude,
          targetUser.longitude,
          otherUser.latitude,
          otherUser.longitude
        );
        
        if (distance <= 50) { // 50 meters radius
          nearbyUsers.push({
            username: otherUser.username,
            name: otherUser.name,
            distance: Math.round(distance),
            userId: otherUser.userId
          });
        }
      }
    });
    
    console.log(`Sending ${nearbyUsers.length} nearby users to ${targetUser.username}`);
    io.to(targetSocketId).emit('nearby-users', nearbyUsers);
  });
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});