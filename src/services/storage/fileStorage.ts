
import { supabase } from '@/lib/supabase';

/**
 * Service for managing file storage operations
 */
export const fileStorage = {
  /**
   * Ensures a bucket exists before attempting operations on it
   * @param bucketName Name of the bucket to check/create
   * @param isPublic Whether the bucket should be public
   * @returns Promise that resolves to true if the bucket exists or was created
   */
  async ensureBucketExists(bucketName: string, isPublic: boolean = false): Promise<boolean> {
    try {
      // List all buckets
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error(`Error listing buckets: ${listError.message}`);
        return false;
      }
      
      // Check if bucket already exists
      if (buckets && !buckets.some(b => b.name === bucketName)) {
        console.log(`Bucket ${bucketName} doesn't exist, creating...`);
        const { error } = await supabase.storage.createBucket(bucketName, {
          public: isPublic,
          fileSizeLimit: 52428800 // 50MB limit
        });
        
        if (error) {
          console.error(`Error creating bucket ${bucketName}: ${error.message}`);
          return false;
        }
        console.log(`Bucket ${bucketName} created successfully`);
      } else {
        console.log(`Bucket ${bucketName} already exists`);
      }
      
      return true;
    } catch (error) {
      console.error('Unexpected error ensuring bucket exists:', error);
      return false;
    }
  },
  
  /**
   * Uploads a file to a specified bucket and path
   * @param bucketName Name of the bucket to upload to
   * @param prefix Path prefix to use (folder)
   * @param file The file to upload
   * @returns The path and URL of the uploaded file, or null if failed
   */
  async uploadFile(bucketName: string, prefix: string, file: File): Promise<{ path: string; url: string } | null> {
    try {
      // Generate a unique file name
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name.replace(/\s+/g, '_')}`;
      const filePath = `${prefix}/${fileName}`;
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error(`Error uploading file ${fileName}: ${error.message}`);
        throw error;
      }
      
      if (!data) {
        throw new Error("Upload returned no data path");
      }
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);
      
      return { 
        path: data.path, 
        url: urlData.publicUrl 
      };
    } catch (error: any) {
      console.error(`Error in uploadFile: ${error.message}`);
      return null;
    }
  },
  
  /**
   * Downloads a file with proper error handling and CORS compatibility
   * @param bucketName Name of the bucket containing the file
   * @param filePath Path to the file within the bucket
   * @returns The file data or null if download failed
   */
  async downloadFile(bucketName: string, filePath: string): Promise<Blob | null> {
    try {
      if (!filePath) {
        console.error('Invalid file path: Empty path');
        return null;
      }
      
      console.log(`Attempting to download file: ${bucketName}/${filePath}`);
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(filePath);
      
      if (error) {
        console.error(`Error downloading file: ${error.message}`);
        return null;
      }
      
      if (!data) {
        console.error('Download returned no data');
        return null;
      }
      
      return data;
    } catch (error: any) {
      console.error(`Error in downloadFile: ${error.message}`);
      return null;
    }
  },
  
  /**
   * Checks if a file exists in storage
   * @param bucketName Name of the bucket containing the file
   * @param filePath Path to the file within the bucket
   * @returns Promise resolving to true if file exists, false otherwise
   */
  async fileExists(bucketName: string, filePath: string): Promise<boolean> {
    try {
      if (!filePath) return false;
      
      // Get information about the path
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(filePath.split('/').slice(0, -1).join('/'), {
          limit: 100,
          search: filePath.split('/').pop()
        });
      
      if (error) {
        console.error(`Error checking if file exists: ${error.message}`);
        return false;
      }
      
      return data && data.length > 0;
    } catch (error) {
      console.error(`Error in fileExists: ${error}`);
      return false;
    }
  },
  
  /**
   * Gets the public URL for a file with error handling
   * @param bucketName Name of the bucket containing the file
   * @param filePath Path to the file within the bucket
   * @returns The public URL or null if operation failed
   */
  getPublicUrl(bucketName: string, filePath: string): string | null {
    try {
      if (!filePath) {
        console.error('Invalid file path: Empty path');
        return null;
      }
      
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error(`Error getting public URL: ${error}`);
      return null;
    }
  }
};
