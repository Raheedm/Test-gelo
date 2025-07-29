#!/bin/bash

echo "Setting up mobile view dependencies..."

# Navigate to frontend directory
cd frontend

# Install new dependencies
npm install leaflet @types/leaflet

echo "Dependencies installed!"
echo ""
echo "To run the app:"
echo "1. cd frontend && npm start"
echo "2. Open http://localhost:4200"
echo ""
echo "Mobile features added:"
echo "✅ Map-based interface with Leaflet"
echo "✅ Mobile-first responsive design"
echo "✅ User profile cards overlaid on map"
echo "✅ Event markers and cards"
echo "✅ Bottom navigation bar"
echo "✅ Search functionality"
echo "✅ Location permission handling"
echo "✅ Floating action button for refresh"
echo "✅ User profile modal"
echo ""
echo "The app now looks like a modern mobile social discovery app!"