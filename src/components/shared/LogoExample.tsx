import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Logo from './Logo';

/**
 * Example component showing different ways to use the Logo component
 * This can be used as a reference for implementing the logo throughout the app
 */
const LogoExample: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Logo Examples</Text>
      
      {/* Default logo with background */}
      <View style={styles.example}>
        <Text style={styles.label}>Default (with background)</Text>
        <Logo size={100} showBackground={true} />
      </View>
      
      {/* Minimal logo without background */}
      <View style={styles.example}>
        <Text style={styles.label}>Minimal (no background)</Text>
        <Logo size={100} showBackground={false} />
      </View>
      
      {/* Small icon version */}
      <View style={styles.example}>
        <Text style={styles.label}>Small Icon</Text>
        <Logo size={50} showBackground={true} />
      </View>
      
      {/* Large version */}
      <View style={styles.example}>
        <Text style={styles.label}>Large Version</Text>
        <Logo size={150} showBackground={true} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  example: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#666',
  },
});

export default LogoExample;


