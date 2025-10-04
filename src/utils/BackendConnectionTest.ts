/**
 * Backend Connection Test Utility
 * Tests all backend connections and configurations in the app
 */

import { testSupabaseConnection } from '../config/supabase';

export interface ConnectionTestResult {
  supabase: boolean;
  backend: boolean;
  stripe: boolean;
  googleMaps: boolean;
  environment: boolean;
  overall: boolean;
  errors: string[];
}

export class BackendConnectionTest {
  private static instance: BackendConnectionTest;
  private testResults: ConnectionTestResult | null = null;

  static getInstance(): BackendConnectionTest {
    if (!BackendConnectionTest.instance) {
      BackendConnectionTest.instance = new BackendConnectionTest();
    }
    return BackendConnectionTest.instance;
  }

  async runFullTest(): Promise<ConnectionTestResult> {
    console.log('🔍 Running Backend Connection Test...\n');
    
    const errors: string[] = [];
    let supabase = false;
    let backend = false;
    let stripe = false;
    let googleMaps = false;
    let environment = false;

    // Test 1: Environment Variables
    console.log('1. Testing Environment Variables...');
    const requiredEnvVars = [
      'EXPO_PUBLIC_SUPABASE_URL',
      'EXPO_PUBLIC_SUPABASE_ANON_KEY',
      'EXPO_PUBLIC_API_URL',
      'EXPO_PUBLIC_BACKEND_URL',
      'STRIPE_SECRET_KEY',
      'EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'EXPO_PUBLIC_GOOGLE_MAPS_API_KEY'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length === 0) {
      environment = true;
      console.log('   ✅ All environment variables are set');
    } else {
      errors.push(`Missing environment variables: ${missingVars.join(', ')}`);
      console.log('   ❌ Missing environment variables:', missingVars.join(', '));
    }

    // Test 2: Supabase Connection
    console.log('\n2. Testing Supabase Connection...');
    try {
      supabase = await testSupabaseConnection();
      if (supabase) {
        console.log('   ✅ Supabase connection successful');
      } else {
        errors.push('Supabase connection failed');
        console.log('   ❌ Supabase connection failed');
      }
    } catch (error) {
      errors.push(`Supabase error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.log('   ❌ Supabase connection error:', error);
    }

    // Test 3: Backend API Connection
    console.log('\n3. Testing Backend API Connection...');
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        backend = true;
        console.log('   ✅ Backend API connection successful');
        console.log('   📊 Backend response:', data);
      } else {
        errors.push(`Backend API returned status ${response.status}`);
        console.log('   ❌ Backend API error:', response.status);
      }
    } catch (error) {
      errors.push(`Backend API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.log('   ❌ Backend API connection error:', error);
    }

    // Test 4: Stripe Configuration
    console.log('\n4. Testing Stripe Configuration...');
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const stripePublishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    if (stripeSecretKey && stripePublishableKey && 
        stripeSecretKey.startsWith('sk_') && 
        stripePublishableKey.startsWith('pk_')) {
      stripe = true;
      console.log('   ✅ Stripe configuration is valid');
    } else {
      errors.push('Stripe configuration is invalid or missing');
      console.log('   ❌ Stripe configuration is invalid');
    }

    // Test 5: Google Maps Configuration
    console.log('\n5. Testing Google Maps Configuration...');
    const googleMapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (googleMapsKey && googleMapsKey.startsWith('AIza')) {
      googleMaps = true;
      console.log('   ✅ Google Maps configuration is valid');
    } else {
      errors.push('Google Maps configuration is invalid or missing');
      console.log('   ❌ Google Maps configuration is invalid');
    }

    // Overall result
    const overall = supabase && backend && stripe && googleMaps && environment;

    this.testResults = {
      supabase,
      backend,
      stripe,
      googleMaps,
      environment,
      overall,
      errors
    };

    // Print summary
    console.log('\n📊 CONNECTION TEST SUMMARY:');
    console.log('   Supabase:', supabase ? '✅' : '❌');
    console.log('   Backend API:', backend ? '✅' : '❌');
    console.log('   Stripe:', stripe ? '✅' : '❌');
    console.log('   Google Maps:', googleMaps ? '✅' : '❌');
    console.log('   Environment:', environment ? '✅' : '❌');
    console.log('   Overall:', overall ? '✅ ALL SYSTEMS GO!' : '❌ ISSUES DETECTED');

    if (errors.length > 0) {
      console.log('\n❌ ERRORS FOUND:');
      errors.forEach(error => console.log(`   - ${error}`));
    }

    return this.testResults;
  }

  getLastTestResults(): ConnectionTestResult | null {
    return this.testResults;
  }

  async quickTest(): Promise<boolean> {
    try {
      const results = await this.runFullTest();
      return results.overall;
    } catch (error) {
      console.error('Quick test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const backendConnectionTest = BackendConnectionTest.getInstance();
