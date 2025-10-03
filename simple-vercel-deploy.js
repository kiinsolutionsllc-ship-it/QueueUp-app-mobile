// Simple Vercel deployment script
// This will create a minimal deployment for the callback page

import fs from 'fs';
import path from 'path';

// Create a minimal package.json for Vercel
const packageJson = {
  "name": "queueup-callback",
  "version": "1.0.0",
  "scripts": {
    "build": "echo 'No build needed'",
    "start": "echo 'Static files served'"
  }
};

// Create a minimal vercel.json
const vercelConfig = {
  "version": 2,
  "builds": [
    {
      "src": "public/**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/auth/callback",
      "dest": "/auth/callback.html"
    },
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ]
};

try {
  console.log('🔧 Creating minimal Vercel configuration...');
  
  // Write package.json
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  
  // Update vercel.json
  fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
  
  console.log('✅ Configuration files created');
  console.log('📦 Ready for deployment');
  console.log('');
  console.log('Next steps:');
  console.log('1. Run: npx vercel --prod --yes');
  console.log('2. Or try: npx vercel deploy --prod');
  
} catch (error) {
  console.error('❌ Error creating configuration:', error.message);
}





