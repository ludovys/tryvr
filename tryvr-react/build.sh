#!/bin/bash

# Build the React application
echo "Building React application..."
npm run build

# Install kv-asset-handler if not already installed
if ! npm list @cloudflare/kv-asset-handler > /dev/null 2>&1; then
  echo "Installing @cloudflare/kv-asset-handler..."
  npm install @cloudflare/kv-asset-handler
fi

# Create the workers-site directory if it doesn't exist
mkdir -p .cloudflare/workers-site

# Copy the worker script to the correct location
echo "Setting up Worker script..."

# Make the script executable
chmod +x build.sh

echo "Build completed successfully!" 