# Find People Near You - Real-time Location App

A real-time application that helps users find people nearby using GPS location and Bluetooth scanning.

## Features
- ✅ User authentication (login/register)
- ✅ Real-time location tracking with GPS
- ✅ Find users within 20-50 meters
- ✅ Bluetooth device discovery (mock implementation)
- ✅ Live updates every 5 seconds via Socket.IO
- ✅ Clean, responsive UI
- ✅ Mock user data for testing

## Tech Stack
- **Frontend**: Angular 20 (Standalone Components)
- **Backend**: Node.js (Express)
- **Database**: MongoDB
- **Real-time**: Socket.IO
- **Hosting**: AWS EC2/Elastic Beanstalk (Docker ready)

## Project Structure
```
├── frontend/          # Angular application
├── backend/           # Node.js Express server
├── deployment/        # Docker & AWS deployment configs
├── start-dev.sh       # Development startup script
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally
- Modern browser with location permissions

### Development Mode
```bash
# Make startup script executable
chmod +x start-dev.sh

# Start everything (seeds DB, starts backend & frontend)
./start-dev.sh
```

### Manual Setup
```bash
# 1. Start MongoDB
brew services start mongodb/brew/mongodb-community
# or
sudo systemctl start mongod

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Seed database with mock users
cd backend && node seed.js

# 4. Start backend
cd backend && npm run dev

# 5. Start frontend (in new terminal)
cd frontend && npm start
```

## Usage

1. **Access the app**: http://localhost:4200
2. **Login with test credentials**:
   - Username: `raheed_muz`
   - Password: `password123`
   - (Or any other user from seed data)

3. **Grant location permission** when prompted
4. **Click "Detect Nearby Users"** to find people within 50 meters
5. **Real-time updates** happen every 5 seconds automatically

## Test Users
The app comes with 7 pre-seeded users:
- raheed_muz / password123
- sarah_wilson / password123  
- mike_chen / password123
- emma_davis / password123
- alex_rodriguez / password123
- lisa_park / password123
- david_kim / password123

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/nearby` - Get nearby users

### Location
- `POST /api/location/update` - Update user location

### Socket.IO Events
- `user-online` - User comes online
- `location-update` - Real-time location update
- `nearby-users` - Receive nearby users list

## Deployment

### Docker (Recommended)
```bash
cd deployment
docker-compose up -d
```

### AWS Elastic Beanstalk
1. Create EB application
2. Deploy backend using provided Dockerfile
3. Configure environment variables
4. Set up MongoDB Atlas or EC2 MongoDB instance

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/findpeople
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
```

## Features Implemented

✅ **Core Requirements**
- Login/Register system
- User profiles with basic details
- GPS location tracking
- Real-time nearby user detection
- 20-50 meter radius detection
- Socket.IO real-time updates

✅ **Technical Requirements**
- Angular frontend
- Node.js/Express backend  
- MongoDB database
- Socket.IO real-time communication
- AWS deployment ready

✅ **UI/UX**
- Clean, responsive design
- Location permission handling
- Real-time status updates
- Distance-based color coding
- Bluetooth device scanning (mock)

## Browser Permissions
The app requires:
- **Location (GPS)**: For finding your position
- **Notifications** (optional): For nearby user alerts

## Troubleshooting

**Location not working?**
- Ensure HTTPS in production (required for geolocation)
- Check browser location permissions
- Try refreshing and re-granting permissions

**No nearby users?**
- Make sure other test users are "online" 
- Check if you're within 50 meters of mock coordinates
- Try the "Detect Nearby Users" button

**Socket.IO connection issues?**
- Verify backend is running on port 3000
- Check browser console for connection errors
- Ensure CORS is properly configured