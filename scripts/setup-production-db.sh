#!/bin/bash

# Production database setup script for Neon PostgreSQL

echo "🗄️  Setting up production database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable not set"
    echo "Please add your Neon PostgreSQL connection string to DATABASE_URL"
    echo "Example: DATABASE_URL='postgresql://username:password@host.neon.tech/database?sslmode=require'"
    exit 1
fi

echo "✅ DATABASE_URL found"

# Switch to production schema
echo "📝 Switching to production Prisma schema..."
if [ -f "prisma/schema.prod.prisma" ]; then
    # Backup current schema
    cp prisma/schema.prisma prisma/schema.backup.prisma
    
    # Use production schema
    cp prisma/schema.prod.prisma prisma/schema.prisma
    echo "✅ Production schema activated"
else
    echo "❌ Error: Production schema file not found"
    exit 1
fi

# Generate Prisma client
echo "🔧 Generating Prisma client for production..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to generate Prisma client"
    exit 1
fi

# Run migrations
echo "🚀 Running database migrations..."
npx prisma migrate deploy
if [ $? -ne 0 ]; then
    echo "❌ Error: Database migration failed"
    echo "Make sure your DATABASE_URL is correct and the database is accessible"
    exit 1
fi

# Seed database with categories
echo "🌱 Seeding database with default categories..."
npm run db:seed
if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Database seeding failed, but migration succeeded"
    echo "You can seed manually later with: npm run db:seed"
fi

# Restore development schema
echo "🔄 Restoring development schema..."
if [ -f "prisma/schema.backup.prisma" ]; then
    cp prisma/schema.backup.prisma prisma/schema.prisma
    npx prisma generate
    echo "✅ Development schema restored"
fi

echo ""
echo "🎉 Production database setup completed!"
echo ""
echo "Next steps:"
echo "1. Your Neon database is ready with all tables and seed data"
echo "2. Deploy your app to Vercel if not already done"
echo "3. Set the same DATABASE_URL in Vercel environment variables"
echo "4. Test your production application!"
echo ""
