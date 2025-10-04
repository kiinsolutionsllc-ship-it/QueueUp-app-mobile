/**
 * Backend Test Component
 * A simple component to test backend connections in your app
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { backendConnectionTest, ConnectionTestResult } from '../../utils/BackendConnectionTest';
import { useTheme } from '../../contexts/ThemeContext';

interface BackendTestComponentProps {
  onTestComplete?: (results: ConnectionTestResult) => void;
}

export default function BackendTestComponent({ onTestComplete }: BackendTestComponentProps) {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<ConnectionTestResult | null>(null);

  const runTest = async () => {
    setIsRunning(true);
    try {
      const testResults = await backendConnectionTest.runFullTest();
      setResults(testResults);
      onTestComplete?.(testResults);
    } catch (error) {
      console.error('Backend test failed:', error);
      Alert.alert('Test Failed', 'Backend connection test failed. Check console for details.');
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: boolean) => status ? '✅' : '❌';
  const getStatusColor = (status: boolean) => status ? theme.success : theme.error;

  const styles = StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: theme.background,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 20,
    },
    testButton: {
      backgroundColor: theme.primary,
      padding: 15,
      borderRadius: 8,
      marginBottom: 20,
      alignItems: 'center',
    },
    testButtonText: {
      color: theme.background,
      fontSize: 16,
      fontWeight: 'bold',
    },
    resultsContainer: {
      backgroundColor: theme.cardBackground,
      padding: 15,
      borderRadius: 8,
      marginBottom: 10,
    },
    resultRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    resultLabel: {
      fontSize: 16,
      color: theme.text,
    },
    resultStatus: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    overallStatus: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 15,
      padding: 10,
      borderRadius: 8,
    },
    errorText: {
      color: theme.error,
      fontSize: 14,
      marginTop: 10,
    },
    loadingText: {
      color: theme.text,
      fontSize: 16,
      textAlign: 'center',
      fontStyle: 'italic',
    },
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Backend Connection Test</Text>
      
      <TouchableOpacity 
        style={[styles.testButton, isRunning && { opacity: 0.6 }]} 
        onPress={runTest}
        disabled={isRunning}
      >
        <Text style={styles.testButtonText}>
          {isRunning ? 'Running Test...' : 'Run Backend Test'}
        </Text>
      </TouchableOpacity>

      {isRunning && (
        <Text style={styles.loadingText}>
          Testing backend connections... This may take a few seconds.
        </Text>
      )}

      {results && (
        <View style={styles.resultsContainer}>
          <Text style={[styles.resultLabel, { fontWeight: 'bold', marginBottom: 10 }]}>
            Test Results:
          </Text>
          
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Environment Variables</Text>
            <Text style={[styles.resultStatus, { color: getStatusColor(results.environment) }]}>
              {getStatusIcon(results.environment)}
            </Text>
          </View>
          
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Supabase Database</Text>
            <Text style={[styles.resultStatus, { color: getStatusColor(results.supabase) }]}>
              {getStatusIcon(results.supabase)}
            </Text>
          </View>
          
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Backend API</Text>
            <Text style={[styles.resultStatus, { color: getStatusColor(results.backend) }]}>
              {getStatusIcon(results.backend)}
            </Text>
          </View>
          
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Stripe Payments</Text>
            <Text style={[styles.resultStatus, { color: getStatusColor(results.stripe) }]}>
              {getStatusIcon(results.stripe)}
            </Text>
          </View>
          
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Google Maps</Text>
            <Text style={[styles.resultStatus, { color: getStatusColor(results.googleMaps) }]}>
              {getStatusIcon(results.googleMaps)}
            </Text>
          </View>

          <View style={[styles.overallStatus, { 
            backgroundColor: results.overall ? theme.success + '20' : theme.error + '20'
          }]}>
            {results.overall ? '🎉 All Systems Connected!' : '⚠️ Issues Detected'}
          </View>

          {results.errors.length > 0 && (
            <View>
              <Text style={[styles.errorText, { fontWeight: 'bold', marginTop: 15 }]}>
                Issues Found:
              </Text>
              {results.errors.map((error, index) => (
                <Text key={index} style={styles.errorText}>
                  • {error}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}
