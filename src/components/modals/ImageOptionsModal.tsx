import React, { useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal,
  Alert,
  Pressable 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ModalComponentProps } from '../../types/JobTypes';
import { useTheme } from '../../contexts/ThemeContext';
// import { createJobStyles } from '../../styles/CreateJobScreenStyles';
import IconFallback from '../shared/IconFallback';

interface ImageOptionsModalProps extends ModalComponentProps {
  onCameraPress: () => void;
  onGalleryPress: () => void;
  maxImages?: number;
  currentImageCount?: number;
}

const ImageOptionsModal: React.FC<ImageOptionsModalProps> = ({
  visible,
  onClose,
  theme,
  onCameraPress,
  onGalleryPress,
  maxImages = 10,
  currentImageCount = 0,
}) => {
  // const styles = createJobStyles(theme);
  const styles = additionalStyles;

  // Handle camera press
  const handleCameraPress = useCallback(() => {
    onCameraPress();
    onClose();
  }, [onCameraPress, onClose]);

  // Handle gallery press
  const handleGalleryPress = useCallback(() => {
    onGalleryPress();
    onClose();
  }, [onGalleryPress, onClose]);

  // Check if can add more images
  const canAddMore = currentImageCount < maxImages;

  // Get remaining image count
  const remainingCount = maxImages - currentImageCount;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <Pressable 
        style={[styles.modalOverlay, { backgroundColor: theme.background }]}
        onPress={onClose}
      >
        <Pressable 
          style={[styles.modalContainer, { backgroundColor: theme.cardBackground }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Add Photos
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close modal"
            >
              <MaterialIcons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.modalContent}>
            {/* Image Count Info */}
            <View style={styles.imageCountContainer}>
              <Text style={[styles.imageCountText, { color: theme.textSecondary }]}>
                {currentImageCount} of {maxImages} photos added
              </Text>
              {!canAddMore && (
                <Text style={[styles.maxImagesText, { color: theme.warning }]}>
                  Maximum number of photos reached
                </Text>
              )}
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>
              {/* Camera Option */}
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  { borderColor: theme.border },
                  !canAddMore && styles.optionCardDisabled,
                ]}
                onPress={handleCameraPress}
                disabled={!canAddMore}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Take photo with camera"
                accessibilityHint="Opens camera to take a new photo"
                accessibilityState={{ disabled: !canAddMore }}
              >
                <View style={styles.optionContent}>
                  <View style={[styles.optionIconContainer, { backgroundColor: theme.primary + '20' }]}>
                    <IconFallback
                      name="camera-alt"
                      size={32}
                      color={theme.primary}
                    />
                  </View>
                  <View style={styles.optionInfo}>
                    <Text
                      style={[
                        styles.optionTitle,
                        { color: theme.text },
                        !canAddMore && styles.optionTextDisabled,
                      ]}
                    >
                      Take Photo
                    </Text>
                    <Text
                      style={[
                        styles.optionDescription,
                        { color: theme.textSecondary },
                        !canAddMore && styles.optionTextDisabled,
                      ]}
                    >
                      Use camera to take a new photo
                    </Text>
                  </View>
                  <MaterialIcons
                    name="arrow-forward-ios"
                    size={16}
                    color={theme.textSecondary}
                  />
                </View>
              </TouchableOpacity>

              {/* Gallery Option */}
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  { borderColor: theme.border },
                  !canAddMore && styles.optionCardDisabled,
                ]}
                onPress={handleGalleryPress}
                disabled={!canAddMore}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Select photos from gallery"
                accessibilityHint="Opens photo gallery to select existing photos"
                accessibilityState={{ disabled: !canAddMore }}
              >
                <View style={styles.optionContent}>
                  <View style={[styles.optionIconContainer, { backgroundColor: theme.primary + '20' }]}>
                    <IconFallback
                      name="photo-library"
                      size={32}
                      color={theme.primary}
                    />
                  </View>
                  <View style={styles.optionInfo}>
                    <Text
                      style={[
                        styles.optionTitle,
                        { color: theme.text },
                        !canAddMore && styles.optionTextDisabled,
                      ]}
                    >
                      Choose from Gallery
                    </Text>
                    <Text
                      style={[
                        styles.optionDescription,
                        { color: theme.textSecondary },
                        !canAddMore && styles.optionTextDisabled,
                      ]}
                    >
                      Select photos from your gallery
                    </Text>
                  </View>
                  <MaterialIcons
                    name="arrow-forward-ios"
                    size={16}
                    color={theme.textSecondary}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* Tips */}
            <View style={styles.tipsContainer}>
              <Text style={[styles.tipsTitle, { color: theme.primary }]}>
                Photo Tips
              </Text>
              <View style={styles.tipsList}>
                <Text style={[styles.tipItem, { color: theme.textSecondary }]}>
                  • Take clear, well-lit photos
                </Text>
                <Text style={[styles.tipItem, { color: theme.textSecondary }]}>
                  • Include different angles of the issue
                </Text>
                <Text style={[styles.tipItem, { color: theme.textSecondary }]}>
                  • Show the overall area and close-up details
                </Text>
                <Text style={[styles.tipItem, { color: theme.textSecondary }]}>
                  • Include any warning lights or error messages
                </Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.border }]}
              onPress={onClose}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Cancel adding photos"
            >
              <Text style={[styles.cancelButtonText, { color: theme.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// Additional styles for this component
const additionalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    maxWidth: 400,
    width: '100%',
    maxHeight: '80%',
  },
  modalContent: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  closeButton: {
    padding: 4,
  },
  imageCountContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imageCountText: {
    fontSize: 16,
    marginBottom: 4,
  },
  maxImagesText: {
    fontSize: 14,
    fontWeight: '500',
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  optionCardDisabled: {
    opacity: 0.5,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  optionTextDisabled: {
    opacity: 0.5,
  },
  tipsContainer: {
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipsList: {
    marginLeft: 8,
  },
  tipItem: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  modalFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ImageOptionsModal;
