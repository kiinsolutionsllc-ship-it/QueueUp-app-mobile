import React, { useState, useRef, useCallback, useMemo, useEffect, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Animated,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  FlatList,
  ImageBackground,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import IconFallback from './IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextSupabase';
import { designTokens } from '../../design-system/DesignSystem';
import { useJobDetails } from '../../hooks/useJobDetails';
import {
  JobDetailsModalProps,
  JobTimelineEvent,
  JobNote,
  ImageGalleryItem,
} from '../../types/JobDetailsTypes';
import { 
  usePerformanceOptimization, 
  useStableCallback, 
  useStableValue,
  debounce,
  throttle 
} from '../../utils/PerformanceOptimizer';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Status configurations
const STATUS_CONFIGS: Record<string, any> = {
  pending: {
    color: '#F59E0B',
    backgroundColor: '#FEF3C7',
    icon: 'schedule',
    label: 'Pending',
    description: 'Waiting for mechanic assignment',
  },
  in_progress: {
    color: '#0891B2',
    backgroundColor: '#DBEAFE',
    icon: 'build',
    label: 'In Progress',
    description: 'Work is currently being performed',
  },
  completed: {
    color: '#10B981',
    backgroundColor: '#D1FAE5',
    icon: 'check-circle',
    label: 'Completed',
    description: 'Job has been finished successfully',
  },
  cancelled: {
    color: '#EF4444',
    backgroundColor: '#FEE2E2',
    icon: 'cancel',
    label: 'Cancelled',
    description: 'Job has been cancelled',
  },
  on_hold: {
    color: '#8B5CF6',
    backgroundColor: '#EDE9FE',
    icon: 'pause-circle',
    label: 'On Hold',
    description: 'Job is temporarily paused',
  },
};

// Urgency configurations
const URGENCY_CONFIGS: Record<string, any> = {
  low: {
    color: '#10B981',
    backgroundColor: '#D1FAE5',
    icon: 'low-priority',
    label: 'Low',
    description: 'Can be scheduled flexibly',
  },
  medium: {
    color: '#F59E0B',
    backgroundColor: '#FEF3C7',
    icon: 'priority-high',
    label: 'Medium',
    description: 'Should be addressed soon',
  },
  high: {
    color: '#EF4444',
    backgroundColor: '#FEE2E2',
    icon: 'warning',
    label: 'High',
    description: 'Requires immediate attention',
  },
  urgent: {
    color: '#DC2626',
    backgroundColor: '#FEE2E2',
    icon: 'emergency',
    label: 'Urgent',
    description: 'Critical - needs immediate service',
  },
};

// Memoized Timeline Item Component
const TimelineItem = memo<{
  event: JobTimelineEvent;
  theme: any;
  isLast: boolean;
}>(({ event, theme, isLast }) => {
  const getEventIcon = useCallback((type: string) => {
    switch (type) {
      case 'created': return 'add-circle';
      case 'accepted': return 'check-circle';
      case 'in_progress': return 'build';
      case 'completed': return 'check-circle';
      case 'cancelled': return 'cancel';
      case 'note': return 'note';
      case 'status_change': return 'update';
      default: return 'info';
    }
  }, []);

  const getEventColor = useCallback((type: string) => {
    switch (type) {
      case 'created': return theme.primary;
      case 'accepted': return theme.success;
      case 'in_progress': return theme.warning;
      case 'completed': return theme.success;
      case 'cancelled': return theme.error;
      case 'note': return theme.info;
      case 'status_change': return theme.accent;
      default: return theme.textSecondary;
    }
  }, [theme]);

  const eventIcon = useMemo(() => getEventIcon(event.type), [event.type, getEventIcon]);
  const eventColor = useMemo(() => getEventColor(event.type), [event.type, getEventColor]);

  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineContent}>
        <View style={styles.timelineHeader}>
          <View
            style={[
              styles.timelineDot,
              { backgroundColor: eventColor },
            ]}
          >
            <IconFallback
              name={eventIcon}
              size={12}
              color="white"
            />
          </View>
          <Text style={[styles.timelineTitle, { color: theme.text }]}>
            {event.title}
          </Text>
          <Text style={[styles.timelineDate, { color: theme.textSecondary }]}>
            {new Date(event.timestamp).toLocaleDateString()}
          </Text>
        </View>
        <Text style={[styles.timelineDescription, { color: theme.textSecondary }]}>
          {event.description}
        </Text>
        {event.user && (
          <Text style={[styles.timelineUser, { color: theme.textSecondary }]}>
            by {event.user.name} ({event.user.role})
          </Text>
        )}
      </View>
      {!isLast && (
        <View style={[styles.timelineLine, { backgroundColor: theme.border }]} />
      )}
    </View>
  );
});

TimelineItem.displayName = 'TimelineItem';

// Memoized Image Gallery Component
const ImageGallery = memo<{
  images: string[];
  visible: boolean;
  onClose: () => void;
  initialIndex: number;
  theme: any;
}>(({ images, visible, onClose, initialIndex, theme }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = useCallback((event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const index = Math.round(contentOffset.x / screenWidth);
    setCurrentIndex(index);
  }, []);

  const renderImage = useCallback((image: string, index: number) => (
    <ImageBackground
      key={index}
      source={{ uri: image }}
      style={styles.imageGalleryImage}
      resizeMode="contain"
    />
  ), []);

  const renderDot = useCallback((_: any, index: number) => (
    <View
      key={index}
      style={[
        styles.imageGalleryDot,
        {
          backgroundColor: index === currentIndex ? 'white' : 'rgba(255,255,255,0.3)',
        },
      ]}
    />
  ), [currentIndex]);

  if (!visible || images.length === 0) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={[styles.imageGalleryContainer, { backgroundColor: 'black' }]}>
        <View style={styles.imageGalleryHeader}>
          <Text style={styles.imageGalleryTitle}>
            {currentIndex + 1} of {images.length}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.imageGalleryClose}>
            <IconFallback name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          style={styles.imageGalleryScroll}
        >
          {images.map(renderImage)}
        </ScrollView>

        {images.length > 1 && (
          <View style={styles.imageGalleryDots}>
            {images.map(renderDot)}
          </View>
        )}
      </View>
    </Modal>
  );
});

ImageGallery.displayName = 'ImageGallery';

// Memoized Note Input Component
const NoteInput = memo<{
  visible: boolean;
  onAdd: (note: string) => void;
  onCancel: () => void;
  theme: any;
  loading: boolean;
}>(({ visible, onAdd, onCancel, theme, loading }) => {
  const [note, setNote] = useState('');

  const handleSubmit = useCallback(() => {
    if (note.trim()) {
      onAdd(note.trim());
      setNote('');
    }
  }, [note, onAdd]);

  const handleCancel = useCallback(() => {
    setNote('');
    onCancel();
  }, [onCancel]);

  if (!visible) return null;

  return (
    <View style={[styles.noteInputContainer, { backgroundColor: theme.surface }]}>
      <Text style={[styles.noteInputTitle, { color: theme.text }]}>
        Add Note
      </Text>
      <TextInput
        style={[
          styles.noteInput,
          {
            backgroundColor: theme.cardBackground,
            color: theme.text,
            borderColor: theme.border,
          },
        ]}
        value={note}
        onChangeText={setNote}
        placeholder="Enter your note..."
        placeholderTextColor={theme.textSecondary}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />
      <View style={styles.noteInputActions}>
        <TouchableOpacity
          style={[styles.noteInputButton, { backgroundColor: theme.border }]}
          onPress={handleCancel}
        >
          <Text style={[styles.noteInputButtonText, { color: theme.text }]}>
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.noteInputButton,
            { backgroundColor: theme.primary },
            (!note.trim() || loading) && { opacity: 0.5 },
          ]}
          onPress={handleSubmit}
          disabled={!note.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={[styles.noteInputButtonText, { color: theme.onPrimary }]}>
              Add Note
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
});

NoteInput.displayName = 'NoteInput';

// Memoized Action Button Component
const ActionButton = memo<{
  action: any;
  theme: any;
}>(({ action, theme }) => {
  const handlePress = useCallback(() => {
    if (!action.disabled && !action.loading) {
      action.onPress();
    }
  }, [action]);

  return (
    <TouchableOpacity
      style={[
        styles.actionButton,
        {
          backgroundColor: action.variant === 'primary' ? action.color : 'transparent',
          borderColor: action.color,
          borderWidth: action.variant === 'primary' ? 0 : 1,
        },
      ]}
      onPress={handlePress}
      disabled={action.disabled || action.loading}
      accessibilityLabel={action.label}
      accessibilityRole="button"
    >
      {action.loading ? (
        <ActivityIndicator size="small" color={action.variant === 'primary' ? theme.onPrimary : action.color} />
      ) : (
        <IconFallback name={action.icon} size={18} color={action.variant === 'primary' ? theme.onPrimary : action.color} />
      )}
      <Text
        style={[
          styles.actionButtonText,
          {
            color: action.variant === 'primary' ? theme.onPrimary : action.color,
          },
        ]}
      >
        {action.label}
      </Text>
    </TouchableOpacity>
  );
});

ActionButton.displayName = 'ActionButton';

// Memoized Info Row Component
const InfoRow = memo<{
  label: string;
  value: string;
  theme: any;
}>(({ label, value, theme }) => (
  <View style={styles.infoRow}>
    <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
      {label}:
    </Text>
    <Text style={[styles.infoValue, { color: theme.text }]}>
      {value}
    </Text>
  </View>
));

InfoRow.displayName = 'InfoRow';

// Memoized Schedule Row Component
const ScheduleRow = memo<{
  icon: string;
  text: string;
  theme: any;
}>(({ icon, text, theme }) => (
  <View style={styles.scheduleRow}>
    <IconFallback name={icon} size={16} color={theme.textSecondary} />
    <Text style={[styles.scheduleText, { color: theme.text }]}>
      {text}
    </Text>
  </View>
));

ScheduleRow.displayName = 'ScheduleRow';

// Main Unified Component with Performance Optimizations
const UnifiedJobDetailsModal: React.FC<JobDetailsModalProps> = memo(({
  visible,
  onClose,
  job,
  onStatusChange,
  onAcceptJob,
  onDeclineJob,
  onRescheduleJob,
  onCallCustomer,
  onNavigateToLocation,
  onShareJob,
  onAddNote,
  onRateJob,
  showActions = true,
  userRole = 'customer',
  style,
  testID,
}) => {
  // Performance monitoring
  const { renderCount, measureRender } = usePerformanceOptimization('UnifiedJobDetailsModal');
  
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const theme = getCurrentTheme();

  // State management
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'notes'>('details');
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAddNote, setShowAddNote] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;

  // Performance optimized callbacks
  const handleTabChange = useStableCallback((tab: 'details' | 'timeline' | 'notes') => {
    setActiveTab(tab);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleImagePress = useStableCallback((index: number) => {
    setSelectedImageIndex(index);
    setShowImageGallery(true);
  }, []);

  const handleCloseImageGallery = useStableCallback(() => {
    setShowImageGallery(false);
  }, []);

  const handleAddNotePress = useStableCallback(() => {
    setShowAddNote(true);
  }, []);

  const handleCloseAddNote = useStableCallback(() => {
    setShowAddNote(false);
  }, []);

  // Debounced functions for performance
  const debouncedTabChange = useMemo(
    () => debounce(handleTabChange, 100),
    [handleTabChange]
  );

  const throttledImagePress = useMemo(
    () => throttle(handleImagePress, 300),
    [handleImagePress]
  );

  // Use custom hook
  const {
    loading,
    error,
    actions,
    statusConfig,
    formatJobTitle,
    formatJobType,
    formatVehicle,
    formatDate,
    formatTime,
    formatPrice,
    getStatusColor,
    getUrgencyColor,
    handleStatusChange,
    handleAcceptJob,
    handleDeclineJob,
    handleRescheduleJob,
    handleCallCustomer,
    handleNavigateToLocation,
    handleShareJob,
    handleAddNote: handleAddNoteHook,
    handleRateJob,
    refreshJob,
  } = useJobDetails({
    job,
    onStatusChange,
    onAcceptJob,
    onDeclineJob,
    onRescheduleJob,
    onCallCustomer,
    onNavigateToLocation,
    onShareJob,
    onAddNote,
    onRateJob,
    userRole,
    theme,
  });

  // Memoized values for performance
  const memoizedJobTitle = useMemo(() => 
    job ? formatJobTitle(job.title) : '', 
    [job, formatJobTitle]
  );

  const memoizedJobDescription = useMemo(() => 
    job?.description || '', 
    [job?.description]
  );

  const memoizedJobType = useMemo(() => 
    job ? formatJobType(job.type) : '', 
    [job, formatJobType]
  );

  const memoizedVehicle = useMemo(() => 
    job && job.vehicle ? formatVehicle(job.vehicle) : '', 
    [job, formatVehicle]
  );

  const memoizedFormattedDate = useMemo(() => 
    job && job.scheduledDate ? formatDate(job.scheduledDate) : '', 
    [job, formatDate]
  );

  const memoizedFormattedTime = useMemo(() => 
    job && job.scheduledTime ? formatTime(job.scheduledTime) : '', 
    [job, formatTime]
  );

  const memoizedFormattedPrice = useMemo(() => 
    job && job.price ? formatPrice(job.price) : '', 
    [job, formatPrice]
  );

  const memoizedStatusColor = useMemo(() => 
    job ? getStatusColor(job.status) : theme.primary, 
    [job, getStatusColor, theme.primary]
  );

  const memoizedUrgencyColor = useMemo(() => 
    job ? getUrgencyColor(job.urgency) : theme.warning, 
    [job, getUrgencyColor, theme.warning]
  );

  // Memoized image gallery
  const memoizedImageGallery = useMemo(() => {
    if (!job?.images || job.images.length === 0) return [];
    
    return job.images.map((image, index) => ({
      id: `image-${index}`,
      uri: image,
      index
    }));
  }, [job?.images]);

  // Memoized timeline events
  const memoizedTimelineEvents = useMemo(() => {
    if (!job?.timeline) return [];
    
    return job.timeline.map((event: any, index: number) => ({
      ...event,
      id: event.id || `timeline-${index}`,
      formattedDate: formatDate(event.timestamp),
      formattedTime: formatTime(event.timestamp)
    }));
  }, [job?.timeline, formatDate, formatTime]);

  // Memoized notes
  const memoizedNotes = useMemo(() => {
    if (!job?.notes || !Array.isArray(job.notes)) return [];
    
    return job.notes.map((note: any, index: number) => ({
      ...note,
      id: note.id || `note-${index}`,
      formattedDate: formatDate(note.createdAt),
      formattedTime: formatTime(note.createdAt)
    }));
  }, [job?.notes, formatDate, formatTime]);

  const memoizedVehicleInfo = useMemo(() => 
    job ? formatVehicle(job.vehicle || '') : 'N/A', 
    [job, formatVehicle]
  );

  const memoizedScheduleInfo = useMemo(() => {
    if (!job) return null;
    return {
      hasDate: !!job.scheduledDate,
      hasTime: !!job.scheduledTime,
      hasLocation: !!job.location,
      date: job.scheduledDate ? formatDate(job.scheduledDate) : '',
      time: job.scheduledTime ? formatTime(job.scheduledTime) : '',
      location: job.location || '',
    };
  }, [job, formatDate, formatTime]);

  const memoizedJobInfo = useMemo(() => {
    if (!job) return null;
    return {
      category: formatJobType(job.category),
      subcategory: formatJobType(job.subcategory),
      serviceType: job.serviceType === 'mobile' ? 'Mobile Service' : 'Shop Service',
      price: job.price ? formatPrice(job.price) : null,
      vehicle: memoizedVehicleInfo,
    };
  }, [job, formatJobType, formatPrice, memoizedVehicleInfo]);

  const memoizedCustomerInfo = useMemo(() => {
    if (!job?.customer) return null;
    return {
      name: job.customer.name || 'N/A',
      phone: job.customer.phone || null,
      email: job.customer.email || null,
    };
  }, [job?.customer]);

  // Animation effects
  useEffect(() => {
    if (visible && job) {
      startEnterAnimation();
    } else {
      startExitAnimation();
    }
  }, [visible, job]);

  useEffect(() => {
    const tabIndex = activeTab === 'details' ? 0 : activeTab === 'timeline' ? 1 : 2;
    Animated.spring(tabIndicatorAnim, {
      toValue: tabIndex,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [activeTab, tabIndicatorAnim]);

  const startEnterAnimation = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  const startExitAnimation = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [fadeAnim, slideAnim, scaleAnim, onClose]);

  // Event handlers
  const handleAddNote = useCallback(async (note: string) => {
    await handleAddNoteHook(note);
    setShowAddNote(false);
  }, [handleAddNoteHook]);


  // Render functions
  const renderHeader = useCallback(() => (
    <View style={[styles.header, { borderBottomColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.text }]}>Job Details</Text>
      <TouchableOpacity
        onPress={startExitAnimation}
        style={styles.closeButton}
        accessibilityLabel="Close job details"
        accessibilityRole="button"
      >
        <IconFallback name="close" size={24} color={theme.text} />
      </TouchableOpacity>
    </View>
  ), [theme, startExitAnimation]);

  const renderTabs = useCallback(() => (
    <View style={[styles.tabsContainer, { backgroundColor: theme.surface }]}>
      <View style={styles.tabs}>
        {[
          { key: 'details', label: 'Details', icon: 'info' },
          { key: 'timeline', label: 'Timeline', icon: 'timeline' },
          { key: 'notes', label: 'Notes', icon: 'note' },
        ].map((tab, index) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => handleTabChange(tab.key as any)}
          >
            <IconFallback
              name={tab.icon}
              size={18}
              color={activeTab === tab.key ? theme.primary : theme.textSecondary}
            />
            <Text
              style={[
                styles.tabLabel,
                {
                  color: activeTab === tab.key ? theme.primary : theme.textSecondary,
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Animated.View
        style={[
          styles.tabIndicator,
          {
            backgroundColor: theme.primary,
            transform: [
              {
                translateX: tabIndicatorAnim.interpolate({
                  inputRange: [0, 1, 2],
                  outputRange: [0, screenWidth / 3, (screenWidth / 3) * 2],
                }),
              },
            ],
          },
        ]}
      />
    </View>
  ), [theme, activeTab, handleTabChange, tabIndicatorAnim]);

  const renderStatusBadge = useCallback(() => {
    if (!job) return null;

    return (
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: statusConfig.backgroundColor,
              borderColor: statusConfig.color,
            },
          ]}
        >
          <IconFallback name={statusConfig.icon} size={16} color={statusConfig.color} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>

        <View
          style={[
            styles.urgencyBadge,
            {
              backgroundColor: URGENCY_CONFIGS[job.urgency]?.backgroundColor || theme.surface,
              borderColor: getUrgencyColor(job.urgency),
            },
          ]}
        >
          <IconFallback
            name={URGENCY_CONFIGS[job.urgency]?.icon || 'priority-high'}
            size={14}
            color={getUrgencyColor(job.urgency)}
          />
          <Text style={[styles.urgencyText, { color: getUrgencyColor(job.urgency) }]}>
            {URGENCY_CONFIGS[job.urgency]?.label || job.urgency}
          </Text>
        </View>
      </View>
    );
  }, [job, statusConfig, theme, getUrgencyColor]);

  const renderJobImages = useCallback(() => {
    if (!job?.images || job.images.length === 0) return null;

    return (
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Job Photos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
          {job.images.map((image, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleImagePress(index)}
              style={styles.imageThumbnail}
            >
              <Image source={{ uri: image }} style={styles.thumbnailImage} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }, [job?.images, theme, handleImagePress]);

  const renderDetailsTab = useCallback(() => {
    if (!job) return null;

    return (
      <ScrollView
        style={styles.tabContent}
        contentContainerStyle={styles.tabContentContainer}
        refreshControl={
          <RefreshControl
            refreshing={loading.isLoading}
            onRefresh={refreshJob}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        <Text style={[styles.jobTitle, { color: theme.text }]}>
          {memoizedJobTitle}
        </Text>

        {memoizedJobDescription && (
          <Text style={[styles.jobDescription, { color: theme.textSecondary }]}>
            {memoizedJobDescription}
          </Text>
        )}

        {renderStatusBadge()}
        {renderJobImages()}

        {/* Schedule Information */}
        {memoizedScheduleInfo && (memoizedScheduleInfo.hasDate || memoizedScheduleInfo.hasTime || memoizedScheduleInfo.hasLocation) && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Schedule Details</Text>

            {memoizedScheduleInfo.hasDate && (
              <ScheduleRow
                icon="event"
                text={`Date: ${memoizedScheduleInfo.date}`}
                theme={theme}
              />
            )}

            {memoizedScheduleInfo.hasTime && (
              <ScheduleRow
                icon="access-time"
                text={`Time: ${memoizedScheduleInfo.time}`}
                theme={theme}
              />
            )}

            {memoizedScheduleInfo.hasLocation && (
              <ScheduleRow
                icon="location-on"
                text={`Location: ${memoizedScheduleInfo.location}`}
                theme={theme}
              />
            )}
          </View>
        )}

        {/* Job Information */}
        {memoizedJobInfo && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Job Information</Text>

            <InfoRow label="Category" value={memoizedJobInfo.category} theme={theme} />
            <InfoRow label="Service" value={memoizedJobInfo.subcategory} theme={theme} />
            <InfoRow label="Service Type" value={memoizedJobInfo.serviceType} theme={theme} />

            {memoizedJobInfo.price && (
              <InfoRow label="Price" value={memoizedJobInfo.price} theme={theme} />
            )}

            {memoizedJobInfo.vehicle !== 'N/A' && (
              <InfoRow label="Vehicle" value={memoizedJobInfo.vehicle} theme={theme} />
            )}
          </View>
        )}

        {/* Customer Information */}
        {memoizedCustomerInfo && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Customer Information</Text>

            <InfoRow label="Name" value={memoizedCustomerInfo.name} theme={theme} />

            {memoizedCustomerInfo.phone && (
              <InfoRow label="Phone" value={memoizedCustomerInfo.phone} theme={theme} />
            )}

            {memoizedCustomerInfo.email && (
              <InfoRow label="Email" value={memoizedCustomerInfo.email} theme={theme} />
            )}
          </View>
        )}

        {/* Job Reference */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Job Reference</Text>
          <Text style={[styles.jobIdText, { color: theme.textSecondary }]}>
            Job ID: {job.id}
          </Text>
        </View>
      </ScrollView>
    );
  }, [
    job,
    theme,
    loading.isLoading,
    refreshJob,
    memoizedJobTitle,
    memoizedJobDescription,
    renderStatusBadge,
    renderJobImages,
    memoizedScheduleInfo,
    memoizedJobInfo,
    memoizedCustomerInfo,
  ]);

  const renderTimelineTab = useCallback(() => {
    // Mock timeline data - in real app, this would come from the hook
    const timeline: JobTimelineEvent[] = [
      {
        id: '1',
        type: 'created',
        title: 'Job Created',
        description: 'Customer created a new service request',
        timestamp: job?.createdAt || new Date().toISOString(),
        user: {
          name: job?.customer?.name || 'Customer',
          role: 'customer',
        },
      },
      {
        id: '2',
        type: 'status_change',
        title: 'Status Updated',
        description: `Job status changed to ${job?.status}`,
        timestamp: job?.updatedAt || new Date().toISOString(),
        user: {
          name: 'System',
          role: 'system',
        },
      },
    ];

    return (
      <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentContainer}>
        <View style={styles.timelineContainer}>
          {timeline.map((event, index) => (
            <TimelineItem
              key={event.id}
              event={event}
              theme={theme}
              isLast={index === timeline.length - 1}
            />
          ))}
        </View>
      </ScrollView>
    );
  }, [job, theme]);

  const renderNoteItem = useCallback(({ item }: { item: JobNote }) => (
    <View style={[styles.noteItem, { backgroundColor: theme.surface }]}>
      <Text style={[styles.noteContent, { color: theme.text }]}>
        {item.content}
      </Text>
      <View style={styles.noteFooter}>
        <Text style={[styles.noteAuthor, { color: theme.textSecondary }]}>
          {item.createdBy.name}
        </Text>
        <Text style={[styles.noteDate, { color: theme.textSecondary }]}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  ), [theme]);

  const renderEmptyNotes = useCallback(() => (
    <View style={styles.emptyNotes}>
      <IconFallback name="note" size={48} color={theme.textSecondary} />
      <Text style={[styles.emptyNotesText, { color: theme.textSecondary }]}>
        No notes yet
        </Text>
      </View>
    ), [theme]);

  const renderNotesTab = useCallback(() => {
    // Mock notes data - in real app, this would come from the hook
    const notes: JobNote[] = [
      {
        id: '1',
        content: 'Customer mentioned unusual noise from the engine',
        createdAt: job?.createdAt || new Date().toISOString(),
        createdBy: {
          id: '1',
          name: job?.customer?.name || 'Customer',
          role: 'customer',
        },
        isPrivate: false,
      },
    ];

    return (
      <View style={styles.tabContent}>
        <View style={styles.notesHeader}>
          <Text style={[styles.notesTitle, { color: theme.text }]}>Notes</Text>
          <TouchableOpacity
            style={[styles.addNoteButton, { backgroundColor: theme.primary }]}
            onPress={() => setShowAddNote(true)}
          >
            <IconFallback name="add" size={18} color="white" />
            <Text style={[styles.addNoteButtonText, { color: 'white' }]}>Add Note</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={renderNoteItem}
          contentContainerStyle={styles.notesList}
          ListEmptyComponent={renderEmptyNotes}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={5}
        />
      </View>
    );
  }, [job, theme]);

  const renderActions = useCallback(() => {
    if (actions.length === 0) return null;

    return (
      <View style={[styles.actionsContainer, { borderTopColor: theme.border }]}>
        {actions.map((action) => (
          <ActionButton
            key={action.id}
            action={action}
            theme={theme}
          />
        ))}
      </View>
    );
  }, [actions, theme]);

  const renderLoadingState = useCallback(() => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={[styles.loadingText, { color: theme.text }]}>
        {loading.loadingMessage || 'Loading...'}
      </Text>
    </View>
  ), [theme, loading.loadingMessage]);

  const renderErrorState = useCallback(() => (
    <View style={styles.errorContainer}>
      <IconFallback name="error" size={48} color={theme.error} />
      <Text style={[styles.errorText, { color: theme.error }]}>
        {error || 'Something went wrong'}
      </Text>
      <TouchableOpacity
        style={[styles.retryButton, { backgroundColor: theme.primary }]}
        onPress={refreshJob}
      >
        <Text style={[styles.retryButtonText, { color: theme.onPrimary }]}>
          Try Again
        </Text>
      </TouchableOpacity>
    </View>
  ), [theme, error, refreshJob]);

  if (!job) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      presentationStyle="pageSheet"
      onRequestClose={startExitAnimation}
    >
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: theme.background,
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
          style,
        ]}
        testID={testID}
      >
        {renderHeader()}
        {renderTabs()}

        {loading.isLoading ? (
          renderLoadingState()
        ) : error ? (
          renderErrorState()
        ) : (
          <>
            {activeTab === 'details' && renderDetailsTab()}
            {activeTab === 'timeline' && renderTimelineTab()}
            {activeTab === 'notes' && renderNotesTab()}
          </>
        )}

        {renderActions()}

        <NoteInput
          visible={showAddNote}
          onAdd={handleAddNote}
          onCancel={() => setShowAddNote(false)}
          theme={theme}
          loading={loading.isLoading && loading.loadingMessage === 'Adding note...'}
        />

        <ImageGallery
          images={job.images || []}
          visible={showImageGallery}
          onClose={() => setShowImageGallery(false)}
          initialIndex={selectedImageIndex}
          theme={theme}
        />
      </Animated.View>
    </Modal>
  );
});

UnifiedJobDetailsModal.displayName = 'UnifiedJobDetailsModal';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  tabs: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '33.33%',
    height: 2,
  },
  tabContent: {
    flex: 1,
  },
  tabContentContainer: {
    padding: 20,
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  jobDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    flex: 1,
    textAlign: 'right',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleText: {
    fontSize: 16,
    marginLeft: 8,
  },
  jobIdText: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  imagesContainer: {
    marginTop: 12,
  },
  imageThumbnail: {
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  timelineContainer: {
    paddingTop: 20,
  },
  timelineItem: {
    position: 'relative',
    paddingLeft: 40,
    paddingBottom: 20,
  },
  timelineContent: {
    backgroundColor: 'transparent',
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineDot: {
    position: 'absolute',
    left: -32,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    position: 'absolute',
    left: -20,
    top: 24,
    width: 2,
    height: '100%',
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  timelineDate: {
    fontSize: 12,
  },
  timelineDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  timelineUser: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addNoteButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  notesList: {
    padding: 20,
  },
  noteItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  noteContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteAuthor: {
    fontSize: 12,
    fontWeight: '500',
  },
  noteDate: {
    fontSize: 12,
  },
  emptyNotes: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyNotesText: {
    marginTop: 16,
    fontSize: 16,
  },
  noteInputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  noteInputTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 80,
  },
  noteInputActions: {
    flexDirection: 'row',
    gap: 12,
  },
  noteInputButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  noteInputButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  imageGalleryContainer: {
    flex: 1,
  },
  imageGalleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
  },
  imageGalleryTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageGalleryClose: {
    padding: 8,
  },
  imageGalleryScroll: {
    flex: 1,
  },
  imageGalleryImage: {
    width: screenWidth,
    height: '100%',
  },
  imageGalleryDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  imageGalleryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UnifiedJobDetailsModal;
