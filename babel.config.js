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
        // Optimize imports for better tree shaking
        ['import', {
          libraryName: 'react-native-vector-icons',
          libraryDirectory: '',
          camel2DashComponentName: false,
        }, 'react-native-vector-icons'],
        ['import', {
          libraryName: '@expo/vector-icons',
          libraryDirectory: '',
          camel2DashComponentName: false,
        }, '@expo/vector-icons'],
        ['import', {
          libraryName: 'react-native-paper',
          libraryDirectory: '',
          camel2DashComponentName: false,
        }, 'react-native-paper'],
      ] : []),
      
      // Development optimizations
      ...(isDevelopment ? [
        // Hot reloading
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
      
      // Optimize for performance
      [
        'transform-imports',
        {
          'react-native-vector-icons': {
            transform: 'react-native-vector-icons/${member}',
            preventFullImport: true,
          },
        },
      ],
    ],
  };
};

