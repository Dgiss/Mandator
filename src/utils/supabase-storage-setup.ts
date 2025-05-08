
import { supabase } from '@/lib/supabase';

/**
 * Vérifie si les buckets nécessaires existent et les crée si besoin
 */
export const ensureStorageBucketsExist = async (): Promise<void> => {
  try {
    // Récupérer la liste des buckets existants
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Erreur lors de la récupération des buckets:', error);
      return;
    }
    
    // Vérifier et créer le bucket 'marches' s'il n'existe pas
    if (!buckets.find(bucket => bucket.name === 'marches')) {
      console.log('Création du bucket marches...');
      const { error: createError } = await supabase.storage.createBucket('marches', { 
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/*', 'application/pdf'] 
      });
      
      if (createError) {
        console.error('Erreur lors de la création du bucket marches:', createError);
      } else {
        console.log('Bucket marches créé avec succès');
      }
    }
    
  } catch (error) {
    console.error('Erreur lors de la vérification des buckets de stockage:', error);
  }
};

// Autres fonctions utiles pour la gestion du stockage peuvent être ajoutées ici
