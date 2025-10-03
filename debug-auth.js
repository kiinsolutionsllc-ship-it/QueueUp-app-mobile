// Debug script to test AWS Cognito configuration
const { initializeAWS } = require('./src/config/awsConfig.ts');
const { AWSCognitoService } = require('./src/services/AWSCognitoService.ts');

async function debugAuth() {
  console.log('=== AWS Cognito Debug Test ===');
  
  // Check environment variables
  console.log('\n1. Environment Variables:');
  console.log('EXPO_PUBLIC_AWS_REGION:', process.env.EXPO_PUBLIC_AWS_REGION || 'NOT SET');
  console.log('EXPO_PUBLIC_AWS_USER_POOL_ID:', process.env.EXPO_PUBLIC_AWS_USER_POOL_ID ? 'SET' : 'NOT SET');
  console.log('EXPO_PUBLIC_AWS_USER_POOL_WEB_CLIENT_ID:', process.env.EXPO_PUBLIC_AWS_USER_POOL_WEB_CLIENT_ID ? 'SET' : 'NOT SET');
  
  // Test AWS initialization
  console.log('\n2. Testing AWS Initialization:');
  try {
    const initResult = initializeAWS();
    console.log('Initialization result:', initResult);
  } catch (error) {
    console.error('Initialization error:', error);
  }
  
  // Test configuration check
  console.log('\n3. Testing Configuration Check:');
  try {
    const isConfigured = AWSCognitoService.isConfigured();
    console.log('Is configured:', isConfigured);
  } catch (error) {
    console.error('Configuration check error:', error);
  }
  
  console.log('\n=== Debug Complete ===');
}

debugAuth().catch(console.error);


