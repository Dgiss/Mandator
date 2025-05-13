
import { supabase } from '@/lib/supabase';

/**
 * Initialize all required storage buckets for the application
 */
export const initializeStorageBuckets = async () => {
  try {
    // Check if buckets exist before trying to create them
    const { data: existingBuckets } = await supabase.storage.listBuckets();
    const bucketNames = existingBuckets?.map(bucket => bucket.name) || [];
    
    // Define buckets with their configurations
    const requiredBuckets = [
      {
        name: 'questions',
        isPublic: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: [
          'application/pdf', 
          'application/msword', 
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'image/jpeg',
          'image/png'
        ]
      },
      {
        name: 'reponses',
        isPublic: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: [
          'application/pdf', 
          'application/msword', 
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'image/jpeg',
          'image/png'
        ]
      },
      {
        name: 'documents',
        isPublic: false,
        fileSizeLimit: 20971520 // 20MB
      },
      {
        name: 'attachments',
        isPublic: false,
        fileSizeLimit: 20971520 // 20MB
      },
      {
        name: 'marches',
        isPublic: true,
        fileSizeLimit: 10485760 // 10MB
      }
    ];
    
    // Create all required buckets if they don't exist
    for (const bucket of requiredBuckets) {
      if (!bucketNames.includes(bucket.name)) {
        console.log(`Creating bucket: ${bucket.name}`);
        
        const { error } = await supabase.storage.createBucket(bucket.name, {
          public: bucket.isPublic,
          fileSizeLimit: bucket.fileSizeLimit,
          allowedMimeTypes: bucket.allowedMimeTypes
        });
        
        if (error) {
          console.error(`Failed to create ${bucket.name} bucket:`, error);
        } else {
          console.log(`${bucket.name} bucket created successfully`);
        }
      } else {
        console.log(`Bucket ${bucket.name} already exists`);
      }
    }
    
  } catch (error) {
    console.error('Error initializing storage buckets:', error);
  }
};
