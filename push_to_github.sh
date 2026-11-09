#!/usr/bin/env bash

# IntelliDesk AI - Helper script to push AI_GIt to GitHub
set -e

echo "=========================================================="
echo "  IntelliDesk AI - GitHub Repository Push Helper"
echo "=========================================================="
echo ""

# Ensure we are in the directory of this script
cd "$(dirname "$0")"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Error: git is not installed or not in PATH."
    exit 1
fi

echo "Current directory: $(pwd)"
echo ""

# Check existing git remote
EXISTING_REMOTE=$(git remote get-url origin 2>/dev/null || true)

if [ -n "$EXISTING_REMOTE" ]; then
    echo "Current remote origin: $EXISTING_REMOTE"
    read -p "Do you want to use this remote? (y/n): " USE_EXISTING
    if [[ "$USE_EXISTING" =~ ^[Yy]$ ]]; then
        REPO_URL="$EXISTING_REMOTE"
    fi
fi

if [ -z "$REPO_URL" ]; then
    echo "Please enter your GitHub Repository URL."
    echo "Example: https://github.com/your-username/intellidesk-ai.git"
    read -p "Repository URL: " REPO_URL
fi

if [ -z "$REPO_URL" ]; then
    echo "❌ No URL provided. Aborting."
    exit 1
fi

echo ""
echo "Configuring remote origin..."
if git remote | grep -q "origin"; then
    git remote set-url origin "$REPO_URL"
else
    git remote add origin "$REPO_URL"
fi

echo "Ensuring main branch is selected..."
git branch -M main

echo "Pushing code to $REPO_URL on branch main..."
git push -u origin main

echo ""
echo "=========================================================="
echo "  ✅ Successfully pushed to GitHub!"
echo "=========================================================="
echo "Next step: Deploy online to Vercel via https://vercel.com"
echo "Refer to DEPLOYMENT.md for complete Vercel setup."
echo "=========================================================="
