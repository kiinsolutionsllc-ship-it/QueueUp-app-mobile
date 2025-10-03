import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '../../hooks/useResponsive';
import { Heading3, Heading4 } from '../../components/shared/ResponsiveText';
import { ResponsiveContainer } from '../../components/shared/ResponsiveSpacing';
import { googleServicesManager } from '../../services/GoogleServicesManager';


interface GoogleServicesStatusScreenProps {
  navigation: any;
}
export default function GoogleServicesStatusScreen({ navigation }: GoogleServicesStatusScreenProps) {
  const { getCurrentTheme } = useTheme();
  const { t } = useLanguage();
  const theme = getCurrentTheme();
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState<any>(false);
  const [servicesStatus, setServicesStatus] = useState<any>({});
  const [productionStatus, setProductionStatus] = useState<any>({});

  useEffect(() => {
    loadServicesStatus();
  }, []);

  const loadServicesStatus = async () => {
    try {
      setLoading(true);
      const status = googleServicesManager.getAllServicesStatus();
      const prodStatus = googleServicesManager.getProductionStatus();
      setServicesStatus(status);
      setProductionStatus(prodStatus);
    } catch (error) {
      console.error('Failed to load services status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServicePress = async (serviceName) => {
    try {
      const service = googleServicesManager.getServiceStatus(serviceName);
      if (service.mockup) {
        googleServicesManager.showMockupAlert(serviceName);
      } else {
        Alert.alert(
          'Service Available',
          `${serviceName} service is ready for use.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Service Error',
        'An error occurred while accessing this service.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleToggleMockupMode = () => {
    Alert.alert(
      'Toggle Mockup Mode',
      'This will enable/disable mockup mode for all Google services. This should only be done during development.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Toggle', 
          onPress: () => {
            const currentMode = googleServicesManager.mockupMode;
            googleServicesManager.setMockupMode(!currentMode);
            loadServicesStatus();
            Alert.alert(
              'Mockup Mode Toggled',
              `Mockup mode is now ${!currentMode ? 'ENABLED' : 'DISABLED'}.`,
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  const testGoogleServices = async (): Promise<boolean> => {
    // Mock implementation - replace with actual Google services testing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true); // Mock success
      }, 1000);
    });
  };

  const handleTestServices = async () => {
    try {
      setLoading(true);
      const success = await testGoogleServices();
      
      Alert.alert(
        success ? 'Test Passed' : 'Test Failed',
        success 
          ? 'All Google services are working correctly in mockup mode!'
          : 'Some Google services encountered errors. Check the console for details.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Test Error',
        'An error occurred while testing Google services.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const renderServiceCard = (serviceName, status) => {
    const mockupData = googleServicesManager.getMockupData(serviceName);
    const isMockup = status.mockup;
    const isEnabled = status.enabled;

    return (
      <TouchableOpacity
        key={serviceName}
        style={[
          styles.serviceCard,
          { 
            backgroundColor: theme.cardBackground,
            borderColor: isMockup ? theme.warning : isEnabled ? theme.success : theme.error,
            borderWidth: 2
          }
        ]}
        onPress={() => handleServicePress(serviceName)}
        activeOpacity={0.7}
      >
        <View style={styles.serviceHeader}>
          <View style={styles.serviceIconContainer}>
            <IconFallback 
              name={mockupData.icon} 
              size={24} 
              color={isMockup ? theme.warning : isEnabled ? theme.success : theme.error} 
            />
          </View>
          <View style={styles.serviceInfo}>
            <Text style={[styles.serviceTitle, { color: theme.text }]}>
              {mockupData.title}
            </Text>
            <Text style={[styles.serviceSubtitle, { color: theme.textSecondary }]}>
              {mockupData.subtitle}
            </Text>
          </View>
          <View style={styles.serviceStatus}>
            {isMockup && (
              <View style={[styles.mockupBadge, { backgroundColor: theme.warning }]}>
                <Text style={styles.mockupBadgeText}>Preview</Text>
              </View>
            )}
            {isEnabled && !isMockup && (
              <View style={[styles.enabledBadge, { backgroundColor: theme.success }]}>
                <Text style={styles.enabledBadgeText}>Active</Text>
              </View>
            )}
            {!isEnabled && (
              <View style={[styles.disabledBadge, { backgroundColor: theme.error }]}>
                <Text style={styles.disabledBadgeText}>Disabled</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.serviceDetails}>
          <Text style={[styles.serviceStatusText, { color: theme.textSecondary }]}>
            Status: {isMockup ? 'Preview Mode' : isEnabled ? 'Available' : 'Unavailable'}
          </Text>
          <Text style={[styles.serviceDescription, { color: theme.textSecondary }]}>
            {isMockup 
              ? 'This service is in preview mode for testing purposes.'
              : isEnabled 
                ? 'This service is fully functional and ready for use.'
                : 'This service is currently disabled or unavailable.'
            }
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="transparent" 
        translucent={true}
      />
      
      {/* Custom Navigation Header */}
      <View style={[styles.header, { 
        backgroundColor: theme.background,
        paddingTop: insets.top + 10,
        paddingBottom: 10,
      }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <IconFallback name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          
          <View style={styles.headerTitle}>
            <Text style={[styles.headerTitleText, { color: theme.text }]}>
              Google Services Status
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {
              Alert.alert(
                'Google Services',
                'This screen shows the status of all Google services integrated in the app.',
                [{ text: 'OK' }]
              );
            }}
            activeOpacity={0.7}
          >
            <IconFallback name="more-vert" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
      >
        {/* Production Status */}
        <ResponsiveContainer>
          <View style={[styles.statusCard, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.statusHeader}>
              <IconFallback 
                name={productionStatus.ready ? "check-circle" : "warning"} 
                size={24} 
                color={productionStatus.ready ? theme.success : theme.warning} 
              />
              <Text style={[styles.statusTitle, { color: theme.text }]}>
                {productionStatus.ready ? 'Production Ready' : 'Development Mode'}
              </Text>
            </View>
            <Text style={[styles.statusSubtitle, { color: theme.textSecondary }]}>
              {productionStatus.percentage}% of services in preview mode
            </Text>
            <View style={styles.statusStats}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.primary }]}>
                  {productionStatus.mockupServices}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Preview
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.success }]}>
                  {productionStatus.realServices}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Active
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.text }]}>
                  {productionStatus.totalServices}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Total
                </Text>
              </View>
            </View>
          </View>
        </ResponsiveContainer>

        {/* Services List */}
        <ResponsiveContainer>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Google Services
          </Text>
        </ResponsiveContainer>

        {Object.entries(servicesStatus).map(([serviceName, status]) => 
          renderServiceCard(serviceName, status)
        )}

        {/* Development Controls */}
        <ResponsiveContainer>
          <View style={[styles.devControlsCard, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.devControlsTitle, { color: theme.text }]}>
              Development Controls
            </Text>
            <Text style={[styles.devControlsSubtitle, { color: theme.textSecondary }]}>
              These controls are for development and testing purposes only.
            </Text>
            
            <TouchableOpacity
              style={[styles.devButton, { backgroundColor: theme.warning }]}
              onPress={handleToggleMockupMode}
            >
              <IconFallback name="settings" size={20} color="white" />
              <Text style={styles.devButtonText}>
                Toggle Mockup Mode
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.devButton, { backgroundColor: theme.primary }]}
              onPress={handleTestServices}
              disabled={loading}
            >
              <IconFallback name="bug-report" size={20} color="white" />
              <Text style={styles.devButtonText}>
                {loading ? 'Testing...' : 'Test Services'}
              </Text>
            </TouchableOpacity>
          </View>
        </ResponsiveContainer>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 56,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusCard: {
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  statusSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
  },
  statusStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  serviceCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  serviceStatus: {
    alignItems: 'flex-end',
  },
  mockupBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mockupBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  enabledBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  enabledBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  disabledBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  disabledBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  serviceDetails: {
    marginTop: 8,
  },
  serviceStatusText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  devControlsCard: {
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  devControlsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  devControlsSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 16,
  },
  devButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 8,
  },
  devButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
});
