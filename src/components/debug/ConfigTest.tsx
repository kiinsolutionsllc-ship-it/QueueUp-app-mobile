import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

export const ConfigTest: React.FC = () => {
  const awsConfig = Constants.expoConfig?.extra?.aws;
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configuration Test</Text>
      <Text style={styles.label}>AWS Region:</Text>
      <Text style={styles.value}>{awsConfig?.region || 'NOT SET'}</Text>
      
      <Text style={styles.label}>User Pool ID:</Text>
      <Text style={styles.value}>{awsConfig?.userPoolId ? 'SET' : 'NOT SET'}</Text>
      
      <Text style={styles.label}>Client ID:</Text>
      <Text style={styles.value}>{awsConfig?.userPoolClientId ? 'SET' : 'NOT SET'}</Text>
      
      <Text style={styles.label}>Cognito Domain:</Text>
      <Text style={styles.value}>{awsConfig?.cognitoDomain || 'NOT SET'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    margin: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },
  value: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
});


