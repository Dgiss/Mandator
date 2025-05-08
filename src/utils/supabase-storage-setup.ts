
import { supabase } from '@/lib/supabase';

/**
 * Vérifie si les buckets nécessaires existent et les crée si besoin
 */
export const ensureStorageBucketsExist = async (): Promise<void> => {
  try {
    console.log("Vérification des buckets de stockage...");
    
    // Récupérer la liste des buckets existants
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Erreur lors de la récupération des buckets:', error);
      return;
    }
    
    console.log("Buckets existants:", buckets);
    
    // Vérifier et créer le bucket 'marches' s'il n'existe pas
    if (!buckets || !buckets.find(bucket => bucket.name === 'marches')) {
      console.log('Création du bucket marches...');
      
      // Créer le bucket en le définissant comme public pour faciliter l'accès aux fichiers
      const { error: createError } = await supabase.storage.createBucket('marches', {
        public: true
      });
      
      if (createError) {
        console.error('Erreur lors de la création du bucket marches:', createError);
      } else {
        console.log('Bucket marches créé avec succès');
        
        // Mettre à jour les politiques d'accès du bucket pour le rendre public
        try {
          // La méthode getPublicUrl ne retourne pas d'erreur, elle génère juste une URL
          const { data } = supabase.storage.from('marches').getPublicUrl('test.txt');
          console.log('URL publique générée pour test:', data.publicUrl);
        } catch (policyErr) {
          console.error('Exception lors de la génération de l\'URL publique:', policyErr);
        }
      }
    } else {
      console.log('Bucket marches existe déjà');
    }
    
  } catch (error) {
    console.error('Erreur lors de la vérification des buckets de stockage:', error);
  }
};
