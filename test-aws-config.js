// Test script to verify AWS configuration
const { initializeAWS } = require('./src/config/awsConfig.ts');

async function testAWSConfig() {
  console.log('=== Testing AWS Configuration ===');
  
  // Test environment variables
  console.log('\n1. Environment Variables:');
  console.log('EXPO_PUBLIC_AWS_REGION:', process.env.EXPO_PUBLIC_AWS_REGION);
  console.log('EXPO_PUBLIC_AWS_USER_POOL_ID:', process.env.EXPO_PUBLIC_AWS_USER_POOL_ID);
  console.log('EXPO_PUBLIC_AWS_USER_POOL_WEB_CLIENT_ID:', process.env.EXPO_PUBLIC_AWS_USER_POOL_WEB_CLIENT_ID);
  
  // Test AWS initialization
  console.log('\n2. Testing AWS Initialization:');
  try {
    const result = initializeAWS();
    console.log('Initialization result:', result);
  } catch (error) {
    console.error('Initialization error:', error);
  }
  
  console.log('\n=== Test Complete ===');
}

testAWSConfig().catch(console.error);


