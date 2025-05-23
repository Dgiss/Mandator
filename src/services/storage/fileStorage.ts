
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
      const bucketExists = buckets && buckets.some(b => b.name === bucketName);
      
      if (!bucketExists) {
        console.log(`Bucket ${bucketName} doesn't exist, creating...`);
        try {
          const { error } = await supabase.storage.createBucket(bucketName, {
            public: isPublic,
            fileSizeLimit: 52428800 // 50MB limit
          });
          
          if (error) {
            // If the error is not "resource already exists", it's a real error
            if (!error.message.includes('already exists')) {
              console.error(`Error creating bucket ${bucketName}: ${error.message}`);
              return false;
            } else {
              // The bucket exists despite not being in our list - this is fine
              console.log(`Bucket ${bucketName} already exists (concurrent creation detected)`);
            }
          } else {
            console.log(`Bucket ${bucketName} created successfully`);
          }
        } catch (createError: any) {
          // Another special case for "already exists" error thrown as exception
          if (createError.message && !createError.message.includes('already exists')) {
            console.error(`Exception creating bucket ${bucketName}: ${createError.message}`);
            return false;
          } else {
            console.log(`Bucket ${bucketName} already exists (exception handled)`);
          }
        }
      } else {
        console.log(`Bucket ${bucketName} already exists in bucket listing`);
      }
      
      // Verify permissions on the bucket
      try {
        const authData = await supabase.auth.getSession();
        console.log(`Current auth status: ${authData.data.session ? 'Authenticated' : 'Not authenticated'}`);
        
        // Try a simple list operation to verify access
        const { error: testError } = await supabase.storage
          .from(bucketName)
          .list('', { limit: 1 });
        
        if (testError) {
          console.warn(`Access test to bucket ${bucketName} failed: ${testError.message}`);
          // Don't fail here, the user might have read but not list permissions
        } else {
          console.log(`Successfully verified access to bucket ${bucketName}`);
        }
      } catch (testError: any) {
        console.warn(`Error testing bucket access: ${testError.message}`);
        // Continue anyway as we might still be able to upload/download
      }
      
      return true;
    } catch (error: any) {
      console.error(`Unexpected error ensuring bucket exists: ${error.message || error}`);
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
      console.log(`Starting uploadFile for ${file.name} (${file.size} bytes) to ${bucketName}/${prefix}`);
      
      // Determine content type based on the file's MIME type or extension
      let contentType = file.type;
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      
      // If browser provides a generic content type or none, determine it from extension
      if (!contentType || contentType === 'application/octet-stream') {
        contentType = this.getMimeTypeFromExtension(fileExtension);
      }
      
      console.log(`File MIME type: ${contentType} (extension: .${fileExtension})`);
      
      // Ensure bucket exists before uploading
      const bucketReady = await this.ensureBucketExists(bucketName, true);
      if (!bucketReady) {
        console.error(`Cannot proceed with upload - bucket ${bucketName} not accessible`);
        throw new Error(`Impossible de créer ou d'accéder au bucket '${bucketName}'`);
      }
      
      // Generate a unique file name
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name.replace(/\s+/g, '_')}`;
      const filePath = `${prefix}/${fileName}`;
      
      // Check authentication status
      const { data: authData } = await supabase.auth.getSession();
      console.log(`Upload authorization check: ${authData.session ? 'User is authenticated' : 'No active session'}`);
      
      // Upload the file with explicit content type
      console.log(`Attempting to upload file to ${bucketName}/${filePath} with MIME type: ${contentType}`);
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: contentType // Explicitly set the content type
        });
      
      if (error) {
        console.error(`Error uploading file ${fileName}: ${error.message}`);
        throw error;
      }
      
      if (!data) {
        throw new Error("Upload returned no data path");
      }
      
      console.log(`File uploaded successfully: ${data.path}`);
      
      // Verify that the uploaded file has the correct MIME type
      console.log(`Verifying uploaded file MIME type...`);
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);
      
      console.log(`Generated public URL: ${urlData.publicUrl}`);
      
      return { 
        path: data.path, 
        url: urlData.publicUrl 
      };
    } catch (error: any) {
      console.error(`Error in uploadFile: ${error.message || JSON.stringify(error)}`);
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
      
      // Verify bucket exists
      await this.ensureBucketExists(bucketName, true);
      
      // Determine the correct MIME type based on file extension
      const fileExtension = filePath.split('.').pop()?.toLowerCase() || '';
      const correctMimeType = this.getMimeTypeFromExtension(fileExtension);
      console.log(`File extension: .${fileExtension}, Correct MIME type: ${correctMimeType}`);
      
      // Download the file
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
      
      console.log(`File downloaded successfully, size: ${data.size} bytes, original type: ${data.type}`);
      
      // IMPORTANT: Always create a new blob with the correct MIME type regardless of what Supabase returned
      // This is critical because Supabase may incorrectly store files with application/json MIME type
      const correctedBlob = new Blob([data], { type: correctMimeType });
      console.log(`Created new blob with corrected MIME type: ${correctMimeType}`);
      
      return correctedBlob;
    } catch (error: any) {
      console.error(`Error in downloadFile: ${error.message || JSON.stringify(error)}`);
      return null;
    }
  },
  
  /**
   * Get the MIME type based on file extension
   * @param fileExtension File extension without dot
   * @returns Appropriate MIME type
   */
  getMimeTypeFromExtension(fileExtension: string): string {
    switch (fileExtension.toLowerCase()) {
      case 'pdf': return 'application/pdf';
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'png': return 'image/png';
      case 'gif': return 'image/gif';
      case 'svg': return 'image/svg+xml';
      case 'doc': return 'application/msword';
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'xls': return 'application/vnd.ms-excel';
      case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'ppt': return 'application/vnd.ms-powerpoint';
      case 'pptx': return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      case 'txt': return 'text/plain';
      case 'csv': return 'text/csv';
      case 'json': return 'application/json';
      case 'xml': return 'application/xml';
      case 'zip': return 'application/zip';
      case 'rar': return 'application/x-rar-compressed';
      case '7z': return 'application/x-7z-compressed';
      case 'mp4': return 'video/mp4';
      case 'mp3': return 'audio/mpeg';
      case 'wav': return 'audio/wav';
      default: return 'application/octet-stream';
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
      
      console.log(`Checking if file exists: ${bucketName}/${filePath}`);
      
      // First ensure the bucket exists
      await this.ensureBucketExists(bucketName, true);
      
      // Extract folder path and filename
      const pathParts = filePath.split('/');
      const filename = pathParts.pop() || '';
      const folderPath = pathParts.join('/');
      
      // Get information about the path
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(folderPath, {
          limit: 100,
          search: filename
        });
      
      if (error) {
        console.error(`Error checking if file exists: ${error.message}`);
        return false;
      }
      
      const exists = data && data.length > 0 && data.some(item => 
        item.name === filename || 
        `${folderPath}/${item.name}` === filePath
      );
      
      console.log(`File ${bucketName}/${filePath} exists: ${exists}`);
      return exists;
    } catch (error: any) {
      console.error(`Error in fileExists: ${error.message || JSON.stringify(error)}`);
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
    } catch (error: any) {
      console.error(`Error getting public URL: ${error.message || JSON.stringify(error)}`);
      return null;
    }
  }
};
