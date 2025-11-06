#!/bin/bash

# Mobile build script that temporarily moves API routes out of the way

echo "📱 Starting mobile build..."

# Create backup directory
mkdir -p .build-temp

# Move API routes temporarily
if [ -d "app/api" ]; then
  echo "📦 Temporarily moving API routes..."
  mv app/api .build-temp/api
fi

# Move auth callback route (server-side only)
if [ -d "app/auth" ]; then
  echo "📦 Temporarily moving auth routes..."
  mv app/auth .build-temp/auth
fi

# Move root middleware temporarily (it references server-side code)
if [ -f "middleware.ts" ]; then
  echo "📦 Temporarily moving middleware..."
  mv middleware.ts .build-temp/middleware-root.ts
fi

# Move lib middleware temporarily (it references server-side code)
if [ -f "lib/supabase/middleware.ts" ]; then
  mv lib/supabase/middleware.ts .build-temp/middleware-lib.ts 2>/dev/null || true
fi

# Create temporary .env.local for build (with placeholder values)
echo "🔧 Setting up build environment..."
cat > .env.local.build << EOF
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-key
SUPABASE_SERVICE_ROLE_KEY=placeholder-key
ANTHROPIC_API_KEY=placeholder-key
FAL_KEY=placeholder-key
LEMONSQUEEZY_API_KEY=placeholder-key
LEMONSQUEEZY_STORE_ID=placeholder
LEMONSQUEEZY_WEBHOOK_SECRET=placeholder
EOF

# Backup existing .env.local if it exists
if [ -f ".env.local" ]; then
  mv .env.local .build-temp/env.local.backup
fi

# Use build env
cp .env.local.build .env.local

# Run the build
echo "🔨 Building for mobile..."
BUILD_MODE=mobile next build

# Store build exit code
BUILD_EXIT_CODE=$?

# Restore API routes
if [ -d ".build-temp/api" ]; then
  echo "📦 Restoring API routes..."
  mv .build-temp/api app/api
fi

# Restore auth routes
if [ -d ".build-temp/auth" ]; then
  echo "📦 Restoring auth routes..."
  mv .build-temp/auth app/auth
fi

# Restore root middleware
if [ -f ".build-temp/middleware-root.ts" ]; then
  echo "📦 Restoring middleware..."
  mv .build-temp/middleware-root.ts middleware.ts
fi

# Restore lib middleware
if [ -f ".build-temp/middleware-lib.ts" ]; then
  mv .build-temp/middleware-lib.ts lib/supabase/middleware.ts
fi

# Restore original .env.local
rm -f .env.local .env.local.build
if [ -f ".build-temp/env.local.backup" ]; then
  echo "🔧 Restoring environment..."
  mv .build-temp/env.local.backup .env.local
fi

# Cleanup
rmdir .build-temp 2>/dev/null || true

if [ $BUILD_EXIT_CODE -eq 0 ]; then
  echo "✅ Mobile build completed successfully!"
else
  echo "❌ Mobile build failed"
  exit $BUILD_EXIT_CODE
fi
