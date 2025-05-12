
import { supabase } from '@/lib/supabase';

/**
 * Initialize all required storage buckets for the application
 */
export const initializeStorageBuckets = async () => {
  try {
    // Create questions bucket if it doesn't exist
    const { data: questionsBucket, error: questionsBucketError } = await supabase
      .storage
      .getBucket('questions');

    if (questionsBucketError && questionsBucketError.message.includes('The resource was not found')) {
      const { error: createQuestionsError } = await supabase
        .storage
        .createBucket('questions', {
          public: false,
          fileSizeLimit: 10485760, // 10MB in bytes
          allowedMimeTypes: [
            'application/pdf', 
            'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/png'
          ]
        });
        
      if (createQuestionsError) {
        console.error('Failed to create questions storage bucket:', createQuestionsError);
      } else {
        console.log('Questions storage bucket created successfully');
      }
    }
    
    // Create responses bucket if it doesn't exist
    const { data: responsesBucket, error: responsesBucketError } = await supabase
      .storage
      .getBucket('reponses');
      
    if (responsesBucketError && responsesBucketError.message.includes('The resource was not found')) {
      const { error: createResponsesError } = await supabase
        .storage
        .createBucket('reponses', {
          public: false,
          fileSizeLimit: 10485760, // 10MB in bytes
          allowedMimeTypes: [
            'application/pdf', 
            'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/png'
          ]
        });
        
      if (createResponsesError) {
        console.error('Failed to create responses storage bucket:', createResponsesError);
      } else {
        console.log('Responses storage bucket created successfully');
      }
    }
    
    // Set public access policy for questions bucket
    const { error: questionsPublicError } = await supabase
      .storage
      .from('questions')
      .setPublic();
      
    if (questionsPublicError) {
      console.error('Failed to set questions bucket to public:', questionsPublicError);
    }
    
    // Set public access policy for responses bucket
    const { error: responsesPublicError } = await supabase
      .storage
      .from('reponses')
      .setPublic();
      
    if (responsesPublicError) {
      console.error('Failed to set responses bucket to public:', responsesPublicError);
    }
    
  } catch (error) {
    console.error('Error initializing storage buckets:', error);
  }
};
