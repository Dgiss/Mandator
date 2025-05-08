
import { supabase } from '@/lib/supabase';

export const ensureStorageBucketsExist = async () => {
  try {
    // Vérifier si le bucket "marches" existe
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error("Erreur lors de la récupération des buckets de stockage:", error);
      return;
    }
    
    const marchesBucketExists = buckets.some(bucket => bucket.name === "marches");
    
    // Créer le bucket s'il n'existe pas déjà
    if (!marchesBucketExists) {
      try {
        console.log("Création du bucket 'marches'...");
        const { data, error: createError } = await supabase.storage.createBucket('marches', {
          public: true,
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
          fileSizeLimit: 5242880 // 5MB in bytes
        });
        
        if (createError) {
          console.error("Erreur lors de la création du bucket 'marches':", createError);
        } else {
          console.log("Bucket 'marches' créé avec succès:", data);
        }
      } catch (bucketError) {
        console.error("Exception lors de la création du bucket 'marches':", bucketError);
      }
    } else {
      console.log("Le bucket 'marches' existe déjà");
    }
  } catch (error) {
    console.error("Exception lors de la configuration du stockage:", error);
  }
};
