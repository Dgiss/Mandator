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

  // Créer un nouveau visa lors de la diffusion du document
  async createVisaForDiffusion(documentId: string, marcheId: string, version: string, demandePar: string, echeance?: string) {
    // Calculer l'échéance par défaut (7 jours à partir d'aujourd'hui)
    const defaultEcheance = new Date();
    defaultEcheance.setDate(defaultEcheance.getDate() + 7);
    
    const visaToCreate = {
      document_id: documentId,
      marche_id: marcheId,
      version: version,
      demande_par: demandePar,
      date_demande: new Date().toISOString(),
      echeance: echeance || defaultEcheance.toISOString(),
      statut: 'En attente',
      commentaire: 'Document diffusé pour visa'
    };

    const { data, error } = await supabase
      .from('visas')
      .insert([visaToCreate])
      .select();

    if (error) throw error;
    return data[0];
  },

  // Ajouter un nouveau visa (pour les autres cas)
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

  // Traiter un visa (approuver ou refuser)
  async processVisa(visaId: string, documentId: string, decision: 'approuve' | 'rejete', commentaire: string) {
    // Mettre à jour le visa
    const { data: updatedVisa, error: visaError } = await supabase
      .from('visas')
      .update({
        statut: decision === 'approuve' ? 'Approuvé' : 'Rejeté',
        commentaire: commentaire
      })
      .eq('id', visaId)
      .select();

    if (visaError) throw visaError;

    // Mettre à jour le document
    const { error: docError } = await supabase
      .from('documents')
      .update({
        statut: decision === 'approuve' ? 'Approuvé' : 'En attente de diffusion'
      })
      .eq('id', documentId);

    if (docError) throw docError;

    return {
      success: true,
      visa: updatedVisa[0],
      decision
    };
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
  },
  
  // Récupérer le rôle de l'utilisateur actuel sur un marché spécifique
  async getUserRoleForMarche(marcheId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    // Vérifier d'abord si l'utilisateur est administrateur
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role_global')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('Erreur lors de la récupération du profil:', profileError);
      return 'STANDARD';
    }
    
    // Les administrateurs sont considérés comme ayant tous les droits
    if (profile?.role_global === 'ADMIN') {
      return 'ADMIN';
    }
    
    // Récupérer le rôle spécifique pour ce marché
    const { data, error } = await supabase
      .from('droits_marche')
      .select('role_specifique')
      .eq('user_id', user.id)
      .eq('marche_id', marcheId)
      .maybeSingle();
    
    if (error) {
      console.error('Erreur lors de la récupération du rôle spécifique:', error);
      return null;
    }
    
    return data?.role_specifique || profile?.role_global || 'STANDARD';
  },
  
  // Vérifier si l'utilisateur peut diffuser un document pour un marché spécifique
  async canUserDiffuseForMarche(marcheId: string) {
    const role = await this.getUserRoleForMarche(marcheId);
    return role === 'ADMIN' || role === 'MANDATAIRE';
  },
  
  // Vérifier si l'utilisateur peut viser un document pour un marché spécifique
  async canUserVisaForMarche(marcheId: string) {
    const role = await this.getUserRoleForMarche(marcheId);
    return role === 'ADMIN' || role === 'MOE';
  }
};
