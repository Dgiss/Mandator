
import { supabase } from '@/lib/supabase';
import { Document } from './types';
import { fileStorage } from './storage/fileStorage.ts';

interface VersionData {
  document_id: string;
  marche_id: string;
  version: string;
  cree_par: string;
  file_path?: string | null;
  statut?: string;
  taille?: string;
  commentaire?: string;
}

export const versionsService = {
  /**
   * Crée une version initiale pour un document
   */
  async createInitialVersion(document: Pick<Document, 'id' | 'nom' | 'type' | 'marche_id'>, filePath: string | null, fileSize?: string): Promise<string | null> {
    try {
      console.log('Creating initial version for document', document.id);
      
      // Récupérer les informations de l'utilisateur actuel
      const { data: userData } = await supabase.auth.getUser();
      const userEmail = userData.user?.email || 'Non spécifié';
      
      const versionData: VersionData = {
        document_id: document.id,
        marche_id: document.marche_id,
        version: 'A', // Version initiale A
        cree_par: userEmail,
        file_path: filePath,
        statut: 'En attente de diffusion',
        taille: fileSize || '0 KB',
        commentaire: 'Version initiale'
      };
      
      // Insertion de la version dans la base de données
      const { data, error } = await supabase
        .from('versions')
        .insert(versionData)
        .select();
      
      if (error) {
        console.error('Error creating initial version:', error);
        return null;
      }
      
      if (!data || data.length === 0) {
        console.error('No data returned when creating version');
        return null;
      }
      
      console.log('Initial version created successfully:', data[0].id);
      return data[0].id;
    } catch (error: any) {
      console.error('Exception in createInitialVersion:', error.message);
      return null;
    }
  },
  
  /**
   * Crée une nouvelle version d'un document
   */
  async createNewVersion(document: Document, file: File | null, version: string, comment?: string): Promise<string | null> {
    try {
      console.log(`Creating new version ${version} for document ${document.id}`);
      let filePath = null;
      let fileSize = '0 KB';
      
      // Si un fichier est fourni, l'uploader
      if (file) {
        const prefix = `documents/${document.marche_id}/versions`;
        
        // Utiliser notre service fileStorage pour l'upload
        const uploadResult = await fileStorage.uploadFile('marches', prefix, file);
        
        if (!uploadResult) {
          console.error('Failed to upload file for version');
          throw new Error("Échec de l'upload du fichier pour la nouvelle version");
        }
        
        filePath = uploadResult.path;
        fileSize = `${(file.size / 1024).toFixed(1)} KB`;
      }
      
      // Récupérer les informations de l'utilisateur actuel
      const { data: userData } = await supabase.auth.getUser();
      const userEmail = userData.user?.email || 'Non spécifié';
      
      const versionData: VersionData = {
        document_id: document.id,
        marche_id: document.marche_id,
        version,
        cree_par: userEmail,
        file_path: filePath,
        statut: 'En attente de diffusion',
        taille: fileSize,
        commentaire: comment || ''
      };
      
      // Insertion de la version dans la base de données
      const { data, error } = await supabase
        .from('versions')
        .insert(versionData)
        .select();
      
      if (error) {
        console.error('Error creating new version:', error);
        return null;
      }
      
      if (!data || data.length === 0) {
        console.error('No data returned when creating new version');
        return null;
      }
      
      // Mettre à jour la version du document parent
      await supabase
        .from('documents')
        .update({ version })
        .eq('id', document.id);
      
      console.log('New version created successfully:', data[0].id);
      return data[0].id;
    } catch (error: any) {
      console.error('Exception in createNewVersion:', error.message);
      return null;
    }
  }
};
