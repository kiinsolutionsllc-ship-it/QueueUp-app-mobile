import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import DatabaseUtils from '../../utils/DatabaseUtils';
import databaseManager from '../../services/DatabaseManager';


interface DatabaseDebugScreenProps {
  navigation: any;
}
export default function DatabaseDebugScreen({ navigation }: DatabaseDebugScreenProps) {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  
  const [dataSummary, setDataSummary] = useState<any>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [loading, setLoading] = useState<any>(false);
  const [refreshing, setRefreshing] = useState<any>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [summary, health] = await Promise.all([
        DatabaseUtils.getDataSummary(),
        DatabaseUtils.getHealthStatus()
      ]);
      setDataSummary(summary);
      setHealthStatus(health);
    } catch (error) {
      console.error('Error loading debug data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCreateTestJob = async () => {
    try {
      const job = await DatabaseUtils.createTestJob();
      if (job) {
        Alert.alert('Success', `Test job created: ${job.id}`);
        loadData();
      } else {
        Alert.alert('Error', 'Failed to create test job');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleCreateTestMessage = async () => {
    try {
      const conversations = await databaseManager.getConversations();
      if (conversations.length === 0) {
        Alert.alert('Error', 'No conversations found. Create a conversation first.');
        return;
      }
      
      const message = await DatabaseUtils.createTestMessage(conversations[0].id);
      if (message) {
        Alert.alert('Success', `Test message created: ${message.id}`);
        loadData();
      } else {
        Alert.alert('Error', 'Failed to create test message');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all data in the database. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            const result = await DatabaseUtils.clearAllData();
            if (result.success) {
              Alert.alert('Success', 'All data cleared');
              loadData();
            } else {
              Alert.alert('Error', result.error);
            }
          }
        }
      ]
    );
  };

  const handleResetToSample = () => {
    Alert.alert(
      'Reset to Sample Data',
      'This will clear all data and reload sample data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: async () => {
            const result = await DatabaseUtils.resetToSampleData();
            if (result.success) {
              Alert.alert('Success', 'Database reset to sample data');
              loadData();
            } else {
              Alert.alert('Error', result.error);
            }
          }
        }
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const data = await DatabaseUtils.exportForDebugging();
      console.log('Exported data:', data);
      Alert.alert('Success', 'Data exported to console. Check the logs.');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 16,
    },
    header: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 10,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: theme.cardBackground,
      marginBottom: 4,
      borderRadius: 8,
    },
    statLabel: {
      color: theme.text,
      fontSize: 14,
    },
    statValue: {
      color: theme.primary,
      fontSize: 14,
      fontWeight: 'bold',
    },
    button: {
      backgroundColor: theme.primary,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 8,
      alignItems: 'center',
    },
    buttonText: {
      color: theme.text,
      fontSize: 16,
      fontWeight: 'bold',
    },
    dangerButton: {
      backgroundColor: theme.error || '#ff4444',
    },
    healthStatus: {
      padding: 12,
      borderRadius: 8,
      marginBottom: 10,
    },
    healthHealthy: {
      backgroundColor: '#d4edda',
      borderColor: '#c3e6cb',
    },
    healthWarning: {
      backgroundColor: '#fff3cd',
      borderColor: '#ffeaa7',
    },
    healthError: {
      backgroundColor: '#f8d7da',
      borderColor: '#f5c6cb',
    },
    healthText: {
      fontSize: 14,
      fontWeight: 'bold',
    },
    loadingText: {
      color: theme.text,
      textAlign: 'center',
      marginTop: 20,
    },
  });

  if (loading && !dataSummary) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading database information...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.header}>Database Debug</Text>

      {/* Health Status */}
      {healthStatus && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Status</Text>
          <View
            style={[
              styles.healthStatus,
              styles[`health${healthStatus.status.charAt(0).toUpperCase() + healthStatus.status.slice(1)}`]
            ]}
          >
            <Text style={styles.healthText}>
              Status: {healthStatus.status.toUpperCase()}
            </Text>
            {healthStatus.issues && healthStatus.issues.length > 0 && (
              <Text style={styles.healthText}>
                Issues: {healthStatus.issues.join(', ')}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Data Summary */}
      {dataSummary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Summary</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Items</Text>
            <Text style={styles.statValue}>{dataSummary.totalItems}</Text>
          </View>
          {Object.entries(dataSummary.breakdown).map(([key, count]) => (
            <View key={key} style={styles.statRow}>
              <Text style={styles.statLabel}>
                {key.replace('local_', '').replace(/_/g, ' ').toUpperCase()}
              </Text>
              <Text style={styles.statValue}>{String(count)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        <TouchableOpacity style={styles.button} onPress={handleCreateTestJob}>
          <Text style={styles.buttonText}>Create Test Job</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleCreateTestMessage}>
          <Text style={styles.buttonText}>Create Test Message</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleExportData}>
          <Text style={styles.buttonText}>Export Data to Console</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={loadData}>
          <Text style={styles.buttonText}>Refresh Data</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleResetToSample}
        >
          <Text style={styles.buttonText}>Reset to Sample Data</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleClearData}
        >
          <Text style={styles.buttonText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}


