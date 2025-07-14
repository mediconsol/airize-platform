#!/bin/bash

# Firebase 환경 변수 설정 스크립트

echo "Setting up Firebase environment variables for Vercel..."

# Firebase 환경 변수들
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN --value="airize-platform.firebaseapp.com" --environment="production,preview,development" --yes
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID --value="airize-platform" --environment="production,preview,development" --yes
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET --value="airize-platform.firebasestorage.app" --environment="production,preview,development" --yes
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --value="171450341710" --environment="production,preview,development" --yes
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID --value="1:171450341710:web:02b763acaf42fa6d11661f" --environment="production,preview,development" --yes
vercel env add NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID --value="G-PNY8M7NM9P" --environment="production,preview,development" --yes

echo "Environment variables setup complete!"
