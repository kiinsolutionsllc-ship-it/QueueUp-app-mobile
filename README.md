# QueueUp - Automotive Service Marketplace

![QueueUp Logo](assets/logo.png)

A modern React Native mobile application that connects customers with trusted automotive mechanics through an intuitive marketplace platform.

## 🚗 About QueueUp

QueueUp revolutionizes the automotive service industry by providing a seamless platform where customers can find, book, and manage automotive services with verified mechanics. The app features a dual-sided marketplace with distinct experiences for customers and mechanics.

### Key Features

- **🔍 Smart Mechanic Discovery** - Find verified mechanics based on location, specialty, and ratings
- **💰 Transparent Pricing** - Compare quotes from multiple mechanics
- **📱 Real-time Communication** - Built-in messaging system for seamless communication
- **📅 Flexible Scheduling** - Book appointments that work with your schedule
- **💳 Secure Payments** - Integrated payment processing with escrow protection
- **📊 Service History** - Track all your automotive services in one place
- **⭐ Rating System** - Rate and review mechanics to help the community

## 🎨 User Experience

### Customer App
- **Theme:** Yellow accent colors for warm, approachable feel
- **Features:** Service requests, mechanic discovery, payment processing
- **Navigation:** Intuitive bottom tab navigation with quick access to key features

### Mechanic App  
- **Theme:** Red accent colors for professional, trustworthy appearance
- **Features:** Job management, earnings tracking, customer communication
- **Navigation:** Dashboard-focused with comprehensive job management tools

## 🛠 Technology Stack

- **Framework:** React Native with Expo
- **Language:** TypeScript (migrated from JavaScript)
- **State Management:** Redux Toolkit
- **Navigation:** React Navigation v6
- **UI Components:** Custom design system with glassmorphism
- **Backend:** Supabase integration
- **Real-time:** Socket.io for messaging
- **Payments:** Stripe integration
- **Authentication:** Secure token-based auth with AsyncStorage

## 📱 Screenshots

<div align="center">
  <img src="docs/images/customer-home.png" alt="Customer Home Screen" width="200"/>
  <img src="docs/images/mechanic-dashboard.png" alt="Mechanic Dashboard" width="200"/>
  <img src="docs/images/messaging.png" alt="Messaging Interface" width="200"/>
  <img src="docs/images/booking.png" alt="Service Booking" width="200"/>
</div>

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kiinsolutionsllc-ship-it/QueueUp-app-mobile.git
   cd QueueUp-app-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your device

## 🏗 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── shared/         # Shared components across user types
│   ├── animations/     # Animation components
│   └── payment/        # Payment-related components
├── contexts/           # React contexts for state management
│   ├── AuthContext.tsx # Authentication state
│   ├── ThemeContext.tsx # Theme management
│   └── LanguageContext.tsx # Internationalization
├── hooks/              # Custom React hooks
├── navigation/         # Navigation configuration
├── screens/            # Screen components
│   ├── auth/          # Authentication screens
│   ├── customer/      # Customer-specific screens
│   ├── mechanic/      # Mechanic-specific screens
│   └── shared/        # Shared screens
├── services/           # API and external service integrations
├── store/              # Redux store configuration
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🎨 Theme System

QueueUp features a sophisticated theme system that provides distinct visual identities for different user types:

### Customer Theme (Yellow)
- **Primary:** `#feca57` - Warm, approachable yellow
- **Variants:** Light, dark, and accent variations
- **Usage:** All customer-facing screens and components

### Mechanic Theme (Red)
- **Primary:** `#DC2626` - Professional, trustworthy red
- **Variants:** Light, dark, and accent variations
- **Usage:** All mechanic-facing screens and components

### Theme Features
- **Dynamic Switching:** Users can switch between Light, MidDark, and Dark themes
- **User-Type Aware:** Colors automatically adjust based on user type
- **Consistent Application:** Themes apply across all screens and components
- **Accessibility:** WCAG AA compliant color contrasts

## 🔧 Development

### Code Style
- **TypeScript:** Strict type checking enabled
- **ESLint:** Configured for React Native best practices
- **Prettier:** Consistent code formatting
- **Husky:** Pre-commit hooks for code quality

### Key Development Features
- **Hot Reloading:** Instant updates during development
- **Type Safety:** Full TypeScript coverage
- **Error Boundaries:** Graceful error handling
- **Performance:** Optimized with React.memo and useCallback
- **Testing:** Jest and React Native Testing Library setup

## 📋 Available Scripts

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run tests
npm test

# Build for production
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key

# API Configuration
EXPO_PUBLIC_API_BASE_URL=your_api_url

# Feature Flags
EXPO_PUBLIC_ENABLE_ANALYTICS=true
EXPO_PUBLIC_ENABLE_CRASH_REPORTING=true
```

## 🚀 Deployment

### Building for Production

1. **Configure app.json**
   ```json
   {
     "expo": {
       "name": "QueueUp",
       "slug": "queueup-app",
       "version": "1.0.0",
       "platforms": ["ios", "android"]
     }
   }
   ```

2. **Build for iOS**
   ```bash
   npx expo build:ios
   ```

3. **Build for Android**
   ```bash
   npx expo build:android
   ```

### App Store Deployment
- Follow Expo's [publishing guide](https://docs.expo.dev/distribution/app-stores/)
- Configure app store listings
- Set up app store connect for iOS
- Configure Google Play Console for Android

## 🤝 Contributing

We welcome contributions to QueueUp! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Email:** support@queueup.com
- **Documentation:** [docs.queueup.com](https://docs.queueup.com)
- **Issues:** [GitHub Issues](https://github.com/kiinsolutionsllc-ship-it/QueueUp-app-mobile/issues)

## 🙏 Acknowledgments

- React Native community for excellent documentation
- Expo team for the amazing development platform
- Supabase for backend infrastructure
- All contributors who help make QueueUp better

---

**Made with ❤️ by the QueueUp Team**