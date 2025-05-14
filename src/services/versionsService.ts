
import { supabase } from '@/lib/supabase';
import { Version, DocumentAttachment } from './types';
import { visasService } from './visasService';

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
  async addVersion(version: Partial<Version>, file?: File) {
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
        taille: file ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : null,
        date_creation: new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    return data[0];
  },

  // Créer une version initiale pour un document
  async createInitialVersion(document: any, filePath: string | null, fileSize: string | null) {
    if (!document || !document.id) {
      throw new Error('Document invalide pour la création de version initiale');
    }

    const versionData = {
      document_id: document.id,
      marche_id: document.marche_id,
      version: 'A', // Version initiale A
      cree_par: document.emetteur || 'Système',
      commentaire: 'Version initiale',
      statut: 'En attente de diffusion',
      file_path: filePath,
      taille: fileSize
    };

    const { data, error } = await supabase
      .from('versions')
      .insert([versionData])
      .select();

    if (error) throw error;
    return data[0];
  },

  // Diffuser une version (MOE uniquement)
  async diffuseVersion(versionId: string, commentaire: string, file?: File) {
    try {
      // Récupérer les données de la version
      const { data: versionData, error: versionError } = await supabase
        .from('versions')
        .select('document_id, marche_id, version, cree_par')
        .eq('id', versionId)
        .maybeSingle();  // Utilisation de maybeSingle() au lieu de single()

      if (versionError) throw versionError;
      if (!versionData) throw new Error("Version non trouvée");

      // Récupérer les données de l'utilisateur
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Aucun utilisateur connecté");
      }

      // Téléverser un nouveau fichier si fourni
      let filePath = null;
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${file.name}`;
        filePath = `${versionData.marche_id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('versions')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Mettre à jour le chemin du fichier
        await supabase
          .from('versions')
          .update({ 
            file_path: filePath,
            taille: (file.size / 1024 / 1024).toFixed(2) + ' MB'
          })
          .eq('id', versionId);
      }

      // ÉTAPE IMPORTANTE: Créer le visa lors de la diffusion
      await visasService.createVisaForDiffusion(
        versionData.document_id,
        versionData.marche_id,
        versionData.version,
        user.email || versionData.cree_par
      );

      // Mettre à jour le statut de la version à "En attente de validation"
      const { error: updateError } = await supabase
        .from('versions')
        .update({ 
          statut: 'En attente de validation',
          commentaire: commentaire || 'Document diffusé'
        })
        .eq('id', versionId);

      if (updateError) throw updateError;

      // Mettre à jour également le statut du document
      const { error: docUpdateError } = await supabase
        .from('documents')
        .update({ 
          statut: 'En attente de validation' 
        })
        .eq('id', versionData.document_id);

      if (docUpdateError) throw docUpdateError;

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la diffusion de la version:', error);
      return { success: false, error };
    }
  },

  // Télécharger un fichier de version
  async downloadVersionFile(filePath: string) {
    const { data, error } = await supabase.storage
      .from('versions')
      .download(filePath);

    if (error) throw error;
    return data;
  },
  
  // Obtenir la prochaine lettre de version pour un document
  async getNextVersionLetter(documentId: string) {
    // Récupérer la dernière version
    const { data, error } = await supabase
      .from('versions')
      .select('version')
      .eq('document_id', documentId)
      .order('date_creation', { ascending: false })
      .limit(1)
      .maybeSingle();  // Utilisation de maybeSingle() au lieu de single()
      
    if (error) {
      console.error('Erreur lors de la récupération de la dernière version:', error);
      return 'A'; // Par défaut, commencer à A
    }
    
    if (!data) return 'A';
    
    // Extraire la première lettre
    const currentLetter = data.version.charAt(0);
    
    // Incrémenter la lettre (A → B → C...)
    const nextLetterCode = currentLetter.charCodeAt(0) + 1;
    return String.fromCharCode(nextLetterCode);
  },
  
  // Procédure de visa (Mandataire uniquement)
  async processVisa(versionId: string, decision: 'approuve' | 'rejete', commentaire: string) {
    // Cette fonction utilise maintenant visasService.processVisa
    try {
      // Récupérer les données de la version
      const { data: versionData, error: versionError } = await supabase
        .from('versions')
        .select('document_id, marche_id')
        .eq('id', versionId)
        .maybeSingle();  // Utilisation de maybeSingle() au lieu de single()

      if (versionError) throw versionError;
      if (!versionData) throw new Error("Version non trouvée");
      
      // Récupérer le visa associé
      const { data: visaData, error: visaError } = await supabase
        .from('visas')
        .select('id')
        .eq('document_id', versionData.document_id)
        .eq('statut', 'En attente')
        .maybeSingle();  // Utilisation de maybeSingle() au lieu de single()
        
      if (visaError) {
        console.error('Erreur lors de la récupération du visa:', visaError);
        throw visaError;
      }
      
      if (!visaData) {
        throw new Error("Aucun visa en attente trouvé pour cette version");
      }
      
      // Traiter le visa en utilisant le service dédié
      return await visasService.processVisa(
        visaData.id,
        versionData.document_id,
        decision,
        commentaire
      );
    } catch (error) {
      console.error('Erreur lors du traitement du visa:', error);
      return { success: false, error };
    }
  }
};
