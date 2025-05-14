
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

  // Traiter un visa (approuver ou refuser) avec la logique de synchronisation du document et version
  async processVisa(visaId: string, documentId: string, decision: 'approuve' | 'rejete', commentaire: string) {
    let documentStatus = 'En attente de diffusion';
    let visaStatus = decision === 'approuve' ? 'Approuvé' : 'Rejeté';
    
    try {
      // 1. Récupérer d'abord les informations sur le visa pour connaître sa version
      const { data: visaData, error: visaError } = await supabase
        .from('visas')
        .select('version, marche_id, document_id')
        .eq('id', visaId)
        .single();
      
      if (visaError) throw visaError;
      
      // 2. Mettre à jour le visa
      const { data: updatedVisa, error: visaUpdateError } = await supabase
        .from('visas')
        .update({
          statut: visaStatus,
          commentaire: commentaire
        })
        .eq('id', visaId)
        .select();
      
      if (visaUpdateError) throw visaUpdateError;
      
      // 3. Déterminer le statut du document selon le type de décision
      if (decision === 'approuve') {
        documentStatus = 'Approuvé'; // Document approuvé
      } else {
        documentStatus = 'En attente de diffusion'; // Document à modifier
      }
      
      // 4. Mettre à jour le document - TOUJOURS mettre à jour le document avec la version actuelle
      const { error: docUpdateError } = await supabase
        .from('documents')
        .update({
          statut: documentStatus,
          version: visaData.version // Synchronise l'indice du document parent avec celui de la version
        })
        .eq('id', visaData.document_id);
      
      if (docUpdateError) throw docUpdateError;
      
      // 5. Pour les VAO, créer une nouvelle version avec la lettre suivante
      if (decision === 'rejete') {
        // Obtenir la prochaine lettre de version
        const nextVersionLetter = this.getNextVersionLetter(visaData.version);
        
        // Récupérer les données de la version actuelle pour créer la nouvelle
        const { data: versionData, error: versionFetchError } = await supabase
          .from('versions')
          .select('*')
          .eq('document_id', visaData.document_id)
          .eq('version', visaData.version)
          .single();
          
        if (versionFetchError) throw versionFetchError;
        
        // Créer une nouvelle version incrémentée
        const { error: newVersionError } = await supabase
          .from('versions')
          .insert({
            document_id: visaData.document_id,
            marche_id: visaData.marche_id,
            version: nextVersionLetter,
            cree_par: "Système (suite à VAO)",
            commentaire: `Nouvelle version suite au rejet de la version ${visaData.version} - ${commentaire}`,
            statut: "En attente de diffusion"
          });
          
        if (newVersionError) throw newVersionError;
      }
      
      return {
        success: true,
        visa: updatedVisa[0],
        decision
      };
    } catch (error) {
      console.error('Erreur lors du traitement du visa:', error);
      throw error;
    }
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
    return role === 'ADMIN' || role === 'MOE';
  },
  
  // Vérifier si l'utilisateur peut viser un document pour un marché spécifique
  async canUserVisaForMarche(marcheId: string) {
    const role = await this.getUserRoleForMarche(marcheId);
    return role === 'ADMIN' || role === 'MANDATAIRE';
  },
  
  // Obtenir la lettre de version suivante (A→B→C...)
  getNextVersionLetter(currentVersion: string) {
    // Extraire la première lettre de la version actuelle
    const currentLetter = currentVersion.charAt(0);
    // Convertir en code ASCII et incrémenter
    const nextLetterCode = currentLetter.charCodeAt(0) + 1;
    // Reconvertir en lettre
    return String.fromCharCode(nextLetterCode);
  }
};
