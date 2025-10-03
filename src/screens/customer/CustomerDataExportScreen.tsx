import * as React from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Switch,
} from 'react-native';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextAWS';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialCard from '../../components/shared/MaterialCard';
import MaterialButton from '../../components/shared/MaterialButton';

interface CustomerDataExportScreenProps {
  navigation: any;
}

const CustomerDataExportScreen: React.FC<CustomerDataExportScreenProps> = ({ navigation }) => {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const theme = getCurrentTheme();

  const [selectedDataTypes, setSelectedDataTypes] = useState<any>({
    serviceHistory: true,
    vehicleData: true,
    accountInfo: true,
    messages: false,
    analytics: false,
  });

  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleDataTypeToggle = (dataType: string) => {
    setSelectedDataTypes((prev: any) => ({
      ...prev,
      [dataType]: !prev[dataType],
    }));
  };

  const handleExportData = async () => {
    setIsExporting(true);
    
    try {
      const exportData: any = {};

      if (selectedDataTypes.serviceHistory) {
        exportData.serviceHistory = 'Service history data would be exported here';
      }
      if (selectedDataTypes.vehicleData) {
        exportData.vehicleData = 'Vehicle data would be exported here';
      }
      if (selectedDataTypes.accountInfo) {
        exportData.accountInfo = 'Account info would be exported here';
      }
      if (selectedDataTypes.messages) {
        exportData.messages = 'Messages would be exported here';
      }
      if (selectedDataTypes.analytics) {
        exportData.analytics = 'Analytics would be exported here';
      }

      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Export Complete',
        'Your data has been exported successfully!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const DataTypeToggle = ({ 
    title, 
    description, 
    dataType, 
    iconName 
  }: {
    title: string;
    description: string;
    dataType: string;
    iconName: string;
  }) => (
    <MaterialCard style={styles.dataTypeCard}>
      <View style={styles.dataTypeHeader}>
        <View style={styles.dataTypeInfo}>
          <IconFallback name={iconName} size={24} color={theme.primary} />
          <View style={styles.dataTypeText}>
            <Text style={[styles.dataTypeTitle, { color: theme.text }]}>{title}</Text>
            <Text style={[styles.dataTypeDescription, { color: theme.textSecondary }]}>
              {description}
            </Text>
          </View>
        </View>
        <Switch
          value={selectedDataTypes[dataType]}
          onValueChange={() => handleDataTypeToggle(dataType)}
          trackColor={{ false: theme.border, true: theme.primary }}
          thumbColor={selectedDataTypes[dataType] ? theme.onPrimary : theme.textSecondary}
        />
      </View>
    </MaterialCard>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Data Export"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Select Data to Export
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
            Choose which types of data you want to export from your account.
          </Text>
        </View>

        <View style={styles.dataTypesContainer}>
          <DataTypeToggle
            title="Service History"
            description="Your complete service and maintenance history"
            dataType="serviceHistory"
            iconName="history"
          />
          
          <DataTypeToggle
            title="Vehicle Data"
            description="Information about your vehicles and their details"
            dataType="vehicleData"
            iconName="directions-car"
          />
          
          <DataTypeToggle
            title="Account Information"
            description="Your profile, preferences, and account settings"
            dataType="accountInfo"
            iconName="person"
          />
          
          <DataTypeToggle
            title="Messages"
            description="Your conversation history with mechanics"
            dataType="messages"
            iconName="message"
          />
          
          <DataTypeToggle
            title="Analytics"
            description="Usage statistics and app analytics"
            dataType="analytics"
            iconName="analytics"
          />
        </View>

        <View style={styles.exportSection}>
          <MaterialButton
            title={isExporting ? "Exporting..." : "Export Data"}
            onPress={handleExportData}
            loading={isExporting}
            disabled={isExporting}
            style={styles.exportButton}
          />
          
          <Text style={[styles.exportNote, { color: theme.textSecondary }]}>
            The exported data will be saved to your device and can be shared or backed up.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    lineHeight: 22,
  },
  dataTypesContainer: {
    marginBottom: 32,
  },
  dataTypeCard: {
    marginBottom: 12,
    padding: 16,
  },
  dataTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dataTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dataTypeText: {
    marginLeft: 12,
    flex: 1,
  },
  dataTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dataTypeDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  exportSection: {
    alignItems: 'center',
  },
  exportButton: {
    marginBottom: 16,
    minWidth: 200,
  },
  exportNote: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
});

export default CustomerDataExportScreen;
