#!/bin/bash

# Deployment script for Hjemmeinventar to Vercel with Neon PostgreSQL

echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from project root directory"
    exit 1
fi

# 1. Switch to production Prisma schema
echo "📝 Switching to production Prisma schema..."
if [ -f "prisma/schema.prod.prisma" ]; then
    cp prisma/schema.prisma prisma/schema.dev.prisma
    cp prisma/schema.prod.prisma prisma/schema.prisma
    echo "✅ Production schema activated"
else
    echo "❌ Error: Production schema file not found"
    exit 1
fi

# 2. Generate Prisma client for production
echo "🔧 Generating Prisma client for production..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to generate Prisma client"
    exit 1
fi

# 3. Build the application
echo "🏗️  Building application..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Error: Build failed"
    exit 1
fi

# 4. Deploy to Vercel (requires Vercel CLI)
echo "🌐 Deploying to Vercel..."
if command -v vercel &> /dev/null; then
    vercel --prod
    if [ $? -eq 0 ]; then
        echo "🎉 Deployment successful!"
        echo "📋 Remember to:"
        echo "   1. Set up environment variables in Vercel dashboard"
        echo "   2. Run database migrations in production"
        echo "   3. Test the deployed application"
    else
        echo "❌ Error: Vercel deployment failed"
        exit 1
    fi
else
    echo "⚠️  Vercel CLI not found. Installing..."
    npm i -g vercel
    echo "Please run 'vercel login' first, then run this script again"
fi

# 5. Restore development schema
echo "🔄 Restoring development schema..."
if [ -f "prisma/schema.dev.prisma" ]; then
    cp prisma/schema.dev.prisma prisma/schema.prisma
    npx prisma generate
    echo "✅ Development schema restored"
fi

echo "✨ Deployment process completed!"
