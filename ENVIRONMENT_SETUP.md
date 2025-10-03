# Environment Variables Setup Guide

## Quick Setup

To connect your frontend to the backend, you need to set the following environment variable:

### Option 1: Create a .env file (Recommended)

Create a `.env` file in your project root with the following content:

```env
# Backend API Configuration
EXPO_PUBLIC_API_URL=http://localhost:3001/api

# Development Settings
NODE_ENV=development
EXPO_PUBLIC_DEBUG=true
EXPO_PUBLIC_MOCK_MODE=false
```

### Option 2: Set environment variables in your terminal

Before running your app, set the environment variable:

**Windows (PowerShell):**
```powershell
$env:EXPO_PUBLIC_API_URL="http://localhost:3001/api"
npx expo start
```

**Windows (Command Prompt):**
```cmd
set EXPO_PUBLIC_API_URL=http://localhost:3001/api
npx expo start
```

**macOS/Linux:**
```bash
export EXPO_PUBLIC_API_URL=http://localhost:3001/api
npx expo start
```

### Option 3: Update package.json scripts

Add the environment variable to your start scripts in `package.json`:

```json
{
  "scripts": {
    "start": "EXPO_PUBLIC_API_URL=http://localhost:3001/api npx expo start --clear",
    "start:dev": "EXPO_PUBLIC_API_URL=http://localhost:3001/api expo start --dev-client"
  }
}
```

## Backend Server Setup

Make sure your backend server is running on port 3001:

1. Navigate to your backend directory:
   ```bash
   cd C:\Users\User\Desktop\QueueUp-app-backend-main
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

3. Start the backend server:
   ```bash
   npm run dev
   ```

The backend should be running at `http://localhost:3001` and the API endpoints will be available at `http://localhost:3001/api`.

## Testing the Connection

Once both frontend and backend are running:

1. Open your app in Expo Go
2. Navigate to the mechanic screens
3. Try updating your availability status
4. Check the browser console or terminal for any connection errors

## Troubleshooting

### Common Issues:

1. **Connection Refused**: Make sure the backend server is running on port 3001
2. **CORS Errors**: The backend is configured with CORS for `http://localhost:3000` by default
3. **Environment Variable Not Working**: Make sure the variable name starts with `EXPO_PUBLIC_`

### For Different Network Setups:

If you're running the backend on a different port or IP address, update the URL accordingly:

```env
# For different port
EXPO_PUBLIC_API_URL=http://localhost:3002/api

# For different machine (replace with actual IP)
EXPO_PUBLIC_API_URL=http://192.168.1.100:3001/api

# For production
EXPO_PUBLIC_API_URL=https://your-backend-domain.com/api
```

## Current Configuration

Your app is already configured to use the environment variable `EXPO_PUBLIC_API_URL` in:

- `src/services/MechanicAvailabilityService.ts`
- `src/services/BankAccountService.ts`
- `src/services/PayoutService.ts`
- `src/services/MechanicAnalyticsService.ts`

The default fallback URL is `http://localhost:3001/api` if the environment variable is not set.
