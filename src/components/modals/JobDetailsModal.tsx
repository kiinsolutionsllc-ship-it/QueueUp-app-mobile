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
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useJob } from '../../contexts/SimplifiedJobContext';
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
      const result = await updateJob(currentJob.id, { notes: updatedNotes });
      
      if (result && result.success) {
        setCurrentJob(prev => prev ? { ...prev, notes: updatedNotes } : prev);
        setNewNote('');
        setIsAddingNote(false);
        Alert.alert('Success', 'Note added successfully');
      } else {
        Alert.alert('Error', 'Failed to add note');
      }
    } catch (error) {
      console.error('Error adding note:', error);
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
        setCurrentJob(prev => prev ? { ...prev, photos: updatedPhotos } : prev);
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
              const updatedPhotos = currentJob.photos?.filter(photo => photo.id !== photoId) || [];
              const result = await updateJob(currentJob.id, { photos: updatedPhotos });
              
              if (result && result.success) {
                setCurrentJob(prev => prev ? { ...prev, photos: updatedPhotos } : prev);
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
      const updatedPhotos = currentJob.photos?.filter(photo => photo.id !== photoId) || [];
      const result = await updateJob(currentJob.id, { photos: updatedPhotos });
      
      if (result && result.success) {
        setCurrentJob(prev => prev ? { ...prev, photos: updatedPhotos } : prev);
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
            {currentJob?.vehicle ? formatVehicle(currentJob.vehicle) : 'Not specified'}
          </Text>
        </View>

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
      {currentJob?.progressionTimeline && currentJob.progressionTimeline.length > 0 && (
        <MaterialCard style={styles.timelineCard}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Job Timeline</Text>
          {currentJob.progressionTimeline.map((entry: any, index: number) => (
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

      {/* Photos Grid */}
      <MaterialCard style={styles.photosCard}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Job Photos</Text>
        {currentJob?.photos && currentJob.photos.length > 0 ? (
          <View style={styles.photosGrid}>
            {currentJob.photos.map((photo: JobPhoto, index: number) => (
              <View key={photo.id || index} style={styles.photoItem}>
                <View style={styles.photoContainer}>
                  <TouchableOpacity
                    onPress={() => handlePhotoPress(index)}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.deletePhotoButton, { backgroundColor: theme.error + '20' }]}
                    onPress={() => deletePhoto(photo.id)}
                  >
                    <IconFallback name="close" size={16} color={theme.error} />
                  </TouchableOpacity>
                </View>
                <View style={styles.photoInfo}>
                  <Text style={[styles.photoCaption, { color: theme.text }]} numberOfLines={2}>
                    {photo.caption || 'No caption'}
                  </Text>
                  <Text style={[styles.photoAuthor, { color: theme.textSecondary }]}>
                    {photo.author} ({photo.authorType})
                  </Text>
                  <Text style={[styles.photoTimestamp, { color: theme.textSecondary }]}>
                    {formatTimestamp(photo.timestamp)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
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
            <TouchableOpacity
              style={[styles.tabButton, { borderBottomColor: activeTab === 'notes' ? theme.primary : 'transparent' }]}
              onPress={() => setActiveTab('notes')}
            >
              <Text style={[styles.tabText, { color: activeTab === 'notes' ? theme.primary : theme.textSecondary }]}>
                Notes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, { borderBottomColor: activeTab === 'photos' ? theme.primary : 'transparent' }]}
              onPress={() => setActiveTab('photos')}
            >
              <Text style={[styles.tabText, { color: activeTab === 'photos' ? theme.primary : theme.textSecondary }]}>
                Photos
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.content}
          >
            {activeTab === 'details' && renderJobDetails()}
            {activeTab === 'notes' && renderNotes()}
            {activeTab === 'photos' && renderPhotos()}
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
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoItem: {
    width: '48%',
    marginBottom: 16,
  },
  photoContainer: {
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: 120,
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
