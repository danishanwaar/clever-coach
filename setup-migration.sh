#!/bin/bash

# Clever Coach Migration Setup Script
# This script helps set up the migration environment

echo "🚀 Setting up Clever Coach Migration..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v16 or higher) first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing migration dependencies..."
npm install mysql2 dotenv
echo "✅ Migration dependencies installed"

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    if [ -f "env.migration.example" ]; then
        cp env.migration.example .env
        echo "📝 Created .env file from template"
        echo "⚠️  Please edit .env file with your database credentials"
    else
        echo "❌ env.migration.example not found"
        exit 1
fi
else
    echo "✅ .env file already exists"
fi

# Check if required files exist
REQUIRED_FILES=("migrate-data.js" "MIGRATION_README.md" "package.json")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Required file $file not found"
        exit 1
    fi
done

echo "✅ All required files found"

# Test database connections (optional)
echo ""
echo "🔍 Testing database connections..."
echo "📡 Testing MySQL connection..."
node -e "
const mysql = require('mysql2/promise');
const config = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'adminclever_clever'
};
mysql.createConnection(config).then(conn => {
  console.log('✅ MySQL connection successful');
  conn.end();
}).catch(err => {
  console.log('❌ MySQL connection failed:', err.message);
  process.exit(1);
});
" 2>/dev/null || echo "⚠️  MySQL connection test skipped (check .env file)"

echo "📡 Testing Supabase connection..."
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
supabase.from('tbl_roles').select('count').limit(1).then(() => {
  console.log('✅ Supabase connection successful');
}).catch(err => {
  console.log('❌ Supabase connection failed:', err.message);
  process.exit(1);
});
" 2>/dev/null || echo "⚠️  Supabase connection test skipped (check .env file)"

echo ""
echo "🎉 Migration setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your database credentials"
echo "2. Run dry run: DRY_RUN=true npm run migrate"
echo "3. Run full migration: npm run migrate"
echo ""
echo "📖 For detailed instructions, see MIGRATION_README.md"
