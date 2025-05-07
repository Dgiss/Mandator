
import { supabase } from '@/lib/supabase';

export interface Version {
  id?: string;
  document_id: string;
  marche_id: string;
  version: string;
  cree_par: string;
  date_creation?: string;
  taille?: string;
  commentaire?: string;
  file_path?: string;
}

export const versionsService = {
  // Récupérer toutes les versions pour un marché
  async getVersionsByMarcheId(marcheId: string) {
    const { data, error } = await supabase
      .from('versions')
      .select('*, documents(nom)')
      .eq('marche_id', marcheId)
      .order('date_creation', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Récupérer toutes les versions pour un document
  async getVersionsByDocumentId(documentId: string) {
    const { data, error } = await supabase
      .from('versions')
      .select('*')
      .eq('document_id', documentId)
      .order('date_creation', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Ajouter une nouvelle version
  async addVersion(version: Version, file?: File) {
    let filePath = null;

    // Si un fichier est fourni, le télécharger d'abord
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${file.name}`;
      filePath = `${version.marche_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('versions')
        .upload(filePath, file);

      if (uploadError) throw uploadError;
    }

    // Insérer la version dans la base de données
    const { data, error } = await supabase
      .from('versions')
      .insert([{
        ...version,
        file_path: filePath,
        date_creation: new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    return data[0];
  },

  // Supprimer une version
  async deleteVersion(versionId: string) {
    // D'abord récupérer le chemin du fichier si présent
    const { data: versionData, error: fetchError } = await supabase
      .from('versions')
      .select('file_path')
      .eq('id', versionId)
      .single();

    if (fetchError) throw fetchError;

    // Si un fichier est associé, le supprimer
    if (versionData.file_path) {
      const { error: storageError } = await supabase.storage
        .from('versions')
        .remove([versionData.file_path]);

      if (storageError) throw storageError;
    }

    // Enfin, supprimer l'enregistrement
    const { error: deleteError } = await supabase
      .from('versions')
      .delete()
      .eq('id', versionId);

    if (deleteError) throw deleteError;
    return true;
  },

  // Télécharger un fichier de version
  async downloadVersionFile(filePath: string) {
    const { data, error } = await supabase.storage
      .from('versions')
      .download(filePath);

    if (error) throw error;
    return data;
  }
};
