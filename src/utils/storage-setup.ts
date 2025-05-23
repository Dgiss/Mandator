
import { supabase } from '@/lib/supabase';

export async function ensureStorageBucketExists() {
  try {
    // Check if the documents bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    
    const requiredBuckets = [
      'documents',
      'fascicule-attachments',
      'attachments',
      'marches',
      'visas'  // Add visas bucket to the list
    ];
    
    const existingBuckets = buckets?.map(b => b.name) || [];
    
    // Create all required buckets if they don't exist
    for (const bucketName of requiredBuckets) {
      if (!existingBuckets.includes(bucketName)) {
        try {
          console.log(`Creating bucket: ${bucketName}`);
          const { error } = await supabase.storage.createBucket(bucketName, {
            public: bucketName === 'marches' || bucketName === 'visas', // Make marches and visas buckets public
            fileSizeLimit: 20971520 // 20MB limit
          });
          
          if (error && !error.message.includes("already exists")) {
            console.error(`Error creating ${bucketName} bucket:`, error);
          } else {
            console.log(`${bucketName} bucket created successfully or already exists`);
          }
        } catch (bucketError) {
          // Ignore errors that might occur if the bucket already exists
          console.log(`Bucket operation attempted for ${bucketName}:`, bucketError);
        }
      } else {
        console.log(`Bucket ${bucketName} already exists`);
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
      try {
        console.log(`Creating bucket: ${name}`);
        await supabase.storage.createBucket(name, {
          public: name === 'marches' || name === 'visas', // Make marches and visas buckets public
          fileSizeLimit: 20971520 // 20MB
        });
      } catch (createError: any) {
        // Ignore errors if the bucket already exists
        if (!createError.message.includes("already exists")) {
          console.error(`Error creating bucket ${name}:`, createError);
          return false;
        }
      }
    }
    return true;
  } catch (error) {
    // Log errors that might occur during the operation
    console.error(`Error checking/creating bucket ${name}:`, error);
    return false;
  }
}

// Utility function to sanitize file names
export const sanitizeFileName = (name: string) => {
  if (!name) return 'file';
  
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[']/g, '') // Remove apostrophes specifically
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace other special chars with underscores
    .replace(/_{2,}/g, '_'); // Replace multiple consecutive underscores with a single one
};
