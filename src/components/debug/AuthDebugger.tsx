import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { AWSCognitoService } from '../../services/AWSCognitoService';
import { initializeAWS } from '../../config/awsConfig';

interface AuthDebuggerProps {
  onClose: () => void;
}

export const AuthDebugger: React.FC<AuthDebuggerProps> = ({ onClose }) => {
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => prev + '\n' + info);
  };

  const runDebugTest = async () => {
    setIsLoading(true);
    setDebugInfo('=== AWS Cognito Debug Test ===\n');
    
    try {
      // 1. Check environment variables
      addDebugInfo('\n1. Environment Variables:');
      addDebugInfo(`Region: ${process.env.EXPO_PUBLIC_AWS_REGION || 'NOT SET'}`);
      addDebugInfo(`User Pool ID: ${process.env.EXPO_PUBLIC_AWS_USER_POOL_ID ? 'SET' : 'NOT SET'}`);
      addDebugInfo(`Client ID: ${process.env.EXPO_PUBLIC_AWS_USER_POOL_WEB_CLIENT_ID ? 'SET' : 'NOT SET'}`);
      
      // 2. Test AWS initialization
      addDebugInfo('\n2. Testing AWS Initialization:');
      try {
        const initResult = initializeAWS();
        addDebugInfo(`Initialization: ${JSON.stringify(initResult, null, 2)}`);
      } catch (error: any) {
        addDebugInfo(`Initialization Error: ${error.message}`);
      }
      
      // 3. Test configuration check
      addDebugInfo('\n3. Testing Configuration Check:');
      try {
        // Access the private method through any for debugging
        const isConfigured = (AWSCognitoService as any).isConfigured();
        addDebugInfo(`Is configured: ${isConfigured}`);
      } catch (error: any) {
        addDebugInfo(`Configuration check error: ${error.message}`);
      }
      
      // 4. Test sign in with invalid credentials to see error handling
      addDebugInfo('\n4. Testing Error Handling:');
      try {
        const result = await AWSCognitoService.signIn('test@example.com', 'wrongpassword');
        addDebugInfo(`Sign in test result: ${JSON.stringify(result, null, 2)}`);
      } catch (error: any) {
        addDebugInfo(`Sign in test error: ${error.message}`);
      }
      
      addDebugInfo('\n=== Debug Complete ===');
      
    } catch (error: any) {
      addDebugInfo(`\nUnexpected error: ${error.message}`);
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
          Alert.alert('Error', error.message);
        } finally {
          setIsLoading(false);
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Auth Debugger</Text>
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
          onPress={runDebugTest}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Running...' : 'Run Debug Test'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={testWithRealCredentials}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Test Real Login</Text>
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
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});


