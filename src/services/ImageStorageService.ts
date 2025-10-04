import { supabase } from '../config/supabase';
import * as FileSystem from 'expo-file-system';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
  path?: string;
}

export interface ImageUploadOptions {
  bucket: 'job-images' | 'vehicle-photos' | 'profile-avatars' | 'support-attachments' | 'message-attachments';
  folder: string; // e.g., 'user-id' or 'user-id/job-id'
  fileName?: string;
  compress?: boolean;
  maxWidth?: number;
  quality?: number;
}

export interface ImageDeleteOptions {
  bucket: string;
  path: string;
}

export class ImageStorageService {
  private static instance: ImageStorageService;
  
  public static getInstance(): ImageStorageService {
    if (!ImageStorageService.instance) {
      ImageStorageService.instance = new ImageStorageService();
    }
    return ImageStorageService.instance;
  }

  /**
   * Upload an image to Supabase Storage
   */
  async uploadImage(
    imageUri: string, 
    options: ImageUploadOptions
  ): Promise<ImageUploadResult> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not configured');
      }

      // Generate unique filename if not provided
      const fileName = options.fileName || this.generateFileName(imageUri);
      const filePath = `${options.folder}/${fileName}`;

      // Read file as blob
      const fileBlob = await this.readFileAsBlob(imageUri);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(options.bucket)
        .upload(filePath, fileBlob, {
          contentType: this.getMimeType(imageUri),
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        return {
          success: false,
          error: error.message
        };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(filePath);

      return {
        success: true,
        url: urlData.publicUrl,
        path: filePath
      };

    } catch (error) {
      console.error('Image upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Upload multiple images
   */
  async uploadImages(
    imageUris: string[], 
    options: ImageUploadOptions
  ): Promise<ImageUploadResult[]> {
    const results: ImageUploadResult[] = [];
    
    for (const imageUri of imageUris) {
      const result = await this.uploadImage(imageUri, {
        ...options,
        fileName: this.generateFileName(imageUri)
      });
      results.push(result);
    }

    return results;
  }

  /**
   * Delete an image from storage
   */
  async deleteImage(options: ImageDeleteOptions): Promise<{ success: boolean; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not configured');
      }

      const { error } = await supabase.storage
        .from(options.bucket)
        .remove([options.path]);

      if (error) {
        console.error('Storage delete error:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return { success: true };

    } catch (error) {
      console.error('Image delete error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
      };
    }
  }

  /**
   * Delete multiple images
   */
  async deleteImages(paths: string[], bucket: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not configured');
      }

      const { error } = await supabase.storage
        .from(bucket)
        .remove(paths);

      if (error) {
        console.error('Storage delete error:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return { success: true };

    } catch (error) {
      console.error('Images delete error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
      };
    }
  }

  /**
   * Get signed URL for private images
   */
  async getSignedUrl(bucket: string, path: string, expiresIn: number = 3600): Promise<string | null> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not configured');
      }

      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) {
        console.error('Signed URL error:', error);
        return null;
      }

      return data.signedUrl;

    } catch (error) {
      console.error('Get signed URL error:', error);
      return null;
    }
  }

  /**
   * Get public URL for an image
   */
  getPublicUrl(bucket: string, path: string): string {
    if (!supabase) {
      throw new Error('Supabase client not configured');
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  /**
   * List images in a folder
   */
  async listImages(bucket: string, folder: string): Promise<{ name: string; url: string }[]> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not configured');
      }

      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder);

      if (error) {
        console.error('List images error:', error);
        return [];
      }

      return data.map(file => ({
        name: file.name,
        url: this.getPublicUrl(bucket, `${folder}/${file.name}`)
      }));

    } catch (error) {
      console.error('List images error:', error);
      return [];
    }
  }

  /**
   * Helper: Read file as blob
   */
  private async readFileAsBlob(uri: string): Promise<Blob> {
    const response = await fetch(uri);
    return await response.blob();
  }

  /**
   * Helper: Generate unique filename
   */
  private generateFileName(uri: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = this.getFileExtension(uri);
    return `${timestamp}_${random}${extension}`;
  }

  /**
   * Helper: Get file extension
   */
  private getFileExtension(uri: string): string {
    const match = uri.match(/\.([a-zA-Z0-9]+)$/);
    return match ? `.${match[1]}` : '.jpg';
  }

  /**
   * Helper: Get MIME type
   */
  private getMimeType(uri: string): string {
    const extension = this.getFileExtension(uri).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp'
    };
    return mimeTypes[extension] || 'image/jpeg';
  }

  /**
   * Helper: Extract path from URL
   */
  extractPathFromUrl(url: string, bucket: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const bucketIndex = pathParts.findIndex(part => part === bucket);
      
      if (bucketIndex === -1 || bucketIndex === pathParts.length - 1) {
        return null;
      }

      return pathParts.slice(bucketIndex + 1).join('/');
    } catch (error) {
      console.error('Extract path error:', error);
      return null;
    }
  }
}

// Export singleton instance
export const imageStorageService = ImageStorageService.getInstance();
