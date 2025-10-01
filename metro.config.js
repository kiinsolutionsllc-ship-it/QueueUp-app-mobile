const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Basic optimizations to reduce memory usage
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Simple alias for better imports
config.resolver.alias = {
  '@': path.resolve(__dirname, 'src'),
  '@components': path.resolve(__dirname, 'src/components'),
  '@screens': path.resolve(__dirname, 'src/screens'),
  '@services': path.resolve(__dirname, 'src/services'),
  '@contexts': path.resolve(__dirname, 'src/contexts'),
  '@hooks': path.resolve(__dirname, 'src/hooks'),
  '@navigation': path.resolve(__dirname, 'src/navigation'),
  '@assets': path.resolve(__dirname, 'assets'),
};

// Optimize transformer for memory usage
config.transformer = {
  ...config.transformer,
  // Enable inline requires for better performance
  inlineRequires: true,
  // Optimize asset handling
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
};

// Basic server configuration
config.server = {
  ...config.server,
  port: parseInt(process.env.RCT_METRO_PORT) || 8081,
};

// Exclude unnecessary files from bundling
config.resolver.blockList = [
  /node_modules\/.*\/node_modules\/react-native\/.*/,
  /.*\.test\.(js|ts|tsx)$/,
  /.*\.spec\.(js|ts|tsx)$/,
];

module.exports = config;