#!/bin/bash

echo "🧪 Testing Angular Build..."

cd frontend

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building with production config..."
npm run build -- --configuration=production

echo "📁 Checking build output..."
if [ -d "dist" ]; then
    echo "✅ Build successful!"
    echo "📊 Build structure:"
    find dist -type d | head -10
    echo ""
    echo "📄 Files generated:"
    find dist -name "*.html" -o -name "*.js" -o -name "*.css" | head -10
    echo ""
    echo "📏 Build size:"
    du -sh dist/
else
    echo "❌ Build failed - no dist directory"
    exit 1
fi

cd ..