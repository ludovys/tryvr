#!/bin/bash

# Build the React application
echo "Building React application..."
npm run build

# Install Wrangler if not already installed
if ! command -v wrangler &> /dev/null; then
  echo "Installing Wrangler..."
  npm install -g wrangler
fi

# Deploy to Cloudflare Pages
echo "Deploying to Cloudflare Pages..."
wrangler pages deploy dist --project-name=tryvr

echo "Deployment completed successfully!" 