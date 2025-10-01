import { useState, useCallback } from 'react';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { ImageData, ImageUploadResult, UseImageManagementReturn } from '../types/JobTypes';

interface UseImageManagementProps {
  maxImages?: number;
  maxImageSize?: number; // in MB
  compressionQuality?: number;
  onImageAdd?: (image: ImageData) => void;
  onImageRemove?: (index: number) => void;
  onUploadComplete?: (results: ImageUploadResult[]) => void;
  onUploadSuccess?: (urls: string[]) => void;
  onUploadError?: (error: string) => void;
}

export const useImageManagement = ({
  maxImages = 5, // Default to 5 photos
  maxImageSize = 5, // 5MB
  compressionQuality = 0.7,
  onImageAdd,
  onImageRemove,
  onUploadComplete,
  onUploadSuccess,
  onUploadError,
}: UseImageManagementProps = {}): UseImageManagementReturn => {
  
  const [images, setImages] = useState<ImageData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Compress image
  const compressImage = useCallback(async (uri: string): Promise<string> => {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [
          { resize: { width: 800 } }, // Resize to max width of 800px
        ],
        {
          compress: compressionQuality,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      
      return result.uri;
    } catch (error) {
      console.error('Image compression failed:', error);
      throw new Error('Failed to compress image');
    }
  }, [compressionQuality]);

  // Validate image size
  const validateImageSize = useCallback(async (uri: string): Promise<boolean> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const sizeInMB = blob.size / (1024 * 1024);
      
      return sizeInMB <= maxImageSize;
    } catch (error) {
      console.error('Image size validation failed:', error);
      return false;
    }
  }, [maxImageSize]);

  // Add image from camera
  const addImageFromCamera = useCallback(async (): Promise<void> => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Camera permission denied');
      }

      // Check if we can add more images
      if (images.length >= maxImages) {
        throw new Error(`Maximum ${maxImages} photos allowed. Please remove a photo first.`);
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7, // Balanced quality
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Validate image size
        const isValidSize = await validateImageSize(asset.uri);
        if (!isValidSize) {
          throw new Error(`Photo must be less than ${maxImageSize}MB. Please take a smaller photo.`);
        }

        // Compress image
        const compressedUri = await compressImage(asset.uri);
        
        const imageData: ImageData = {
          uri: compressedUri,
          name: `camera_${Date.now()}.jpg`,
          type: 'image/jpeg',
          size: asset.fileSize || 0,
          compressed: true,
        };

        setImages(prev => {
          if (prev.length >= maxImages) {
            throw new Error(`Maximum ${maxImages} images allowed`);
          }
          const newImages = [...prev, imageData];
          onImageAdd?.(imageData);
          return newImages;
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add image from camera';
      onUploadError?.(errorMessage);
      throw error;
    }
  }, [maxImages, maxImageSize, validateImageSize, compressImage, onImageAdd, onUploadError, images.length]);

  // Add image from gallery
  const addImageFromGallery = useCallback(async (): Promise<void> => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Media library permission denied');
      }

      // Check if we can add more images
      if (images.length >= maxImages) {
        throw new Error(`Maximum ${maxImages} photos allowed. Please remove a photo first.`);
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7, // Balanced quality
        selectionLimit: maxImages - images.length,
      });

      if (!result.canceled && result.assets.length > 0) {
        const newImages: ImageData[] = [];
        
        for (const asset of result.assets) {
          // Validate image size
          const isValidSize = await validateImageSize(asset.uri);
          if (!isValidSize) {
            console.warn(`Skipping image ${asset.fileName}: size exceeds ${maxImageSize}MB limit`);
            continue;
          }

          // Compress image
          const compressedUri = await compressImage(asset.uri);
          
          const imageData: ImageData = {
            uri: compressedUri,
            name: asset.fileName || `gallery_${Date.now()}.jpg`,
            type: asset.type || 'image/jpeg',
            size: asset.fileSize || 0,
            compressed: true,
          };

          newImages.push(imageData);
        }

        if (newImages.length > 0) {
          setImages(prev => {
            const updatedImages = [...prev, ...newImages];
            if (updatedImages.length > maxImages) {
              throw new Error(`Maximum ${maxImages} images allowed`);
            }
            newImages.forEach(img => onImageAdd?.(img));
            return updatedImages;
          });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add images from gallery';
      onUploadError?.(errorMessage);
      throw error;
    }
  }, [maxImages, maxImageSize, images.length, validateImageSize, compressImage, onImageAdd, onUploadError]);

  // Add image (generic function)
  const addImage = useCallback((image: ImageData) => {
    setImages(prev => {
      if (prev.length >= maxImages) {
        throw new Error(`Maximum ${maxImages} images allowed`);
      }
      const newImages = [...prev, image];
      onImageAdd?.(image);
      return newImages;
    });
  }, [maxImages, onImageAdd]);

  // Remove image
  const removeImage = useCallback((index: number) => {
    setImages(prev => {
      if (index < 0 || index >= prev.length) {
        throw new Error('Invalid image index');
      }
      const newImages = prev.filter((_, i) => i !== index);
      onImageRemove?.(index);
      return newImages;
    });
  }, [onImageRemove]);

  // Upload images (simulate upload)
  const uploadImages = useCallback(async (): Promise<ImageUploadResult[]> => {
    if (images.length === 0) {
      return [];
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const results: ImageUploadResult[] = [];
      
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        
        // Simulate upload progress
        setUploadProgress((i / images.length) * 100);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate upload success/failure
        const success = Math.random() > 0.1; // 90% success rate for demo
        
        if (success) {
          results.push({
            success: true,
            url: `https://example.com/uploads/${image.name}`,
          });
        } else {
          results.push({
            success: false,
            error: `Failed to upload ${image.name}`,
          });
        }
      }
      
      setUploadProgress(100);
      onUploadComplete?.(results);
      
      // Call onUploadSuccess with successful URLs
      const successfulUrls = results
        .filter(result => result.success)
        .map(result => result.url);
      
      if (successfulUrls.length > 0) {
        onUploadSuccess?.(successfulUrls);
      }
      
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onUploadError?.(errorMessage);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [images, onUploadComplete, onUploadError, onUploadSuccess]);

  // Clear all images
  const clearImages = useCallback(() => {
    setImages([]);
    setUploadProgress(0);
  }, []);

  // Get image count
  const getImageCount = useCallback(() => {
    return images.length;
  }, [images.length]);

  // Check if can add more images
  const canAddMoreImages = useCallback(() => {
    return images.length < maxImages;
  }, [images.length, maxImages]);

  // Get total size of all images
  const getTotalSize = useCallback(() => {
    return images.reduce((total, image) => total + image.size, 0);
  }, [images]);

  // Get total size in MB
  const getTotalSizeInMB = useCallback(() => {
    return getTotalSize() / (1024 * 1024);
  }, [getTotalSize]);

  return {
    images,
    addImage,
    removeImage,
    addImageFromCamera,
    addImageFromGallery,
    compressImage,
    uploadImages,
    clearImages,
    isUploading,
    uploadProgress,
    getImageCount,
    canAddMoreImages,
    getTotalSize,
    getTotalSizeMB: getTotalSizeInMB,
  };
};

export default useImageManagement;
