import { useCallback } from 'react';
import { imageStorageService, ImageUploadOptions } from '../services/ImageStorageService';
import { useImageManagement } from './useImageManagement';

export interface UseImageUploadProps {
  bucket: 'job-images' | 'vehicle-photos' | 'profile-avatars' | 'support-attachments' | 'message-attachments';
  folder: string;
  maxImages?: number;
  maxImageSize?: number;
  compressionQuality?: number;
  onUploadSuccess?: (urls: string[]) => void;
  onUploadError?: (error: string) => void;
}

export const useImageUpload = ({
  bucket,
  folder,
  maxImages = 5,
  maxImageSize = 5,
  compressionQuality = 0.7,
  onUploadSuccess,
  onUploadError,
}: UseImageUploadProps) => {
  
  const uploadOptions: ImageUploadOptions = {
    bucket,
    folder,
    compress: true,
    maxWidth: 800,
    quality: compressionQuality,
  };

  const imageManagement = useImageManagement({
    maxImages,
    maxImageSize,
    compressionQuality,
    uploadOptions,
    onUploadSuccess,
    onUploadError,
  });

  // Upload single image
  const uploadSingleImage = useCallback(async (imageUri: string, fileName?: string) => {
    try {
      const result = await imageStorageService.uploadImage(imageUri, {
        ...uploadOptions,
        fileName,
      });
      
      if (result.success && result.url) {
        onUploadSuccess?.([result.url]);
        return result;
      } else {
        onUploadError?.(result.error || 'Upload failed');
        return result;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onUploadError?.(errorMessage);
      throw error;
    }
  }, [uploadOptions, onUploadSuccess, onUploadError]);

  // Delete image
  const deleteImage = useCallback(async (imageUrl: string) => {
    try {
      const path = imageStorageService.extractPathFromUrl(imageUrl, bucket);
      if (!path) {
        throw new Error('Invalid image URL');
      }

      const result = await imageStorageService.deleteImage({
        bucket,
        path,
      });

      if (!result.success) {
        throw new Error(result.error || 'Delete failed');
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Delete failed';
      onUploadError?.(errorMessage);
      throw error;
    }
  }, [bucket, onUploadError]);

  // Get signed URL for private images
  const getSignedUrl = useCallback(async (imageUrl: string, expiresIn: number = 3600) => {
    try {
      const path = imageStorageService.extractPathFromUrl(imageUrl, bucket);
      if (!path) {
        throw new Error('Invalid image URL');
      }

      return await imageStorageService.getSignedUrl(bucket, path, expiresIn);
    } catch (error) {
      console.error('Get signed URL error:', error);
      return null;
    }
  }, [bucket]);

  return {
    ...imageManagement,
    uploadSingleImage,
    deleteImage,
    getSignedUrl,
  };
};

// Specialized hooks for different use cases
export const useJobImageUpload = (jobId: string, userId: string) => {
  return useImageUpload({
    bucket: 'job-images',
    folder: `${userId}/${jobId}`,
    maxImages: 10,
    maxImageSize: 5,
  });
};

export const useVehicleImageUpload = (vehicleId: string, userId: string) => {
  return useImageUpload({
    bucket: 'vehicle-photos',
    folder: `${userId}/${vehicleId}`,
    maxImages: 20,
    maxImageSize: 5,
  });
};

export const useProfileImageUpload = (userId: string) => {
  return useImageUpload({
    bucket: 'profile-avatars',
    folder: userId,
    maxImages: 1,
    maxImageSize: 2,
  });
};

export const useSupportImageUpload = (ticketId: string, userId: string) => {
  return useImageUpload({
    bucket: 'support-attachments',
    folder: `${userId}/${ticketId}`,
    maxImages: 5,
    maxImageSize: 10,
  });
};

export const useMessageImageUpload = (conversationId: string, userId: string) => {
  return useImageUpload({
    bucket: 'message-attachments',
    folder: `${userId}/${conversationId}`,
    maxImages: 10,
    maxImageSize: 10,
  });
};
