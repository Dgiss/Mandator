
import { supabase } from '@/lib/supabase';

/**
 * Service de gestion des fichiers avec Supabase Storage
 * Version améliorée avec gestion de la réutilisation des buckets existants
 */
export const fileStorage = {
  /**
   * Vérifie si un bucket existe déjà
   * @param bucketName Nom du bucket à vérifier
   * @returns true si le bucket existe
   */
  async bucketExists(bucketName: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage.getBucket(bucketName);
      return !error && !!data;
    } catch (error) {
      console.error(`Erreur lors de la vérification du bucket ${bucketName}:`, error);
      return false;
    }
  },

  /**
   * Crée un bucket s'il n'existe pas déjà
   * @param bucketName Nom du bucket à créer
   * @param isPublic Si le bucket doit être public
   */
  async ensureBucketExists(bucketName: string, isPublic: boolean = false): Promise<void> {
    try {
      // Vérifier si le bucket existe déjà
      const exists = await this.bucketExists(bucketName);
      
      if (exists) {
        console.log(`Le bucket ${bucketName} existe déjà.`);
        return;
      }
      
      // Créer le bucket s'il n'existe pas
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: isPublic,
        fileSizeLimit: 50 * 1024 * 1024, // 50MB limit
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'application/pdf']
      });
      
      if (error) {
        // Ignorer l'erreur si c'est juste que le bucket existe déjà
        if (error.message === 'The resource already exists') {
          console.log(`Bucket ${bucketName} existe déjà - continuons.`);
          return;
        }
        throw error;
      }
      
      console.log(`Bucket ${bucketName} créé avec succès.`);
      
      // Ajouter les politiques de bucket si c'est un bucket public
      if (isPublic) {
        await this.setupPublicBucketPolicies(bucketName);
      }
    } catch (error) {
      console.error(`Erreur lors de la création/vérification du bucket ${bucketName}:`, error);
      // Ne pas bloquer l'application pour une erreur de bucket - on va essayer d'utiliser le bucket existant
    }
  },
  
  /**
   * Configure les politiques nécessaires pour un bucket public
   * Note: Utilise les APIs RPC SQL plutôt que les méthodes createPolicy qui ne sont pas disponibles
   */
  async setupPublicBucketPolicies(bucketName: string): Promise<void> {
    try {
      // Au lieu d'appeler createPolicy qui n'existe pas, on utilise une requête RPC
      // pour configurer les politiques de bucket
      
      // Pour l'accès en lecture public
      await supabase.rpc('create_storage_policy', {
        bucket_name: bucketName,
        policy_name: 'Public Read',
        policy_definition: 'true', // Accès de lecture illimité
        policy_action: 'SELECT',
        policy_role: 'anon'
      }).catch(error => {
        console.warn(`Erreur lors de la création de la politique de lecture: ${error.message}`);
      });
      
      // Pour l'upload par des utilisateurs authentifiés
      await supabase.rpc('create_storage_policy', {
        bucket_name: bucketName,
        policy_name: 'Authenticated Upload',
        policy_definition: '(auth.uid() IS NOT NULL)', // Accès en écriture pour les utilisateurs authentifiés
        policy_action: 'INSERT',
        policy_role: 'authenticated'
      }).catch(error => {
        console.warn(`Erreur lors de la création de la politique d'upload: ${error.message}`);
      });
      
      console.log(`Politiques pour bucket ${bucketName} configurées avec succès.`);
    } catch (error) {
      console.warn(`Erreur lors de la configuration des politiques pour ${bucketName}:`, error);
      // Ne pas bloquer l'application pour une erreur de politique
    }
  },
  
  /**
   * Upload un fichier dans un bucket avec une meilleure gestion des erreurs
   */
  async uploadFile(bucketName: string, folder: string, file: File): Promise<{path: string, id: string, fullPath: string} | null> {
    try {
      // Assurer que le bucket existe
      await this.ensureBucketExists(bucketName, true);
      
      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const uniqueId = Math.random().toString(36).substring(2, 10);
      const filePath = `${folder}/${uniqueId}.${fileExt}`;
      
      // Upload du fichier
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        throw error;
      }
      
      return {
        path: data.path,
        id: data.id,
        fullPath: `${bucketName}/${data.path}`
      };
    } catch (error) {
      console.error(`Erreur lors de l'upload dans ${bucketName}/${folder}:`, error);
      return null;
    }
  },
  
  /**
   * Récupère l'URL publique d'un fichier
   */
  getPublicUrl(bucketName: string, filePath: string): string {
    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    return data.publicUrl;
  },
  
  /**
   * Liste les fichiers dans un bucket/dossier
   */
  async listFiles(bucketName: string, folder?: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(folder || '');
      
      if (error) {
        throw error;
      }
      
      return (data || []).map(item => item.name);
    } catch (error) {
      console.error(`Erreur lors de la liste des fichiers dans ${bucketName}/${folder || ''}:`, error);
      return [];
    }
  },
  
  /**
   * Supprime un fichier
   */
  async deleteFile(bucketName: string, filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de ${bucketName}/${filePath}:`, error);
      return false;
    }
  }
};
