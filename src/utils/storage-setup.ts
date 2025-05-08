
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
        
        // Create RLS policies for the bucket
        // These policies will be needed to be set up in your Supabase dashboard
        // or through SQL migrations if needed
      }
    }
  } catch (error) {
    console.error("Error in storage setup:", error);
  }
}
