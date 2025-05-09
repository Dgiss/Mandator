
import { supabase } from '@/lib/supabase';

export async function ensureStorageBucketExists() {
  try {
    // Check if the documents bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    
    if (!buckets?.find(bucket => bucket.name === 'documents')) {
      // Create the documents bucket if it doesn't exist
      const { error } = await supabase.storage.createBucket('documents', {
        public: false, // Set to true if you want files to be publicly accessible
        fileSizeLimit: 10485760 // 10MB limit
      });
      
      if (error) {
        console.error("Error creating documents bucket:", error);
      } else {
        console.log("Documents bucket created successfully");
      }
    }
    
    if (!buckets?.find(bucket => bucket.name === 'fascicule-attachments')) {
      // Create the fascicule-attachments bucket if it doesn't exist
      const { error } = await supabase.storage.createBucket('fascicule-attachments', {
        public: false, // Set to false for security, files are accessed via signed URLs
        fileSizeLimit: 20971520 // 20MB limit
      });
      
      if (error) {
        console.error("Error creating fascicule-attachments bucket:", error);
      } else {
        console.log("Fascicule-attachments bucket created successfully");
      }
    }
  } catch (error) {
    console.error("Error in storage setup:", error);
  }
}

// Utility function to check bucket existence and create if needed
export async function checkBucket(name: string) {
  try {
    const { data } = await supabase.storage.listBuckets();
    if (!data || !data.some(b => b.name === name)) {
      await supabase.storage.createBucket(name, {
        public: false,
        fileSizeLimit: 20971520 // 20MB
      });
    }
    return true;
  } catch (error) {
    // Ignore errors that might occur if the bucket already exists
    console.error(`Error checking/creating bucket ${name}:`, error);
    return false;
  }
}

// Utility function to sanitize file names
export const sanitizeFileName = (name: string) => name
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9.]/g, '-');
