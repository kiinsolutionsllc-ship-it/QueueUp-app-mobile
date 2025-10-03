import * as React from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextSupabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { useEarningsDisplay } from '../../contexts/EarningsDisplayContext';
import ModernHeader from '../../components/shared/ModernHeader';

const { width } = Dimensions.get('window');

interface UnifiedSettingsScreenProps {
  navigation: any;
}

const UnifiedSettingsScreen: React.FC<UnifiedSettingsScreenProps> = ({ navigation }) => {
  const { getCurrentTheme } = useTheme();
  const { logout, user } = useAuth();
  const { t } = useLanguage();
  const { 
    earningsDisplay,
    updateEarningsDisplay
  } = useEarningsDisplay();
  const theme = getCurrentTheme();

  // Determine if user is mechanic or customer
  const isMechanic = user?.role === 'mechanic' || user?.user_type === 'mechanic';

  const [notificationsEnabled, setNotificationsEnabled] = useState<any>(true);
  const [locationTracking, setLocationTracking] = useState<any>(true);
  const [priceAlerts, setPriceAlerts] = useState<any>(true);
  const [serviceReminders, setServiceReminders] = useState<any>(true);
  const [currentTier, setCurrentTier] = useState<any>('basic');
  const [showPricingTiers, setShowPricingTiers] = useState<any>(false);
  
  // Enhanced work preferences state (for mechanics)
  const [workPreferences, setWorkPreferences] = useState<any>({
    autoAcceptJobs: false,
    autoAcceptCriteria: {
      maxDistance: 10, // miles
      minJobValue: 50, // dollars
      preferredServices: ['oil-change', 'brake-repair'],
      workingHours: {
        start: '08:00',
        end: '18:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      }
    },
    locationTracking: true,
    locationAccuracy: 'high', // high, medium, low
    serviceRadius: 25, // miles
    showEarnings: true,
    earningsDisplay: 'detailed', // simple, detailed, hidden
    emergencyMode: false,
    emergencySettings: {
      maxResponseTime: 30, // minutes
      priorityLevel: 'high',
      autoAcceptEmergency: false
    },
    workingHours: {
      monday: { start: '08:00', end: '18:00', enabled: true },
      tuesday: { start: '08:00', end: '18:00', enabled: true },
      wednesday: { start: '08:00', end: '18:00', enabled: true },
      thursday: { start: '08:00', end: '18:00', enabled: true },
      friday: { start: '08:00', end: '18:00', enabled: true },
      saturday: { start: '09:00', end: '17:00', enabled: false },
      sunday: { start: '10:00', end: '16:00', enabled: false }
    },
    serviceAreas: ['downtown', 'suburbs'],
    maxJobsPerDay: 8,
    breakTime: 30, // minutes between jobs
    weekendWork: false
  });

  // Modal states
  const [activeModal, setActiveModal] = useState<any>(null);
  
  // Accordion states
  const [expandedSections, setExpandedSections] = useState<any>({
    notifications: false,
    accountProfile: false,
    appSettings: false,
    servicePreferences: false,
    dataPrivacy: false,
  });

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };


  const openModal = (modalName: string) => {
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const toggleAccordion = (section: string) => {
    setExpandedSections((prev: any) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const SettingItem = ({ 
    title, 
    subtitle,
    iconName, 
    onPress, 
    rightComponent, 
    showArrow = true 
  }: {
    title: string;
    subtitle?: string;
    iconName: string;
    onPress: () => void;
    rightComponent?: React.ReactNode;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: theme.cardBackground }]}
      onPress={onPress}
    >
      <View style={styles.settingLeft}>
        <IconFallback name={iconName} size={20} color={theme.primary} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
          )}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
        {showArrow && (
          <MaterialIcons name="chevron-right" size={20} color={theme.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );

  const SectionButton = ({ 
    title, 
    iconName, 
    onPress, 
    count 
  }: {
    title: string;
    iconName: string;
    onPress: () => void;
    count?: string | number;
  }) => (
    <TouchableOpacity
      style={[styles.sectionButton, { backgroundColor: theme.cardBackground }]}
      onPress={onPress}
    >
      <View style={styles.sectionButtonLeft}>
        <IconFallback name={iconName} size={18} color={theme.primary} />
        <Text style={[styles.sectionButtonTitle, { color: theme.text }]}>{title}</Text>
      </View>
      <View style={styles.sectionButtonRight}>
        {count && (
          <Text style={[styles.sectionButtonCount, { color: theme.textSecondary }]}>
            {count}
          </Text>
        )}
        <MaterialIcons name="chevron-right" size={18} color={theme.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  const AccordionSection = ({ 
    title, 
    iconName, 
    sectionKey, 
    children 
  }: {
    title: string;
    iconName: string;
    sectionKey: string;
    children: React.ReactNode;
  }) => {
    const isExpanded = expandedSections[sectionKey];
    
    return (
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.accordionHeader, { backgroundColor: theme.cardBackground }]}
          onPress={() => toggleAccordion(sectionKey)}
          activeOpacity={0.7}
        >
          <View style={styles.accordionHeaderLeft}>
            <IconFallback name={iconName} size={18} color={theme.primary} />
            <Text style={[styles.accordionTitle, { color: theme.text }]}>{title}</Text>
          </View>
          <MaterialIcons 
            name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
            size={20} 
            color={theme.textSecondary} 
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={[styles.accordionContent, { backgroundColor: theme.cardBackground }]}>
            {children}
          </View>
        )}
      </View>
    );
  };

  const renderQuickActions = () => {
    if (isMechanic) {
      return (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={[styles.quickActionCard, { backgroundColor: theme.primary + '10' }]}
              onPress={() => navigation.navigate('MechanicEarnings')}
            >
              <IconFallback name="receipt" size={20} color={theme.primary} />
              <Text style={[styles.quickActionTitle, { color: theme.text }]}>Earnings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionCard, { backgroundColor: theme.success + '10' }]}
              onPress={() => navigation.navigate('SubscriptionPlan')}
            >
              <IconFallback name="star" size={20} color={theme.success} />
              <Text style={[styles.quickActionTitle, { color: theme.text }]}>Subscription</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionCard, { backgroundColor: theme.warning + '10' }]}
              onPress={() => navigation.navigate('UnifiedProfile')}
            >
              <IconFallback name="person" size={20} color={theme.warning} />
              <Text style={[styles.quickActionTitle, { color: theme.text }]}>Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionCard, { backgroundColor: theme.info + '10' }]}
              onPress={() => navigation.navigate('HelpSupport')}
            >
              <IconFallback name="support-agent" size={20} color={theme.info} />
              <Text style={[styles.quickActionTitle, { color: theme.text }]}>Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={[styles.quickActionCard, { backgroundColor: theme.primary + '10' }]}
              onPress={() => openModal('stripePayment')}
            >
              <IconFallback name="payment" size={20} color={theme.primary} />
              <Text style={[styles.quickActionTitle, { color: theme.text }]}>Stripe Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionCard, { backgroundColor: theme.info + '10' }]}
              onPress={() => navigation.navigate('HelpSupport')}
            >
              <IconFallback name="support-agent" size={20} color={theme.info} />
              <Text style={[styles.quickActionTitle, { color: theme.text }]}>Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Settings"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        showProfile={true}
        profileAvatar={user?.avatar || user?.name || '👤'}
        showThemeToggle={true}
        user={user}
        onProfilePress={() => navigation.navigate('UnifiedProfile')}
      />
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {renderQuickActions()}

        {/* Notifications Section - Mechanics Only */}
        {isMechanic && (
          <AccordionSection
            title="Notifications"
            iconName="notifications"
            sectionKey="notifications"
          >
            <SettingItem
              title="Push Notifications"
              iconName="notifications"
              onPress={() => setNotificationsEnabled(!notificationsEnabled)}
              rightComponent={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={notificationsEnabled ? theme.onPrimary : theme.textSecondary}
                />
              }
              showArrow={false}
            />
            <SettingItem
              title="Location Tracking"
              iconName="location-on"
              onPress={() => setLocationTracking(!locationTracking)}
              rightComponent={
                <Switch
                  value={locationTracking}
                  onValueChange={setLocationTracking}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={locationTracking ? theme.onPrimary : theme.textSecondary}
                />
              }
              showArrow={false}
            />
          </AccordionSection>
        )}

        {/* Account & Profile Section - Mechanics Only - Accordion */}
        {isMechanic && (
          <AccordionSection
            title="Account & Profile"
            iconName="person"
            sectionKey="accountProfile"
          >
            <SectionButton
              title="Account"
              iconName="person"
              onPress={() => openModal('account')}
              count={2}
            />
            <SectionButton
              title="Stripe Payment"
              iconName="payment"
              onPress={() => openModal('stripePayment')}
              count="Secure"
            />
          </AccordionSection>
        )}

        {/* App Settings Section - Mechanics Only */}
        {isMechanic && (
          <AccordionSection
            title="App Settings"
            iconName="settings"
            sectionKey="appSettings"
          >
            <SectionButton
              title="Work Preferences"
              iconName="settings"
              onPress={() => openModal('servicePreferences')}
              count={3}
            />
            <SectionButton
              title="Notifications"
              iconName="notifications"
              onPress={() => openModal('notifications')}
              count={2}
            />
          </AccordionSection>
        )}

        {/* Service Preferences Section - Customers Only - Accordion */}
        {!isMechanic && (
          <AccordionSection
            title="Service Preferences"
            iconName="settings"
            sectionKey="servicePreferences"
          >
            <SettingItem
              title="Service Preferences"
              iconName="settings"
              onPress={() => {
                Alert.alert(
                  'Service Preferences',
                  'Customize your service preferences like preferred service times, vehicle types, and service categories.',
                  [{ text: 'OK' }]
                );
              }}
              showArrow={true}
            />
            <SettingItem
              title="Push Notifications"
              iconName="notifications"
              onPress={() => setNotificationsEnabled(!notificationsEnabled)}
              rightComponent={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={notificationsEnabled ? theme.onPrimary : theme.textSecondary}
                />
              }
              showArrow={false}
            />
            <SettingItem
              title="Location Tracking"
              iconName="location-on"
              onPress={() => setLocationTracking(!locationTracking)}
              rightComponent={
                <Switch
                  value={locationTracking}
                  onValueChange={setLocationTracking}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={locationTracking ? theme.onPrimary : theme.textSecondary}
                />
              }
              showArrow={false}
            />
            <SettingItem
              title="Price Alerts"
              iconName="price-change"
              onPress={() => setPriceAlerts(!priceAlerts)}
              rightComponent={
                <Switch
                  value={priceAlerts}
                  onValueChange={setPriceAlerts}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={priceAlerts ? theme.onPrimary : theme.textSecondary}
                />
              }
              showArrow={false}
            />
            <SettingItem
              title="Service Reminders"
              iconName="schedule"
              onPress={() => setServiceReminders(!serviceReminders)}
              rightComponent={
                <Switch
                  value={serviceReminders}
                  onValueChange={setServiceReminders}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={serviceReminders ? theme.onPrimary : theme.textSecondary}
                />
              }
              showArrow={false}
            />
          </AccordionSection>
        )}

        {/* Data & Privacy Section - Accordion */}
        <AccordionSection
          title="Data & Privacy"
          iconName="storage"
          sectionKey="dataPrivacy"
        >
          {isMechanic ? (
            <>
              <SectionButton
                title="Data Management"
                iconName="storage"
                onPress={() => openModal('dataManagement')}
                count={3}
              />
              <SectionButton
                title="Support & Help"
                iconName="help"
                onPress={() => navigation.navigate('HelpSupport')}
                count={3}
              />
            </>
          ) : (
            <>
              <SettingItem
                title="Export My Data"
                iconName="download"
                onPress={() => {
                  Alert.alert(
                    'Export Data',
                    'Download a copy of your service history, vehicle information, and account data.',
                    [{ text: 'OK' }]
                  );
                }}
                showArrow={true}
              />
              <SettingItem
                title="Clear Service History"
                iconName="delete-sweep"
                onPress={() => {
                  Alert.alert(
                    'Clear Service History',
                    'Remove all your past service requests and history. This action cannot be undone.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Clear', style: 'destructive' }
                    ]
                  );
                }}
                showArrow={true}
              />
              <SettingItem
                title="Privacy Settings"
                iconName="privacy-tip"
                onPress={() => {
                  Alert.alert(
                    'Privacy Settings',
                    'Manage your privacy preferences, data sharing, and location tracking settings.',
                    [{ text: 'OK' }]
                  );
                }}
                showArrow={true}
              />
              <SettingItem
                title="Support & Help"
                iconName="help"
                onPress={() => navigation.navigate('HelpSupport')}
                showArrow={true}
              />
            </>
          )}
        </AccordionSection>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Account</Text>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: theme.error }]}
            onPress={handleLogout}
          >
            <IconFallback name="logout" size={20} color="white" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginLeft: 4,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 48) / 2,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 6,
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    marginLeft: 10,
  },
  settingSubtitle: {
    fontSize: 13,
    marginLeft: 10,
    marginTop: 2,
    opacity: 0.7,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
  sectionButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionButtonTitle: {
    fontSize: 15,
    marginLeft: 10,
  },
  sectionButtonRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionButtonCount: {
    fontSize: 13,
    marginRight: 6,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
  accordionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accordionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
  },
  accordionContent: {
    borderRadius: 10,
    marginBottom: 6,
    overflow: 'hidden',
  },
});

export default UnifiedSettingsScreen;
