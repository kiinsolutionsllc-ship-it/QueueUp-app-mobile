import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import IconFallback from './IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import MaterialButton from './MaterialButton';
import { FeatureOverlay } from './FeatureTooltip';

// Help Modal Component
export function HelpModal({ 
  visible, 
  onClose, 
  title, 
  content, 
  style 
}) {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <Pressable 
        style={[styles.helpModal, { backgroundColor: theme.background }]}
        onPress={onClose}
      >
        <Pressable 
          style={styles.helpModalContent}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.helpModalHeader, { borderBottomColor: theme.divider }]}>
            <Text style={[styles.helpModalTitle, { color: theme.text }]}>
              {title}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.helpModalClose}>
              <IconFallback name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.helpModalContent}>
            {content}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// Help Section Component
export function HelpSection({ 
  title, 
  children, 
  style 
}) {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  return (
    <View style={[styles.helpSection, style]}>
      <Text style={[styles.helpSectionTitle, { color: theme.text }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

// Help Item Component
export function HelpItem({ 
  icon, 
  title, 
  description, 
  onPress,
  style 
}) {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  return (
    <TouchableOpacity
      style={[styles.helpItem, { borderBottomColor: theme.divider }, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.helpItemIcon, { backgroundColor: theme.primary + '20' }]}>
        <IconFallback name={icon} size={20} color={theme.primary} />
      </View>
      <View style={styles.helpItemContent}>
        <Text style={[styles.helpItemTitle, { color: theme.text }]}>
          {title}
        </Text>
        {description && (
          <Text style={[styles.helpItemDescription, { color: theme.textSecondary }]}>
            {description}
          </Text>
        )}
      </View>
      <IconFallback name="chevron-right" size={20} color={theme.textSecondary} />
    </TouchableOpacity>
  );
}

// Quick Help Component
export function QuickHelp({ 
  text, 
  icon = 'info-outline', 
  style 
}) {
  const { getCurrentTheme } = useTheme();
  const responsive = useResponsive();
  const theme = getCurrentTheme();

  return (
    <View style={[styles.quickHelp, style]}>
      <IconFallback 
        name={icon} 
        size={responsive.scale(14)} 
        color={theme.info} 
      />
      <Text style={[styles.quickHelpText, { color: theme.textSecondary }]}>
        {text}
      </Text>
    </View>
  );
}

// Feature Introduction Component
export function FeatureIntroduction({ 
  featureId, 
  title, 
  description, 
  position, 
  onComplete,
  style 
}) {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  const [visible, setVisible] = useState(true);

  const handleComplete = () => {
    setVisible(false);
    onComplete && onComplete(featureId);
  };

  if (!visible) return null;

  return (
    <FeatureOverlay
      visible={visible}
      onClose={handleComplete}
      title={title}
      description={description}
      actionText="Got it!"
      onActionPress={handleComplete}
      position={position}
      style={style}
    />
  );
}

// Help Content Generator
export const HelpContent = {
  // Home Screen Help
  homeScreen: () => (
    <View>
      <HelpSection title="Getting Started">
        <HelpItem
          icon="add"
          title="Create Service Request"
          description="Tap the + button to create a new service request"
        />
        <HelpItem
          icon="work"
          title="My Jobs"
          description="View and manage your active service requests"
        />
        <HelpItem
          icon="chat"
          title="Messages"
          description="Communicate with mechanics about your requests"
        />
      </HelpSection>

      <HelpSection title="Quick Actions">
        <HelpItem
          icon="directions-car"
          title="Vehicle Management"
          description="Add and manage your vehicle information"
        />
        <HelpItem
          icon="analytics"
          title="Analytics"
          description="View your service history and statistics"
        />
      </HelpSection>
    </View>
  ),

  // Job Creation Help
  jobCreation: () => (
    <View>
      <HelpSection title="Creating a Service Request">
        <HelpItem
          icon="description"
          title="Describe the Problem"
          description="Be as detailed as possible about the issue"
        />
        <HelpItem
          icon="camera-alt"
          title="Add Photos"
          description="Photos help mechanics understand the problem better"
        />
        <HelpItem
          icon="location-on"
          title="Set Location"
          description="Choose where you want the service performed"
        />
        <HelpItem
          icon="schedule"
          title="Set Timeline"
          description="When do you need the service completed?"
        />
      </HelpSection>
    </View>
  ),

  // Messaging Help
  messaging: () => (
    <View>
      <HelpSection title="Messaging Features">
        <HelpItem
          icon="chat"
          title="Direct Messages"
          description="Chat directly with mechanics about your requests"
        />
        <HelpItem
          icon="attach-file"
          title="File Sharing"
          description="Share photos and documents with mechanics"
        />
        <HelpItem
          icon="notifications"
          title="Notifications"
          description="Get notified when mechanics respond to your messages"
        />
      </HelpSection>
    </View>
  ),

  // Vehicle Dashboard Help
  vehicleDashboard: () => (
    <View>
      <HelpSection title="Vehicle Management">
        <HelpItem
          icon="directions-car"
          title="Vehicle Health Score"
          description="Monitor your vehicle's overall condition and maintenance status"
        />
        <HelpItem
          icon="schedule"
          title="Service Reminders"
          description="Get notified about upcoming maintenance and service appointments"
        />
        <HelpItem
          icon="speed"
          title="Mileage Tracking"
          description="Track your vehicle's mileage and service intervals"
        />
        <HelpItem
          icon="event"
          title="Maintenance Calendar"
          description="View your service history and upcoming appointments"
        />
        <HelpItem
          icon="warning"
          title="Recall Notifications"
          description="Stay informed about manufacturer recalls and safety notices"
        />
        <HelpItem
          icon="history"
          title="Service History"
          description="Complete record of all maintenance and repairs performed"
        />
      </HelpSection>
      
      <HelpSection title="Adding a Vehicle">
        <HelpItem
          icon="add"
          title="Tap the + Button"
          description="Add a new vehicle to your dashboard"
        />
        <HelpItem
          icon="info"
          title="Enter Vehicle Details"
          description="Provide make, model, year, and license plate information"
        />
        <HelpItem
          icon="speed"
          title="Set Current Mileage"
          description="Enter your vehicle's current mileage for accurate tracking"
        />
      </HelpSection>
    </View>
  )};

const styles = StyleSheet.create({
  helpModal: {
    flex: 1,
  },
  helpModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1},
  helpModalTitle: {
    fontSize: 18,
    fontWeight: '600'},
  helpModalClose: {
    padding: 4},
  helpModalContent: {
    flex: 1,
    padding: 16},
  helpSection: {
    marginBottom: 24},
  helpSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12},
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1},
  helpItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12},
  helpItemContent: {
    flex: 1},
  helpItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4},
  helpItemDescription: {
    fontSize: 14,
    lineHeight: 20},
  quickHelp: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.05)'},
  quickHelpText: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1}});
