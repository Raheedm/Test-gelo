#!/bin/bash

echo "🚀 Building Find People Near You for Production..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist
rm -rf frontend/dist

# Build frontend for production
echo "📦 Building Angular frontend for production..."
cd frontend
npm install
npm run build
cd ..

# Prepare backend
echo "📦 Preparing backend..."
cd backend
npm install --production
cd ..

# Create deployment package
echo "📦 Creating deployment package..."
mkdir -p dist
mkdir -p dist/public

# Copy backend files
cp -r backend/* dist/
rm -rf dist/node_modules
cp -r backend/node_modules dist/

# Copy frontend build
if [ -d "frontend/dist/frontend" ]; then
    cp -r frontend/dist/frontend/* dist/public/
else
    echo "⚠️  Frontend build not found, copying from browser folder..."
    cp -r frontend/dist/browser/* dist/public/
fi

# Create production start script
cat > dist/start-production.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Find People Near You in Production Mode..."
export NODE_ENV=production
node server.js
EOF

chmod +x dist/start-production.sh

echo "✅ Production build complete!"
echo "📁 Deployment files are in ./dist/"
echo "🌐 Ready for AWS deployment!"
echo ""
echo "To test locally:"
echo "cd dist && NODE_ENV=production node server.js"