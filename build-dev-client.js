#!/usr/bin/env node

/**
 * Development Build Helper Script
 * 
 * This script helps you build a development client to resolve Expo Go limitations
 * with push notifications and other native features.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 QueueUp Development Build Helper');
console.log('=====================================\n');

// Check if EAS CLI is installed
try {
  execSync('eas --version', { stdio: 'ignore' });
  console.log('✅ EAS CLI is installed');
} catch (error) {
  console.log('❌ EAS CLI is not installed. Installing...');
  try {
    execSync('npm install -g @expo/eas-cli', { stdio: 'inherit' });
    console.log('✅ EAS CLI installed successfully');
  } catch (installError) {
    console.error('❌ Failed to install EAS CLI. Please install manually:');
    console.error('npm install -g @expo/eas-cli');
    process.exit(1);
  }
}

// Check if user is logged in to EAS
try {
  execSync('eas whoami', { stdio: 'ignore' });
  console.log('✅ Logged in to EAS');
} catch (error) {
  console.log('❌ Not logged in to EAS. Please log in:');
  console.log('eas login');
  process.exit(1);
}

console.log('\n📱 Building Development Client...');
console.log('This will create a custom development build that supports:');
console.log('- Push notifications');
console.log('- All native features');
console.log('- No Expo Go limitations\n');

try {
  // Build development client
  execSync('eas build --profile development --platform android', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('\n✅ Development build completed successfully!');
  console.log('\n📋 Next Steps:');
  console.log('1. Download the APK from the EAS build page');
  console.log('2. Install it on your Android device');
  console.log('3. Run: npx expo start --dev-client');
  console.log('4. Scan the QR code with your development build app');
  console.log('\n🎉 You can now use push notifications and all native features!');
  
} catch (error) {
  console.error('\n❌ Build failed. Please check the error above.');
  console.error('\n💡 Troubleshooting:');
  console.error('- Make sure you have a valid EAS project ID in app.config.js');
  console.error('- Check that all dependencies are properly installed');
  console.error('- Verify your EAS account has build credits');
  process.exit(1);
}
