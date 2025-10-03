module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    'react',
    'react-hooks',
    'react-native',
  ],
  env: {
    'es6': true,
    'node': true,
    'jest': true,
  },
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react-native/no-unused-styles': 'off',
    'react-native/split-platform-components': 'off',
    'react-native/no-inline-styles': 'off',
    'react-native/no-color-literals': 'off',
    'no-console': 'off',
    'no-unused-vars': 'warn',
  },
  ignorePatterns: [
    'node_modules/',
    'android/',
    '.expo/',
    'dist/',
    'build/',
  ],
};
