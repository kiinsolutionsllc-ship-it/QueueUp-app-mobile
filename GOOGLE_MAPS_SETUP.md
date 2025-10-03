# Google Maps/Places API Setup Guide

This guide will help you set up Google Maps and Places API integration for the QueueUp app.

## 🗺️ **Why Google Maps/Places API?**

**Better than Supabase for location services because:**
- ✅ **Rich Location Data:** Addresses, coordinates, place details, photos
- ✅ **Search & Autocomplete:** Built-in place search and suggestions  
- ✅ **Geocoding/Reverse Geocoding:** Convert between addresses and coordinates
- ✅ **Place Details:** Business hours, ratings, reviews, contact info
- ✅ **Offline Capabilities:** Cached location data
- ✅ **Global Coverage:** Worldwide location database

## 🚀 **Setup Steps**

### **1. Create Google Cloud Project**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable billing (required for Maps API)

### **2. Enable Required APIs**

Enable these APIs in your Google Cloud project:

```bash
# Required APIs
- Maps JavaScript API
- Places API
- Geocoding API
- Maps SDK for Android
- Maps SDK for iOS
```

**Enable via Console:**
1. Go to "APIs & Services" > "Library"
2. Search and enable each API listed above

### **3. Create API Keys**

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Create separate keys for different platforms:

**Android API Key:**
- Restrict to Android apps
- Add your app's package name and SHA-1 fingerprint

**iOS API Key:**
- Restrict to iOS apps  
- Add your app's bundle identifier

**Web API Key:**
- Restrict to HTTP referrers
- Add your domain (for web version)

### **4. Configure Environment Variables**

Add to your `.env` file:

```env
# Google Maps Configuration
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_android_api_key_here
EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY=your_ios_api_key_here
EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY=your_web_api_key_here
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_places_api_key_here
```

### **5. Install Required Packages**

```bash
# React Native Maps
npm install react-native-maps

# For Expo managed workflow
expo install react-native-maps

# Google Places Autocomplete (optional)
npm install react-native-google-places-autocomplete
```

### **6. Configure App Files**

**For Android (`android/app/src/main/AndroidManifest.xml`):**
```xml
<application>
  <meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_ANDROID_API_KEY"/>
</application>
```

**For iOS (`ios/YourApp/AppDelegate.m`):**
```objc
#import <GoogleMaps/GoogleMaps.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [GMSServices provideAPIKey:@"YOUR_IOS_API_KEY"];
  // ... existing code
}
```

### **7. Update Location Service**

The `UnifiedLocationService.js` has been updated with Google Maps integration methods:

```javascript
// Search for places
const places = await locationService.searchPlaces('auto repair', userLocation, 5000);

// Get place details
const details = await locationService.getPlaceDetails(placeId);

// Geocode address to coordinates
const coords = await locationService.geocodeAddress('123 Main St, City');

// Reverse geocode coordinates to address
const address = await locationService.reverseGeocode(40.7128, -74.0060);
```

## 🔧 **Implementation Status**

### **✅ Completed:**
- Supabase integration for saved locations
- Mock Google Maps API methods for testing
- Service structure and error handling

### **🔄 Next Steps:**
1. **Add real Google Maps API calls** (replace mock methods)
2. **Implement place search UI components**
3. **Add autocomplete functionality**
4. **Integrate with location selection screens**

## 💰 **Pricing**

**Google Maps API Pricing (as of 2024):**
- **Maps Load:** $7 per 1,000 loads
- **Places API:** $17 per 1,000 requests
- **Geocoding:** $5 per 1,000 requests
- **Free Tier:** $200 credit per month

**Cost Optimization:**
- Use caching for frequently accessed locations
- Implement request batching
- Use mock data for development/testing

## 🛡️ **Security Best Practices**

1. **Restrict API Keys:**
   - Limit to specific apps/domains
   - Set usage quotas
   - Monitor usage in Google Cloud Console

2. **Environment Variables:**
   - Never commit API keys to version control
   - Use different keys for development/production

3. **Rate Limiting:**
   - Implement client-side rate limiting
   - Cache responses to reduce API calls

## 🧪 **Testing**

The service includes mock implementations for testing:

```javascript
// Enable mock mode for testing
locationService.setMockMode(true);

// Test with mock data
const places = await locationService.searchPlaces('auto repair');
```

## 📱 **Usage Examples**

```javascript
import UnifiedLocationService from '../services/UnifiedLocationService';

const locationService = new UnifiedLocationService();

// Search for nearby auto repair shops
const searchResults = await locationService.searchPlaces(
  'auto repair shop',
  { latitude: 40.7128, longitude: -74.0060 },
  5000 // 5km radius
);

// Get detailed information about a place
const placeDetails = await locationService.getPlaceDetails('place_id_here');

// Save a location for the user
const savedLocation = await locationService.saveLocation({
  name: 'My Home',
  address: '123 Main St, City, State',
  coordinates: { latitude: 40.7128, longitude: -74.0060 }
}, userId);
```

## 🚨 **Troubleshooting**

**Common Issues:**

1. **API Key Not Working:**
   - Check API restrictions
   - Verify package name/bundle ID
   - Ensure APIs are enabled

2. **Quota Exceeded:**
   - Check usage in Google Cloud Console
   - Implement caching
   - Consider upgrading billing plan

3. **Location Permissions:**
   - Request proper permissions
   - Handle permission denied gracefully
   - Provide fallback options

## 📚 **Additional Resources**

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [React Native Maps Documentation](https://github.com/react-native-maps/react-native-maps)
- [Google Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)
- [Google Cloud Console](https://console.cloud.google.com/)

---

**Next:** Once Google Maps API is configured, the location service will provide rich location data and search capabilities for the QueueUp app! 🎉
