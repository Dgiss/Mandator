
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
          if (error.message === 'The resource already exists') {
            console.log(`Bucket ${bucket.name} already exists`);
          } else {
            console.error(`Failed to create ${bucket.name} bucket:`, error);
          }
        } else {
          console.log(`${bucket.name} bucket created successfully`);
          
          // Set up public access for public buckets using SQL function or other available methods
          if (bucket.isPublic) {
            // Alternative approach for setting bucket policies if createPolicy is not available
            try {
              // This is a placeholder - actual implementation would depend on the available API
              console.log(`Setting up public access for ${bucket.name}`);
            } catch (policyError) {
              console.error(`Error setting up policies for ${bucket.name}:`, policyError);
            }
          }
        }
      } else {
        console.log(`Bucket ${bucket.name} already exists`);
      }
    }
    
  } catch (error) {
    console.error('Error initializing storage buckets:', error);
  }
};
