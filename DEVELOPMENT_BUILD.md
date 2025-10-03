# Development Build Setup

## Issue Resolution

The errors you encountered are due to Expo Go limitations:

1. **Push Notifications Error**: Expo Go removed push notification support in SDK 53+
2. **Supabase CONVERSATIONS Error**: Missing TABLES export in supabaseConfig.ts

## ✅ Fixed Issues

### 1. Supabase Configuration
- Added `TABLES` constant to `src/config/supabaseConfig.ts` and `src/config/supabase.ts`
- This resolves the "Cannot read property 'CONVERSATIONS' of undefined" error

### 2. Development Build Configuration
- Updated `app.config.js` with development build plugins
- Installed `expo-dev-client` and `expo-camera`
- Configured EAS build profiles for development builds

## 🚀 Building a Development Client

### Option 1: Use the Helper Script
```bash
node build-dev-client.js
```

### Option 2: Manual Build
```bash
# Install EAS CLI (if not already installed)
npm install -g @expo/eas-cli

# Login to EAS
eas login

# Build development client
eas build --profile development --platform android
```

### Option 3: Local Development Build
```bash
# For local development (requires Android Studio)
npx expo run:android
```

## 📱 Using the Development Build

1. **Download the APK** from the EAS build page
2. **Install on your device** (enable "Install from unknown sources")
3. **Start the development server**:
   ```bash
   npx expo start --dev-client
   ```
4. **Scan the QR code** with your development build app (not Expo Go)

## 🎯 Benefits of Development Build

- ✅ Full push notification support
- ✅ All native features work
- ✅ No Expo Go limitations
- ✅ Custom native code support
- ✅ Production-like environment

## 🔧 Configuration Files Updated

- `app.config.js` - Added development build plugins
- `src/config/supabaseConfig.ts` - Added TABLES export
- `src/config/supabase.ts` - Added TABLES export
- `eas.json` - Already configured for development builds

## 📋 Next Steps

1. Build your development client using one of the methods above
2. Install it on your device
3. Run `npx expo start --dev-client`
4. Test push notifications and other native features

## 🆘 Troubleshooting

### Build Fails
- Check EAS project ID in `app.config.js`
- Ensure you have EAS build credits
- Verify all dependencies are installed

### App Won't Start
- Make sure you're using `--dev-client` flag
- Check that the development build is properly installed
- Verify environment variables are set

### Push Notifications Still Not Working
- Check notification permissions in device settings
- Verify notification configuration in `app.config.js`
- Test with a simple notification first
