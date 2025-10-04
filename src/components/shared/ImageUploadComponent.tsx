import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
import { useJobImageUpload, useVehicleImageUpload, useProfileImageUpload } from '../../hooks/useImageUpload';
import { ImageData } from '../../types/JobTypes';

interface ImageUploadComponentProps {
  type: 'job' | 'vehicle' | 'profile';
  jobId?: string;
  vehicleId?: string;
  userId: string;
  onImagesUploaded?: (urls: string[]) => void;
  onUploadError?: (error: string) => void;
  maxImages?: number;
  existingImages?: string[];
}

export const ImageUploadComponent: React.FC<ImageUploadComponentProps> = ({
  type,
  jobId,
  vehicleId,
  userId,
  onImagesUploaded,
  onUploadError,
  maxImages = 5,
  existingImages = [],
}) => {
  const [uploadedUrls, setUploadedUrls] = useState<string[]>(existingImages);

  // Choose the appropriate hook based on type
  const getImageUploadHook = () => {
    switch (type) {
      case 'job':
        if (!jobId) throw new Error('Job ID is required for job images');
        return useJobImageUpload(jobId, userId);
      case 'vehicle':
        if (!vehicleId) throw new Error('Vehicle ID is required for vehicle images');
        return useVehicleImageUpload(vehicleId, userId);
      case 'profile':
        return useProfileImageUpload(userId);
      default:
        throw new Error('Invalid image type');
    }
  };

  const {
    images,
    addImageFromCamera,
    addImageFromGallery,
    removeImage,
    uploadImages,
    isUploading,
    uploadProgress,
    canAddMoreImages,
    getImageCount,
  } = getImageUploadHook();

  const handleImageAdd = (image: ImageData) => {
    console.log('Image added:', image.name);
  };

  const handleImageRemove = (index: number) => {
    console.log('Image removed at index:', index);
  };

  const handleUploadSuccess = (urls: string[]) => {
    console.log('Images uploaded successfully:', urls);
    setUploadedUrls(prev => [...prev, ...urls]);
    onImagesUploaded?.(urls);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    Alert.alert('Upload Error', error);
    onUploadError?.(error);
  };

  const handleUpload = async () => {
    try {
      const results = await uploadImages();
      const successfulUrls = results
        .filter(result => result.success && result.url)
        .map(result => result.url!);
      
      if (successfulUrls.length > 0) {
        handleUploadSuccess(successfulUrls);
      }
    } catch (error) {
      handleUploadError(error instanceof Error ? error.message : 'Upload failed');
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    try {
      // Remove from local state
      setUploadedUrls(prev => prev.filter(url => url !== imageUrl));
      
      // TODO: Implement delete from storage
      console.log('Image deleted:', imageUrl);
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Delete Error', 'Failed to delete image');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {type === 'job' && 'Job Images'}
        {type === 'vehicle' && 'Vehicle Photos'}
        {type === 'profile' && 'Profile Photo'}
      </Text>
      
      <Text style={styles.subtitle}>
        {getImageCount()}/{maxImages} images selected
      </Text>

      {/* Image Grid */}
      <View style={styles.imageGrid}>
        {images.map((image, index) => (
          <View key={index} style={styles.imageItem}>
            <Image source={{ uri: image.uri }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeImage(index)}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
        
        {canAddMoreImages() && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={addImageFromGallery}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cameraButton]}
          onPress={addImageFromCamera}
          disabled={!canAddMoreImages()}
        >
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.galleryButton]}
          onPress={addImageFromGallery}
          disabled={!canAddMoreImages()}
        >
          <Text style={styles.buttonText}>Choose from Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Upload Button */}
      {images.length > 0 && (
        <TouchableOpacity
          style={[styles.button, styles.uploadButton, isUploading && styles.uploadingButton]}
          onPress={handleUpload}
          disabled={isUploading}
        >
          <Text style={styles.buttonText}>
            {isUploading ? `Uploading... ${Math.round(uploadProgress)}%` : 'Upload Images'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Uploaded Images Display */}
      {uploadedUrls.length > 0 && (
        <View style={styles.uploadedContainer}>
          <Text style={styles.uploadedTitle}>Uploaded Images:</Text>
          <View style={styles.uploadedGrid}>
            {uploadedUrls.map((url, index) => (
              <View key={index} style={styles.uploadedItem}>
                <Image source={{ uri: url }} style={styles.uploadedImage} />
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteImage(url)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  imageItem: {
    position: 'relative',
    margin: 4,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 24,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cameraButton: {
    backgroundColor: '#007AFF',
  },
  galleryButton: {
    backgroundColor: '#34C759',
  },
  uploadButton: {
    backgroundColor: '#FF9500',
    marginTop: 8,
  },
  uploadingButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  uploadedContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  uploadedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  uploadedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  uploadedItem: {
    margin: 4,
    alignItems: 'center',
  },
  uploadedImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 4,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
  },
});

export default ImageUploadComponent;
