
import { supabase } from '@/lib/supabase';

// Cette fonction configure les buckets de stockage nécessaires
export const setupStorageBuckets = async () => {
  try {
    // Vérifier si le bucket 'marches' existe, sinon le créer
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Erreur lors de la vérification des buckets:', listError);
      return;
    }
    
    const marchesBucketExists = buckets.some(bucket => bucket.name === 'marches');
    
    if (!marchesBucketExists) {
      // Créer le bucket 'marches'
      const { error: createError } = await supabase.storage.createBucket('marches', {
        public: true,
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (createError) {
        console.error('Erreur lors de la création du bucket marches:', createError);
      } else {
        console.log('Bucket marches créé avec succès');
      }
    }
  } catch (error) {
    console.error('Erreur lors de la configuration des buckets de stockage:', error);
  }
};
