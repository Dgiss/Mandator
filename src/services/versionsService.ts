
import { supabase } from '@/lib/supabase';
import { Document, Version } from './types';
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
   * Récupère toutes les versions associées à un marché spécifique
   */
  async getVersionsByMarcheId(marcheId: string): Promise<Version[]> {
    try {
      console.log(`Fetching versions for marche ID: ${marcheId}`);
      
      // Récupérer toutes les versions pour ce marché avec les informations des documents associés
      const { data, error } = await supabase
        .from('versions')
        .select(`
          *,
          documents:document_id (*)
        `)
        .eq('marche_id', marcheId)
        .order('date_creation', { ascending: false });
      
      if (error) {
        console.error('Error fetching versions:', error);
        return [];
      }
      
      console.log(`Retrieved ${data?.length || 0} versions`);
      return data as Version[] || [];
    } catch (error: any) {
      console.error('Exception in getVersionsByMarcheId:', error.message);
      return [];
    }
  },
  
  /**
   * Télécharge le fichier associé à une version
   */
  async downloadVersionFile(filePath: string): Promise<Blob> {
    try {
      console.log(`Downloading file from path: ${filePath}`);
      
      // Utiliser notre service fileStorage pour le téléchargement
      const fileData = await fileStorage.downloadFile('marches', filePath);
      
      if (!fileData) {
        throw new Error("Échec du téléchargement du fichier");
      }
      
      return fileData;
    } catch (error: any) {
      console.error('Error downloading version file:', error);
      throw new Error(`Erreur lors du téléchargement: ${error.message}`);
    }
  },

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
