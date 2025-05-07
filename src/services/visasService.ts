
import { supabase } from '@/lib/supabase';
import { Visa } from './types';

export const visasService = {
  // Récupérer tous les visas pour un marché
  async getVisasByMarcheId(marcheId: string) {
    const { data, error } = await supabase
      .from('visas')
      .select('*, documents(nom)')
      .eq('marche_id', marcheId)
      .order('date_demande', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Récupérer tous les visas pour un document
  async getVisasByDocumentId(documentId: string) {
    const { data, error } = await supabase
      .from('visas')
      .select('*')
      .eq('document_id', documentId)
      .order('date_demande', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Ajouter un nouveau visa
  async addVisa(visa: Visa, file?: File) {
    let attachmentPath = null;

    // Si un fichier est fourni, le télécharger d'abord
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${file.name}`;
      attachmentPath = `${visa.marche_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('visas')
        .upload(attachmentPath, file);

      if (uploadError) throw uploadError;
    }

    // Insérer le visa dans la base de données
    const { data, error } = await supabase
      .from('visas')
      .insert([{
        document_id: visa.document_id,
        marche_id: visa.marche_id,
        version: visa.version,
        demande_par: visa.demande_par,
        attachment_path: attachmentPath,
        date_demande: new Date().toISOString(),
        echeance: visa.echeance,
        statut: visa.statut || 'En attente',
        commentaire: visa.commentaire
      }])
      .select();

    if (error) throw error;
    return data[0];
  },

  // Mettre à jour le statut d'un visa
  async updateVisaStatus(visaId: string, newStatus: string, commentaire?: string) {
    const { data, error } = await supabase
      .from('visas')
      .update({ 
        statut: newStatus,
        ...(commentaire && { commentaire })
      })
      .eq('id', visaId)
      .select();

    if (error) throw error;
    return data[0];
  },

  // Supprimer un visa
  async deleteVisa(visaId: string) {
    // D'abord récupérer le chemin du fichier si présent
    const { data: visaData, error: fetchError } = await supabase
      .from('visas')
      .select('attachment_path')
      .eq('id', visaId)
      .single();

    if (fetchError) throw fetchError;

    // Si un fichier est associé, le supprimer
    if (visaData.attachment_path) {
      const { error: storageError } = await supabase.storage
        .from('visas')
        .remove([visaData.attachment_path]);

      if (storageError) throw storageError;
    }

    // Enfin, supprimer l'enregistrement
    const { error: deleteError } = await supabase
      .from('visas')
      .delete()
      .eq('id', visaId);

    if (deleteError) throw deleteError;
    return true;
  },

  // Télécharger un fichier attaché à un visa
  async downloadVisaAttachment(attachmentPath: string) {
    const { data, error } = await supabase.storage
      .from('visas')
      .download(attachmentPath);

    if (error) throw error;
    return data;
  }
};
