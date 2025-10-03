import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import Constants from 'expo-constants';
import { initializeAWS } from '../../config/awsConfig';
import { AWSCognitoService } from '../../services/AWSCognitoService';

interface AWSConfigDebuggerProps {
  onClose: () => void;
}

export const AWSConfigDebugger: React.FC<AWSConfigDebuggerProps> = ({ onClose }) => {
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => prev + '\n' + info);
  };

  const runConfigTest = async () => {
    setIsLoading(true);
    setDebugInfo('=== AWS Configuration Debug Test ===\n');
    
    try {
      // 1. Check environment variables from Constants
      addDebugInfo('\n1. Expo Constants Configuration:');
      const awsConfig = Constants.expoConfig?.extra?.aws;
      addDebugInfo(`Region: ${awsConfig?.region || 'NOT SET'}`);
      addDebugInfo(`User Pool ID: ${awsConfig?.userPoolId || 'NOT SET'}`);
      addDebugInfo(`Client ID: ${awsConfig?.userPoolClientId || 'NOT SET'}`);
      addDebugInfo(`Cognito Domain: ${awsConfig?.cognitoDomain || 'NOT SET'}`);
      
      // 2. Check process.env as fallback
      addDebugInfo('\n2. Process Environment Variables:');
      addDebugInfo(`EXPO_PUBLIC_AWS_REGION: ${process.env.EXPO_PUBLIC_AWS_REGION || 'NOT SET'}`);
      addDebugInfo(`EXPO_PUBLIC_AWS_USER_POOL_ID: ${process.env.EXPO_PUBLIC_AWS_USER_POOL_ID || 'NOT SET'}`);
      addDebugInfo(`EXPO_PUBLIC_AWS_USER_POOL_WEB_CLIENT_ID: ${process.env.EXPO_PUBLIC_AWS_USER_POOL_WEB_CLIENT_ID || 'NOT SET'}`);
      
      // 3. Test AWS initialization
      addDebugInfo('\n3. Testing AWS Initialization:');
      try {
        const initResult = initializeAWS();
        addDebugInfo(`Initialization: ${JSON.stringify(initResult, null, 2)}`);
      } catch (error: any) {
        addDebugInfo(`Initialization Error: ${error.message}`);
        addDebugInfo(`Error Stack: ${error.stack}`);
      }
      
      // 4. Test configuration check
      addDebugInfo('\n4. Testing Configuration Check:');
      try {
        // Access the private method through any for debugging
        const isConfigured = (AWSCognitoService as any).isConfigured();
        addDebugInfo(`Is configured: ${isConfigured}`);
      } catch (error: any) {
        addDebugInfo(`Configuration check error: ${error.message}`);
      }
      
      // 5. Test sign in with invalid credentials to see error handling
      addDebugInfo('\n5. Testing Error Handling:');
      try {
        const result = await AWSCognitoService.signIn('test@example.com', 'wrongpassword');
        addDebugInfo(`Sign in test result: ${JSON.stringify(result, null, 2)}`);
      } catch (error: any) {
        addDebugInfo(`Sign in test error: ${error.message}`);
        addDebugInfo(`Error name: ${error.name}`);
        addDebugInfo(`Error code: ${error.code}`);
        addDebugInfo(`Error stack: ${error.stack}`);
      }
      
      addDebugInfo('\n=== Debug Complete ===');
      
    } catch (error: any) {
      addDebugInfo(`\nUnexpected error: ${error.message}`);
      addDebugInfo(`Error stack: ${error.stack}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testWithRealCredentials = async () => {
    Alert.prompt(
      'Test Login',
      'Enter email and password to test (separated by comma):',
      async (input) => {
        if (!input) return;
        
        const [email, password] = input.split(',').map(s => s.trim());
        if (!email || !password) {
          Alert.alert('Error', 'Please enter both email and password');
          return;
        }
        
        setIsLoading(true);
        addDebugInfo(`\n=== Testing with credentials ===`);
        addDebugInfo(`Email: ${email}`);
        
        try {
          const result = await AWSCognitoService.signIn(email, password);
          addDebugInfo(`Result: ${JSON.stringify(result, null, 2)}`);
          
          if (result.success) {
            Alert.alert('Success', 'Login successful!');
          } else {
            Alert.alert('Failed', result.error || 'Login failed');
          }
        } catch (error: any) {
          addDebugInfo(`Error: ${error.message}`);
          addDebugInfo(`Error name: ${error.name}`);
          addDebugInfo(`Error code: ${error.code}`);
          addDebugInfo(`Error stack: ${error.stack}`);
          Alert.alert('Error', error.message);
        } finally {
          setIsLoading(false);
        }
      }
    );
  };

  const clearDebugInfo = () => {
    setDebugInfo('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AWS Config Debugger</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <Text style={styles.debugText}>{debugInfo || 'No debug information yet'}</Text>
      </ScrollView>
      
      <View style={styles.buttons}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={runConfigTest}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Running...' : 'Run Config Test'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={testWithRealCredentials}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Test Real Login</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.clearButton]} 
          onPress={clearDebugInfo}
        >
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 10,
  },
  closeText: {
    fontSize: 18,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  debugText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 16,
  },
  buttons: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});


