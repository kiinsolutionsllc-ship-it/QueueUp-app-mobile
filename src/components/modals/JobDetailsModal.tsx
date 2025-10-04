import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  BackHandler,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { FlatList } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextSupabase';
import { useJob } from '../../contexts/SimplifiedJobContext';
import { useVehicle } from '../../contexts/VehicleContext';
import { formatVehicle } from '../../utils/UnifiedJobFormattingUtils';
import { formatJobCost, getJobCostBreakdown } from '../../utils/JobCostUtils';
import MaterialButton from '../shared/MaterialButton';
import MaterialTextInput from '../shared/MaterialTextInput';
import MaterialCard from '../shared/MaterialCard';
import IconFallback from '../shared/IconFallback';
import PhotoViewerModal from './PhotoViewerModal';

interface JobDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  job: any;
  userType: 'customer' | 'mechanic';
}

interface JobNote {
  id: string;
  text: string;
  author: string;
  authorType: 'customer' | 'mechanic';
  timestamp: string;
}

interface JobPhoto {
  id: string;
  uri: string;
  caption?: string;
  author: string;
  authorType: 'customer' | 'mechanic';
  timestamp: string;
}

export default function JobDetailsModal({ 
  visible, 
  onClose, 
  job, 
  userType 
}: JobDetailsModalProps) {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  const { user } = useAuth();
  const { updateJob, getJob } = useJob();
  const { vehicles } = useVehicle();

  // State management
  const [activeTab, setActiveTab] = useState<'details' | 'notes' | 'photos'>('details');
  const [newNote, setNewNote] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [currentJob, setCurrentJob] = useState(job);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Resolve vehicle data (handles both object and ID forms)
  const resolveVehicleData = (vehicle: any) => {
    console.log('🔍 JobDetailsModal - resolveVehicleData input:', vehicle, 'Type:', typeof vehicle);
    
    if (!vehicle) {
      console.log('🔍 JobDetailsModal - No vehicle provided');
      return null;
    }
    
    if (typeof vehicle === 'object' && (vehicle.make || vehicle.model || vehicle.year)) {
      console.log('🔍 JobDetailsModal - Vehicle is already an object:', vehicle);
      return vehicle;
    }
    
    if (typeof vehicle === 'string') {
      console.log('🔍 JobDetailsModal - Vehicle is string, looking for match in vehicles');
      const found = vehicles?.find?.((v: any) => v.id === vehicle);
      console.log('🔍 JobDetailsModal - Found vehicle:', found);
      if (found) return found;
    }
    
    console.log('🔍 JobDetailsModal - Returning original vehicle data:', vehicle);
    return vehicle;
  };

  // Permission: mechanics can access notes/photos only when assigned and in progress
  const assignedMechanicId = (currentJob as any)?.selectedMechanicId || (currentJob as any)?.mechanicId;
  const jobStatus = (currentJob as any)?.status?.toLowerCase?.() || '';
  const isAssignedToMe = assignedMechanicId && (assignedMechanicId === (user?.id || ''));
  const canMechanicAccessTabs = userType === 'mechanic' && isAssignedToMe && jobStatus === 'in_progress';

  // Animation refs
  const slideAnim = React.useRef(new Animated.Value(500)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Effects
  useEffect(() => {
    setCurrentJob(job);
  }, [job]);

  useEffect(() => {
    if (visible) {
      setActiveTab('details');
      setNewNote('');
      setNewPhotoCaption('');
      setIsAddingNote(false);
      setIsAddingPhoto(false);
      setIsUploadingPhoto(false);
      setShowPhotoViewer(false);
      setSelectedPhotoIndex(0);
      setCurrentJob(job);
      // If mechanic and not allowed, ensure tab is set to details
      if (userType === 'mechanic' && !canMechanicAccessTabs) {
        setActiveTab('details');
      }
      
      // Animate in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 500,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim, job]);

  // Re-validate tab when job or permissions change
  useEffect(() => {
    if (userType === 'mechanic' && !canMechanicAccessTabs && activeTab !== 'details') {
      setActiveTab('details');
    }
  }, [userType, canMechanicAccessTabs, activeTab]);

  useEffect(() => {
    const backAction = () => {
      if (visible) {
        onClose();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [visible, onClose]);

  // Utility functions
  const formatJobTitle = (title: string | undefined): string => {
    if (!title) return 'Untitled Job';
    return title.charAt(0).toUpperCase() + title.slice(1);
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'posted': return theme.warning;
      case 'bidding': return theme.primary;
      case 'accepted': return theme.success;
      case 'in_progress': return theme.primary;
      case 'completed': return theme.success;
      case 'cancelled': return theme.error;
      default: return theme.textSecondary;
    }
  };

  const getUrgencyColor = (urgency: string): string => {
    switch (urgency) {
      case 'high': return theme.error;
      case 'medium': return theme.warning;
      case 'low': return theme.success;
      default: return theme.textSecondary;
    }
  };

  // Derived timeline to ensure completion appears if missing
  const derivedTimeline = React.useMemo(() => {
    const base = Array.isArray(currentJob?.progressionTimeline)
      ? [...currentJob.progressionTimeline]
      : [] as any[];

    if (currentJob?.completedAt) {
      const hasCompleted = base.some((e: any) => (e?.status || '').toLowerCase() === 'completed');
      if (!hasCompleted) {
        base.push({
          status: 'completed',
          description: 'Job completed',
          timestamp: currentJob.completedAt,
          actor: currentJob?.mechanicName || 'System',
        });
      }
    }

    base.sort((a: any, b: any) => new Date(a?.timestamp || a?.createdAt || 0).getTime() - new Date(b?.timestamp || b?.createdAt || 0).getTime());
    return base;
  }, [currentJob]);

  // Note handling
  const handleAddNote = async () => {
    if (!newNote.trim() || !currentJob) return;

    const note: JobNote = {
      id: Date.now().toString(),
      text: newNote.trim(),
      author: user?.name || 'Unknown',
      authorType: userType,
      timestamp: new Date().toISOString(),
    };

    try {
      const updatedNotes = [...(currentJob.notes || []), note];
      console.log('📝 JobDetailsModal - Adding note:', note);
      console.log('📝 JobDetailsModal - Updated notes array:', updatedNotes);
      
      const result = await updateJob(currentJob.id, { notes: updatedNotes });
      console.log('📝 JobDetailsModal - Update result:', result);
      
      if (result && result.success) {
        setCurrentJob((prev: any) => {
          if (!prev) return prev;
          const updated = { ...prev, notes: updatedNotes };
          console.log('📝 JobDetailsModal - Updated currentJob:', updated);
          return updated;
        });
        setNewNote('');
        setIsAddingNote(false);
        Alert.alert('Success', 'Note added successfully');
      } else {
        console.error('📝 JobDetailsModal - Update failed:', result);
        Alert.alert('Error', 'Failed to add note');
      }
    } catch (error) {
      console.error('📝 JobDetailsModal - Error adding note:', error);
      Alert.alert('Error', 'Failed to add note');
    }
  };

  // Photo handling
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to upload photos!');
        return false;
      }
    }
    return true;
  };

  const handleAddPhoto = async () => {
    if (!currentJob) return;

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Photo Library', onPress: () => openImageLibrary() },
      ]
    );
  };

  const openCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await savePhoto(result.assets[0]);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const openImageLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        await savePhoto(result.assets[0]);
      }
    } catch (error) {
      console.error('Image library error:', error);
      Alert.alert('Error', 'Failed to open image library');
    }
  };

  const savePhoto = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!currentJob) return;

    setIsUploadingPhoto(true);

    try {
      const photo: JobPhoto = {
        id: Date.now().toString(),
        uri: asset.uri,
        caption: newPhotoCaption.trim() || undefined,
        author: user?.name || 'Unknown',
        authorType: userType,
        timestamp: new Date().toISOString(),
      };

      const updatedPhotos = [...(currentJob.photos || []), photo];
      const result = await updateJob(currentJob.id, { photos: updatedPhotos });
      
      if (result && result.success) {
        setCurrentJob((prev: any) => prev ? { ...prev, photos: updatedPhotos } : prev);
        setNewPhotoCaption('');
        setIsAddingPhoto(false);
        Alert.alert('Success', 'Photo added successfully');
      } else {
        Alert.alert('Error', 'Failed to add photo');
      }
    } catch (error) {
      console.error('Error saving photo:', error);
      Alert.alert('Error', 'Failed to save photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const deletePhoto = async (photoId: string) => {
    if (!currentJob) return;

    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedPhotos = currentJob.photos?.filter((photo: any) => photo.id !== photoId) || [];
              const result = await updateJob(currentJob.id, { photos: updatedPhotos });
              
              if (result && result.success) {
                setCurrentJob((prev: any) => prev ? { ...prev, photos: updatedPhotos } : prev);
                Alert.alert('Success', 'Photo deleted successfully');
              } else {
                Alert.alert('Error', 'Failed to delete photo');
              }
            } catch (error) {
              console.error('Error deleting photo:', error);
              Alert.alert('Error', 'Failed to delete photo');
            }
          }
        }
      ]
    );
  };

  // Photo viewer handling
  const handlePhotoPress = (photoIndex: number) => {
    setSelectedPhotoIndex(photoIndex);
    setShowPhotoViewer(true);
  };

  const handlePhotoViewerClose = () => {
    setShowPhotoViewer(false);
  };

  const handlePhotoDelete = async (photoId: string) => {
    if (!currentJob) return;

    try {
      const updatedPhotos = currentJob.photos?.filter((photo: any) => photo.id !== photoId) || [];
      const result = await updateJob(currentJob.id, { photos: updatedPhotos });
      
      if (result && result.success) {
        setCurrentJob((prev: any) => prev ? { ...prev, photos: updatedPhotos } : prev);
        Alert.alert('Success', 'Photo deleted successfully');
      } else {
        Alert.alert('Error', 'Failed to delete photo');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      Alert.alert('Error', 'Failed to delete photo');
    }
  };

  // Render functions
  const renderJobDetails = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Job Header */}
      <MaterialCard style={styles.jobHeaderCard}>
        <View style={styles.jobHeader}>
          <IconFallback name="work" size={24} color={theme.primary} />
          <View style={styles.jobHeaderInfo}>
            <Text style={[styles.jobTitle, { color: theme.text }]}>
              {formatJobTitle(currentJob?.title)}
            </Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(currentJob?.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(currentJob?.status) }]}>
                  {currentJob?.status?.toUpperCase() || 'UNKNOWN'}
                </Text>
              </View>
              {currentJob?.urgency && (
                <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(currentJob?.urgency) + '20' }]}>
                  <Text style={[styles.urgencyText, { color: getUrgencyColor(currentJob?.urgency) }]}>
                    {currentJob?.urgency?.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </MaterialCard>

      {/* Job Information */}
      <MaterialCard style={styles.infoCard}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Job Information</Text>
        
        <View style={styles.infoRow}>
          <IconFallback name="attach-money" size={16} color={theme.textSecondary} />
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Total Cost:</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>
            {formatJobCost(currentJob)}
          </Text>
        </View>

        {/* Cost Breakdown - Show when there's additional work */}
        {(() => {
          const costBreakdown = getJobCostBreakdown(currentJob);
          if (costBreakdown.hasAdditionalWork) {
            return (
              <>
                <View style={styles.infoRow}>
                  <IconFallback name="work" size={16} color={theme.textSecondary} />
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Original Cost:</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>
                    ${costBreakdown.originalCost.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <IconFallback name="add" size={16} color={theme.textSecondary} />
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Additional Work:</Text>
                  <Text style={[styles.infoValue, { color: theme.success }]}>
                    +${costBreakdown.additionalWorkAmount.toFixed(2)}
                  </Text>
                </View>
              </>
            );
          }
          return null;
        })()}

        <View style={styles.infoRow}>
          <IconFallback name="schedule" size={16} color={theme.textSecondary} />
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Estimated Time:</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>
            {currentJob?.estimatedTime || currentJob?.estimatedDuration || 'TBD'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <IconFallback name="build" size={16} color={theme.textSecondary} />
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Category:</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>
            {currentJob?.category || 'General'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <IconFallback name="place" size={16} color={theme.textSecondary} />
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Location:</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>
            {currentJob?.location || 'TBD'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <IconFallback name="directions-car" size={16} color={theme.textSecondary} />
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Vehicle:</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>
            {(() => {
              console.log('🚗 JobDetailsModal - Job vehicle data:', {
                jobId: currentJob?.id,
                vehicleId: currentJob?.vehicleId,
                vehicle: currentJob?.vehicle,
                vehiclesCount: vehicles?.length || 0
              });
              
              // Try to resolve vehicle data from both vehicleId and vehicle fields
              let resolved = resolveVehicleData(currentJob?.vehicleId || currentJob?.vehicle);
              console.log('🚗 JobDetailsModal - Resolved vehicle:', resolved);
              
              // If no vehicle found but there are vehicles available, use the first one as fallback
              if (!resolved && vehicles && vehicles.length > 0) {
                console.log('🚗 JobDetailsModal - No vehicle data in job, using first available vehicle as fallback');
                resolved = vehicles[0];
              }
              
              if (resolved) {
                const formatted = formatVehicle(resolved);
                console.log('🚗 JobDetailsModal - Formatted vehicle:', formatted);
                if (formatted) return formatted;
                // Fallback if object lacks formatter-required fields
                const y = (resolved as any)?.year; const mk = (resolved as any)?.make; const md = (resolved as any)?.model;
                if (y || mk || md) return [y, mk, md].filter(Boolean).join(' ');
              }
              // Last resort: check job-level fields
              const jy = (currentJob as any)?.year; const jmk = (currentJob as any)?.make; const jmd = (currentJob as any)?.model;
              if (jy || jmk || jmd) return [jy, jmk, jmd].filter(Boolean).join(' ');
              return 'Not specified';
            })()}
          </Text>
        </View>

        {/* Trim Level */}
        {(() => {
          const resolved = resolveVehicleData(currentJob?.vehicle);
          const trim = resolved?.trim || (currentJob as any)?.trim;
          if (trim) {
            return (
              <View style={styles.infoRow}>
                <IconFallback name="build" size={16} color={theme.textSecondary} />
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Trim Level:</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  {trim}
                </Text>
              </View>
            );
          }
          return null;
        })()}

        {/* Current Mileage */}
        {(() => {
          const resolved = resolveVehicleData(currentJob?.vehicle);
          const mileage = resolved?.mileage || (currentJob as any)?.mileage;
          if (mileage) {
            return (
              <View style={styles.infoRow}>
                <IconFallback name="speed" size={16} color={theme.textSecondary} />
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Current Mileage:</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  {mileage.toLocaleString()} miles
                </Text>
              </View>
            );
          }
          return null;
        })()}

        {currentJob?.description && (
          <View style={styles.descriptionContainer}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Description:</Text>
            <Text style={[styles.descriptionText, { color: theme.text }]}>
              {currentJob.description}
            </Text>
          </View>
        )}
      </MaterialCard>

      {/* Job Timeline */}
      {derivedTimeline && derivedTimeline.length > 0 && (
        <MaterialCard style={styles.timelineCard}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Job Timeline</Text>
          {derivedTimeline.map((entry: any, index: number) => (
            <View key={index} style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: theme.primary }]} />
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineTitle, { color: theme.text }]}>
                  {entry.status || entry.action}
                </Text>
                <Text style={[styles.timelineDescription, { color: theme.textSecondary }]}>
                  {entry.description || entry.details}
                </Text>
                <Text style={[styles.timelineTimestamp, { color: theme.textSecondary }]}>
                  {formatTimestamp(entry.timestamp || entry.createdAt)}
                </Text>
              </View>
            </View>
          ))}
        </MaterialCard>
      )}
    </ScrollView>
  );

  const renderNotes = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Add Note Section */}
      <MaterialCard style={styles.addNoteCard}>
        <View style={styles.addNoteHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Add Note</Text>
          <MaterialButton
            title={isAddingNote ? "Cancel" : "Add Note"}
            onPress={() => setIsAddingNote(!isAddingNote)}
            variant="outlined"
            size="small"
          />
        </View>
        
        {isAddingNote && (
          <View style={styles.addNoteForm}>
            <MaterialTextInput
              label="Note"
              value={newNote}
              onChangeText={setNewNote}
              multiline
              numberOfLines={3}
              placeholder="Add a note about this job..."
            />
            <MaterialButton
              title="Save Note"
              onPress={handleAddNote}
              disabled={!newNote.trim()}
            />
          </View>
        )}
      </MaterialCard>

      {/* Notes List */}
      <MaterialCard style={styles.notesCard}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Job Notes</Text>
        {currentJob?.notes && currentJob.notes.length > 0 ? (
          currentJob.notes.map((note: JobNote, index: number) => (
            <View key={index} style={[styles.noteItem, { borderLeftColor: note.authorType === 'mechanic' ? theme.primary : theme.success }]}>
              <View style={styles.noteHeader}>
                <Text style={[styles.noteAuthor, { color: theme.text }]}>
                  {note.author} ({note.authorType})
                </Text>
                <Text style={[styles.noteTimestamp, { color: theme.textSecondary }]}>
                  {formatTimestamp(note.timestamp)}
                </Text>
              </View>
              <Text style={[styles.noteText, { color: theme.text }]}>
                {note.text}
              </Text>
            </View>
          ))
        ) : (
          <Text style={[styles.emptyState, { color: theme.textSecondary }]}>
            No notes added yet
          </Text>
        )}
      </MaterialCard>
    </ScrollView>
  );

  const renderPhotos = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Add Photo Section */}
      <MaterialCard style={styles.addPhotoCard}>
        <View style={styles.addPhotoHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Add Photo</Text>
          <MaterialButton
            title={isUploadingPhoto ? "Uploading..." : "Add Photo"}
            onPress={handleAddPhoto}
            variant="outlined"
            size="small"
            icon={isUploadingPhoto ? "loader" : "photo-camera"}
            disabled={isUploadingPhoto}
          />
        </View>
        
        {/* Photo Caption Input */}
        <View style={styles.photoCaptionContainer}>
          <MaterialTextInput
            label="Photo Caption (Optional)"
            value={newPhotoCaption}
            onChangeText={setNewPhotoCaption}
            placeholder="Add a caption for your photo..."
            multiline
            numberOfLines={2}
          />
        </View>
      </MaterialCard>

      {/* Photos - Separate rows for Mechanic and Customer uploads */}
      <MaterialCard style={styles.photosCard}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Job Photos</Text>
        {currentJob?.photos && currentJob.photos.length > 0 ? (
          <>
            {/* Mechanic Photos Row */}
            {currentJob.photos.filter((p: any) => p.authorType === 'mechanic').length > 0 && (
              <View style={styles.photoRowSection}>
                <Text style={[styles.photoRowTitle, { color: theme.textSecondary }]}>Mechanic Uploads</Text>
                <FlatList
                  data={currentJob.photos.filter((p: any) => p.authorType === 'mechanic')}
                  keyExtractor={(item: any, idx: number) => item.id || `mech-${idx}`}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  scrollEnabled={true}
                  contentContainerStyle={styles.photoRowContent}
                  renderItem={({ item, index }) => (
                    <View style={styles.photoRowItem}>
                      <View style={styles.photoContainer}>
                        <TouchableOpacity
                          onPress={() => handlePhotoPress(index)}
                          activeOpacity={0.8}
                        >
                          <Image source={{ uri: item.uri }} style={styles.photoRowImage} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.deletePhotoButton, { backgroundColor: theme.error + '20' }]}
                          onPress={() => deletePhoto(item.id)}
                        >
                          <IconFallback name="close" size={16} color={theme.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                />
              </View>
            )}

            {/* Customer Photos Row */}
            {currentJob.photos.filter((p: any) => p.authorType === 'customer').length > 0 && (
              <View style={styles.photoRowSection}>
                <Text style={[styles.photoRowTitle, { color: theme.textSecondary }]}>Customer Uploads</Text>
                <FlatList
                  data={currentJob.photos.filter((p: any) => p.authorType === 'customer')}
                  keyExtractor={(item: any, idx: number) => item.id || `cust-${idx}`}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  scrollEnabled={true}
                  contentContainerStyle={styles.photoRowContent}
                  renderItem={({ item, index }) => (
                    <View style={styles.photoRowItem}>
                      <View style={styles.photoContainer}>
                        <TouchableOpacity
                          onPress={() => handlePhotoPress(index)}
                          activeOpacity={0.8}
                        >
                          <Image source={{ uri: item.uri }} style={styles.photoRowImage} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.deletePhotoButton, { backgroundColor: theme.error + '20' }]}
                          onPress={() => deletePhoto(item.id)}
                        >
                          <IconFallback name="close" size={16} color={theme.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                />
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyPhotosState}>
            <IconFallback name="photo-camera" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyState, { color: theme.textSecondary }]}>
              No photos added yet
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.textSecondary }]}>
              Add photos to document the job progress
            </Text>
          </View>
        )}
      </MaterialCard>
    </ScrollView>
  );

  if (!visible || !currentJob) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          style={styles.overlayTouchable} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <Animated.View 
          style={[
            styles.modalContainer, 
            { 
              backgroundColor: theme.background,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.divider }]}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconFallback name="close" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.text }]}>Job Details</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Tab Navigation */}
          <View style={[styles.tabNavigation, { borderBottomColor: theme.divider }]}>
            <TouchableOpacity
              style={[styles.tabButton, { borderBottomColor: activeTab === 'details' ? theme.primary : 'transparent' }]}
              onPress={() => setActiveTab('details')}
            >
              <Text style={[styles.tabText, { color: activeTab === 'details' ? theme.primary : theme.textSecondary }]}>
                Details
              </Text>
            </TouchableOpacity>
            {(userType !== 'mechanic' || canMechanicAccessTabs) && (
              <TouchableOpacity
                style={[styles.tabButton, { borderBottomColor: activeTab === 'notes' ? theme.primary : 'transparent' }]}
                onPress={() => setActiveTab('notes')}
              >
                <Text style={[styles.tabText, { color: activeTab === 'notes' ? theme.primary : theme.textSecondary }]}>
                  Notes
                </Text>
              </TouchableOpacity>
            )}
            {(userType !== 'mechanic' || canMechanicAccessTabs) && (
              <TouchableOpacity
                style={[styles.tabButton, { borderBottomColor: activeTab === 'photos' ? theme.primary : 'transparent' }]}
                onPress={() => setActiveTab('photos')}
              >
                <Text style={[styles.tabText, { color: activeTab === 'photos' ? theme.primary : theme.textSecondary }]}>
                  Photos
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Tab Content */}
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.content}
          >
            {activeTab === 'details' && renderJobDetails()}
            {(userType !== 'mechanic' || canMechanicAccessTabs) && activeTab === 'notes' && renderNotes()}
            {(userType !== 'mechanic' || canMechanicAccessTabs) && activeTab === 'photos' && renderPhotos()}
          </KeyboardAvoidingView>
        </Animated.View>
      </Animated.View>

      {/* Photo Viewer Modal */}
      <PhotoViewerModal
        visible={showPhotoViewer}
        onClose={handlePhotoViewerClose}
        photos={currentJob?.photos || []}
        initialIndex={selectedPhotoIndex}
        onDeletePhoto={handlePhotoDelete}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '90%',
    minHeight: '75%',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  placeholder: {
    width: 40,
  },
  tabNavigation: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  jobHeaderCard: {
    marginBottom: 16,
    padding: 16,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  urgencyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    minWidth: 100,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
  },
  descriptionContainer: {
    marginTop: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  timelineCard: {
    marginBottom: 16,
    padding: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  timelineTimestamp: {
    fontSize: 12,
  },
  addNoteCard: {
    marginBottom: 16,
    padding: 16,
  },
  addNoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addNoteForm: {
    gap: 12,
  },
  notesCard: {
    marginBottom: 16,
    padding: 16,
  },
  noteItem: {
    paddingLeft: 12,
    borderLeftWidth: 3,
    marginBottom: 16,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  noteAuthor: {
    fontSize: 14,
    fontWeight: '600',
  },
  noteTimestamp: {
    fontSize: 12,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
  },
  addPhotoCard: {
    marginBottom: 16,
    padding: 16,
  },
  addPhotoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  photoCaptionContainer: {
    marginTop: 8,
  },
  photosCard: {
    marginBottom: 16,
    padding: 16,
  },
  photoRowSection: {
    marginBottom: 12,
  },
  photoRowTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  photoRowContent: {
    gap: 8,
  },
  photoRowItem: {
    marginRight: 8,
  },
  photoRowImage: {
    width: 110,
    height: 110,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoItem: {
    width: '31%',
    marginBottom: 12,
  },
  photoContainer: {
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: 90,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  deletePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoInfo: {
    marginTop: 8,
  },
  photoCaption: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  photoAuthor: {
    fontSize: 10,
    marginBottom: 2,
  },
  photoTimestamp: {
    fontSize: 10,
  },
  emptyPhotosState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateSubtext: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  emptyState: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
});
