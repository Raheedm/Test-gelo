#!/bin/bash

echo "🚀 Building Find People Near You for Production..."

echo "🧹 Cleaning previous builds..."
rm -rf dist
rm -rf frontend/dist


echo "📦 Building Angular frontend for production..."
cd frontend
npm install
npm run build -- --configuration=production
echo "📁 Build completed. Checking output structure..."
ls -la dist/ 2>/dev/null || echo "No dist directory found"
find dist -name "*.html" -o -name "*.js" -o -name "*.css" 2>/dev/null | head -5
cd ..

echo "📦 Preparing backend..."
cd backend
npm install --production
cd ..

echo "📦 Creating deployment package..."
mkdir -p dist
mkdir -p dist/public


cp -r backend/* dist/
rm -rf dist/node_modules
cp -r backend/node_modules dist/

if [ -d "frontend/dist/frontend/browser" ]; then
    echo "📁 Copying from dist/frontend/browser..."
    cp -r frontend/dist/frontend/browser/* dist/public/
elif [ -d "frontend/dist/frontend" ]; then
    echo "📁 Copying from dist/frontend..."
    cp -r frontend/dist/frontend/* dist/public/
elif [ -d "frontend/dist/browser" ]; then
    echo "📁 Copying from dist/browser..."
    cp -r frontend/dist/browser/* dist/public/
else
    echo "❌ Frontend build not found! Please check the build output."
    echo "Available directories:"
    ls -la frontend/dist/ 2>/dev/null || echo "No dist directory found"
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

echo "✅ Production build complete!"
echo "📁 Deployment files are in ./dist/"
echo "🌐 Ready for AWS deployment!"
echo ""
echo "To test locally:"
echo "cd dist && NODE_ENV=production node server.js"