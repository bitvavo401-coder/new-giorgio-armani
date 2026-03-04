#!/bin/bash

# Multi-Location Setup Quick Start Script
# Run: chmod +x setup.sh && ./setup.sh

echo "🚀 Giorgio Armani App - Multi-Location Setup"
echo "=============================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not installed. Please install Node.js 18+"
  exit 1
fi

echo "✅ Node.js: $(node --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
  echo "❌ npm install failed"
  exit 1
fi

# Check for .env file
echo ""
echo "🔐 Checking environment variables..."
if [ ! -f .env ]; then
  echo "⚠️  .env file not found"
  echo "Creating .env from .env.example..."
  cp .env.example .env
  echo "✅ .env created. Please fill in the values:"
  echo ""
  cat .env | grep "=" | head -5
  echo "..."
  echo ""
  echo "📝 Edit .env with your credentials"
else
  echo "✅ .env file exists"
fi

# Build check
echo ""
echo "🔨 Building application..."
npm run check
if [ $? -ne 0 ]; then
  echo "⚠️  TypeScript errors found. Fix before deploying."
else
  echo "✅ TypeScript check passed"
fi

echo ""
echo "=============================================="
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Fill in .env with your credentials:"
echo "   - DATABASE_URL (from Supabase)"
echo "   - AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY (from R2/S3)"
echo ""
echo "2. Test locally:"
echo "   npm run dev"
echo ""
echo "3. Push to GitHub:"
echo "   git add ."
echo "   git commit -m 'Add multi-location setup'"
echo "   git push origin main"
echo ""
echo "4. GitHub Actions will automatically:"
echo "   - Build the app"
echo "   - Upload to S3/R2"
echo "   - Deploy to Render"
echo ""
echo "5. Monitor deployment:"
echo "   - GitHub: https://github.com/[repo]/actions"
echo "   - Render: https://dashboard.render.com"
echo ""
