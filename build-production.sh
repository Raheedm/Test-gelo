#!/bin/bash

echo "🚀 Building Find People Near You for Production (Optimized)..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist
rm -rf frontend/dist

# Build frontend with production optimizations
echo "📦 Building Angular frontend with optimizations..."
cd frontend

# Install dependencies
npm install

# Build with production configuration and additional optimizations
npm run build -- --configuration=production --optimization=true --build-optimizer=true --aot=true --extract-licenses=true

echo "📁 Checking build output..."
if [ -d "dist" ]; then
    echo "✅ Build successful! Contents:"
    find dist -type f -name "*.js" -o -name "*.css" -o -name "*.html" | head -10
else
    echo "❌ Build failed - no dist directory found"
    exit 1
fi

cd ..

# Prepare backend
echo "📦 Preparing backend..."
cd backend
npm install --omit=dev
cd ..

# Create deployment package
echo "📦 Creating deployment package..."
mkdir -p dist
mkdir -p dist/public

# Copy backend files
echo "📁 Copying backend files..."
cp -r backend/* dist/
rm -rf dist/node_modules
cp -r backend/node_modules dist/

# Copy frontend build with better detection
echo "📁 Copying frontend build..."
FRONTEND_BUILD_DIR=""

if [ -d "frontend/dist/frontend/browser" ]; then
    FRONTEND_BUILD_DIR="frontend/dist/frontend/browser"
elif [ -d "frontend/dist/frontend" ]; then
    FRONTEND_BUILD_DIR="frontend/dist/frontend"
elif [ -d "frontend/dist/browser" ]; then
    FRONTEND_BUILD_DIR="frontend/dist/browser"
fi

if [ -n "$FRONTEND_BUILD_DIR" ] && [ -d "$FRONTEND_BUILD_DIR" ]; then
    echo "✅ Found frontend build in: $FRONTEND_BUILD_DIR"
    cp -r "$FRONTEND_BUILD_DIR"/* dist/public/
    echo "📊 Frontend files copied:"
    ls -la dist/public/ | head -5
else
    echo "❌ Frontend build not found!"
    echo "Available directories in frontend/dist/:"
    ls -la frontend/dist/ 2>/dev/null || echo "No dist directory"
    exit 1
fi

# Create production start script
cat > dist/start-production.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Find People Near You in Production Mode..."
export NODE_ENV=production
node server.js
EOF

chmod +x dist/start-production.sh

# Create package info
echo "📋 Creating deployment info..."
cat > dist/DEPLOYMENT-INFO.txt << EOF
Find People Near You - Production Build
Generated: $(date)
Node.js Version: $(node --version)
NPM Version: $(npm --version)

Files included:
- Backend API server
- Frontend static files
- MongoDB Atlas connection
- Socket.IO real-time features

To start:
1. cd dist
2. NODE_ENV=production node server.js

Or use: ./start-production.sh
EOF

echo "✅ Production build complete!"
echo "📁 Deployment files are in ./dist/"
echo "📊 Build size:"
du -sh dist/
echo ""
echo "🧪 To test locally:"
echo "cd dist && NODE_ENV=production node server.js"