#!/bin/bash
# Build and Deploy Script for Hostinger
# Run this script to prepare your app for deployment

echo "🚀 Building React app for Hostinger deployment..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the production bundle
echo "🔨 Building production bundle..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "📁 Build files are in the 'build/' folder"
    echo ""
    echo "📤 Next steps:"
    echo "   1. Upload ALL contents of 'build/' folder to Hostinger"
    echo "   2. Upload to: public_html/ on your Hostinger server"
    echo "   3. Visit: https://payment.itechvertical.in"
    echo ""
    echo "📋 Files to upload:"
    echo "   - index.html"
    echo "   - .htaccess"
    echo "   - static/ (entire folder)"
    echo ""
else
    echo ""
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi
