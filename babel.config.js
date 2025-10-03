module.exports = function(api) {
  // Let Babel handle caching automatically
  const isProduction = api.env('production');
  const isDevelopment = api.env('development');
  
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // Optimize for production builds
          lazyImports: isProduction,
          // Use modern JSX transform
          jsxRuntime: 'automatic',
        }
      ]
    ],
    plugins: [
      // Worklets plugin for animations (replaces reanimated plugin)
      'react-native-worklets/plugin',
      
      // Production optimizations
      ...(isProduction ? [
        // Remove console logs in production
        ['transform-remove-console', { exclude: ['error', 'warn'] }],
      ] : []),
      
      // Development optimizations
      ...(isDevelopment ? [
        // Hot reloading - only for web
        'react-refresh/babel',
      ] : []),
      
      // Always include these plugins
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@services': './src/services',
            '@contexts': './src/contexts',
            '@hooks': './src/hooks',
            '@navigation': './src/navigation',
            '@assets': './assets',
          },
        },
      ],
      
      // Optimize imports for better tree shaking
      [
        'transform-imports',
        {
          'react-native-vector-icons': {
            transform: 'react-native-vector-icons/${member}',
            preventFullImport: true,
          },
          '@expo/vector-icons': {
            transform: '@expo/vector-icons/${member}',
            preventFullImport: true,
          },
        },
      ],
    ],
  };
};

