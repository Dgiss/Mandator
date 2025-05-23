
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
      console.log(`File type: ${file.type}`); // Log the file's MIME type
      
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
      
      // Upload the file with explicit content type from the file object
      console.log(`Attempting to upload file to ${bucketName}/${filePath} with MIME type: ${file.type}`);
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type // Explicitly set the content type based on the file's type
        });
      
      if (error) {
        console.error(`Error uploading file ${fileName}: ${error.message}`);
        throw error;
      }
      
      if (!data) {
        throw new Error("Upload returned no data path");
      }
      
      console.log(`File uploaded successfully: ${data.path}`);
      
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
      
      // Check authentication status
      const { data: authData } = await supabase.auth.getSession();
      console.log(`Download authorization check: ${authData.session ? 'User is authenticated' : 'No active session'}`);
      
      // First, get the file metadata to determine its content type
      const { data: fileInfo } = await supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
        
      console.log(`File public URL: ${fileInfo ? fileInfo.publicUrl : 'Not available'}`);
      
      // Now download the file with proper content type
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
      
      console.log(`File downloaded successfully, size: ${data.size} bytes, type: ${data.type}`);
      
      // If the blob doesn't have the correct type (often generic "application/octet-stream"),
      // we create a new one with the right type based on the file extension
      if (data.type === 'application/octet-stream' || data.type === 'application/json') {
        const fileExtension = filePath.split('.').pop()?.toLowerCase() || '';
        let mimeType = data.type;
        
        // Map common file extensions to proper MIME types
        switch (fileExtension) {
          case 'pdf': mimeType = 'application/pdf'; break;
          case 'jpg':
          case 'jpeg': mimeType = 'image/jpeg'; break;
          case 'png': mimeType = 'image/png'; break;
          case 'gif': mimeType = 'image/gif'; break;
          case 'doc': mimeType = 'application/msword'; break;
          case 'docx': mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'; break;
          case 'xls': mimeType = 'application/vnd.ms-excel'; break;
          case 'xlsx': mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'; break;
          case 'ppt': mimeType = 'application/vnd.ms-powerpoint'; break;
          case 'pptx': mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'; break;
          case 'txt': mimeType = 'text/plain'; break;
          // Add more file types as needed
        }
        
        console.log(`Correcting file MIME type from ${data.type} to ${mimeType} based on extension .${fileExtension}`);
        
        // Create a new blob with the correct MIME type
        return new Blob([data], { type: mimeType });
      }
      
      return data;
    } catch (error: any) {
      console.error(`Error in downloadFile: ${error.message || JSON.stringify(error)}`);
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
