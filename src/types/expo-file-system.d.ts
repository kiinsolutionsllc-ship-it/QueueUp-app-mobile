declare module 'expo-file-system' {
  export const documentDirectory: string;
  export const cacheDirectory: string;
  export const bundleDirectory: string;
  
  export enum EncodingType {
    UTF8 = 'utf8',
    Base64 = 'base64',
  }
  
  export function writeAsStringAsync(
    fileUri: string,
    contents: string,
    options?: {
      encoding?: EncodingType;
    }
  ): Promise<void>;
  
  export function readAsStringAsync(
    fileUri: string,
    options?: {
      encoding?: EncodingType;
    }
  ): Promise<string>;
  
  export function deleteAsync(
    fileUri: string,
    options?: {
      idempotent?: boolean;
    }
  ): Promise<void>;
  
  export function makeDirectoryAsync(
    fileUri: string,
    options?: {
      intermediates?: boolean;
    }
  ): Promise<void>;
  
  export function readDirectoryAsync(fileUri: string): Promise<string[]>;
  
  export function getInfoAsync(
    fileUri: string,
    options?: {
      md5?: boolean;
      size?: boolean;
    }
  ): Promise<{
    exists: boolean;
    uri: string;
    size?: number;
    md5?: string;
    modificationTime?: number;
  }>;
}
