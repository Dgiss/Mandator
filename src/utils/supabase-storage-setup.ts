
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
      },
      // Add visas bucket
      {
        name: 'visas',
        isPublic: true,
        fileSizeLimit: 20971520, // 20MB
        allowedMimeTypes: [
          'application/pdf', 
          'application/msword', 
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/png'
        ]
      }
    ];
    
    // Create all required buckets if they don't exist
    for (const bucket of requiredBuckets) {
      if (!bucketNames.includes(bucket.name)) {
        console.log(`Creating bucket: ${bucket.name}`);
        
        try {
          const { error } = await supabase.storage.createBucket(bucket.name, {
            public: bucket.isPublic,
            fileSizeLimit: bucket.fileSizeLimit,
            allowedMimeTypes: bucket.allowedMimeTypes
          });
          
          if (error) {
            // Check if it's just a concurrent creation error
            if (error.message === 'The resource already exists') {
              console.log(`Bucket ${bucket.name} already exists (concurrent creation detected)`);
            } else {
              console.error(`Failed to create ${bucket.name} bucket:`, error);
            }
          } else {
            console.log(`${bucket.name} bucket created successfully`);
            
            // Note about public buckets
            if (bucket.isPublic) {
              console.log(`Note: For public buckets like "${bucket.name}", you may need to configure storage policies through the Supabase dashboard.`);
            }
          }
        } catch (bucketError: any) {
          // Handle any other errors that might occur during bucket creation
          // This could be due to network issues, permissions, etc.
          if (bucketError?.message?.includes('already exists')) {
            console.log(`Bucket ${bucket.name} already exists (error caught)`);
          } else {
            console.error(`Error creating bucket ${bucket.name}:`, bucketError);
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
