#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "Installing node dependencies..."
npm install

echo "Setting up Puppeteer Cache Directory..."
# Ensure Puppeteer cache directory exists
PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
mkdir -p $PUPPETEER_CACHE_DIR

echo "Installing Chrome for Puppeteer..."
# Install Chrome using puppeteer CLI
npx puppeteer browsers install chrome

echo "Copying cache for future builds..."
# Store/pull cache (optional but recommended for faster builds)
if [[ ! -d $PUPPETEER_CACHE_DIR ]]; then
  cp -R /opt/render/project/src/.cache/puppeteer/chrome/ $PUPPETEER_CACHE_DIR || true
else
  cp -R $PUPPETEER_CACHE_DIR /opt/render/project/src/.cache/puppeteer/chrome/ || true
fi

echo "Build complete."
