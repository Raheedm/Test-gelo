#!/bin/bash

echo "🚀 Starting Find People Near You - Development Mode"

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   brew services start mongodb/brew/mongodb-community"
    echo "   or"
    echo "   sudo systemctl start mongod"
    exit 1
fi

# Seed the database
echo "📊 Seeding database with mock users..."
cd backend && node seed.js
cd ..

# Start backend in background
echo "🔧 Starting backend server..."
cd backend && npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend application..."
cd frontend && npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Application started successfully!"
echo "📱 Frontend: http://localhost:4200"
echo "🔧 Backend: http://localhost:3000"
echo ""
echo "👤 Test credentials:"
echo "   Username: raheed_muz"
echo "   Password: password123"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait