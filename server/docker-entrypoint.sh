#!/bin/sh

echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "🌱 Seeding database..."
# Run the compiled seed file if it exists
if [ -f "dist/prisma/seed.js" ]; then
  node dist/prisma/seed.js || echo "⚠️  Seeding failed"
else
  echo "⚠️  Seed file not found, skipping seeding"
fi

echo "🚀 Starting NestJS application..."
node dist/main
