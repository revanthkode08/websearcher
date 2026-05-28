#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "Installing node dependencies..."
npm install

echo "Installing Chrome for Puppeteer..."
# Fix permissions just in case
chmod +x node_modules/.bin/puppeteer || true

# Install Chrome using puppeteer CLI (will use .puppeteerrc.cjs cache dir)
npx puppeteer browsers install chrome

echo "Build complete."
