/**
 * Test script for AWS Cognito integration
 * Run this to verify your AWS Cognito setup is working correctly
 */

// Note: This test script requires the .env file to be configured
// Please add your AWS Cognito credentials to the .env file first

console.log('Please configure your .env file with AWS Cognito credentials first:');
console.log('EXPO_PUBLIC_AWS_REGION=us-east-2');
console.log('EXPO_PUBLIC_AWS_USER_POOL_ID=us-east-2_obSo2mrOd');
console.log('EXPO_PUBLIC_AWS_USER_POOL_WEB_CLIENT_ID=79pbbe5cufuksiufav89ctkflm');
console.log('EXPO_PUBLIC_AWS_COGNITO_DOMAIN=us-east-2obso2mrod.auth.us-east-2.amazoncognito.com');
console.log('\nThen start the Expo development server to test the integration.');

async function testAWSCognitoIntegration() {
  console.log('🧪 Testing AWS Cognito Integration');
  console.log('=====================================\n');

  // Test 1: Initialize AWS Amplify
  console.log('1. Testing AWS Amplify initialization...');
  try {
    const initResult = initializeAWS();
    if (initResult.success) {
      console.log('✅ AWS Amplify initialized successfully');
    } else {
      console.log('❌ AWS Amplify initialization failed:', initResult.error);
      return;
    }
  } catch (error) {
    console.log('❌ AWS Amplify initialization error:', error.message);
    return;
  }

  // Test 2: Check if user is authenticated (should be false initially)
  console.log('\n2. Testing authentication status...');
  try {
    const isAuthenticated = await AWSCognitoService.isAuthenticated();
    console.log(`✅ Authentication status check: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}`);
  } catch (error) {
    console.log('❌ Authentication status check failed:', error.message);
  }

  // Test 3: Test signup (with a test email)
  console.log('\n3. Testing user signup...');
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  const testUserData = {
    email: testEmail,
    name: 'Test User',
    user_type: 'customer',
    phone: '+1234567890'
  };

  try {
    const signupResult = await AWSCognitoService.signUp(testEmail, testPassword, testUserData);
    if (signupResult.success) {
      console.log('✅ User signup successful');
      console.log(`   - Requires email confirmation: ${signupResult.requiresEmailConfirmation}`);
      console.log(`   - Message: ${signupResult.message}`);
      
      if (signupResult.requiresEmailConfirmation) {
        console.log('\n4. Testing resend confirmation email...');
        try {
          const resendResult = await AWSCognitoService.resendConfirmationEmail(testEmail);
          if (resendResult.success) {
            console.log('✅ Resend confirmation email successful');
          } else {
            console.log('❌ Resend confirmation email failed:', resendResult.error);
          }
        } catch (error) {
          console.log('❌ Resend confirmation email error:', error.message);
        }
      }
    } else {
      console.log('❌ User signup failed:', signupResult.error);
    }
  } catch (error) {
    console.log('❌ User signup error:', error.message);
  }

  // Test 4: Test signin (this will fail since email is not confirmed)
  console.log('\n5. Testing user signin (should fail - email not confirmed)...');
  try {
    const signinResult = await AWSCognitoService.signIn(testEmail, testPassword);
    if (signinResult.success) {
      console.log('✅ User signin successful');
    } else {
      console.log('✅ User signin failed as expected (email not confirmed):', signinResult.error);
    }
  } catch (error) {
    console.log('✅ User signin error as expected:', error.message);
  }

  // Test 5: Test forgot password
  console.log('\n6. Testing forgot password...');
  try {
    const forgotPasswordResult = await AWSCognitoService.forgotPassword(testEmail);
    if (forgotPasswordResult.success) {
      console.log('✅ Forgot password successful');
    } else {
      console.log('❌ Forgot password failed:', forgotPasswordResult.error);
    }
  } catch (error) {
    console.log('❌ Forgot password error:', error.message);
  }

  console.log('\n🎉 AWS Cognito integration test completed!');
  console.log('\nNext steps:');
  console.log('1. Check your email for the verification link');
  console.log('2. Click the verification link to confirm your account');
  console.log('3. Test the signin flow after email confirmation');
  console.log('4. Update your .env file with the correct AWS Cognito values');
}

// Run the test
testAWSCognitoIntegration().catch(console.error);
