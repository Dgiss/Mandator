
import { supabase } from '@/lib/supabase';
import { Version, DocumentAttachment } from './types';
import { Database } from '@/types/supabase';
import { visasService } from './visasService';

export const versionsService = {
  // Récupérer toutes les versions pour un marché
  async getVersionsByMarcheId(marcheId: string) {
    // Utiliser la requête correcte pour la table versions
    const { data, error } = await supabase
      .from('versions')
      .select('*, documents(nom)')
      .eq('marche_id', marcheId)
      .order('date_creation', { ascending: false });

    if (error) {
      console.error('Error fetching versions:', error);
      throw error;
    }
    return data || [];
  },

  // Récupérer toutes les versions pour un document
  async getVersionsByDocumentId(documentId: string) {
    // Utiliser la requête correcte pour la table versions
    const { data, error } = await supabase
      .from('versions')
      .select('*')
      .eq('document_id', documentId)
      .order('date_creation', { ascending: false });

    if (error) {
      console.error('Error fetching document versions:', error);
      throw error;
    }
    return data || [];
  },

  // Générer la prochaine version alphabétique
  async getNextVersionLetter(documentId: string) {
    try {
      // Récupérer la dernière version pour ce document
      const { data, error } = await supabase
        .from('versions')
        .select('version')
        .eq('document_id', documentId)
        .order('date_creation', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      // Si aucune version n'existe, commencer par 'A'
      if (!data || data.length === 0) {
        return 'A';
      }
      
      // Extraire la lettre de la dernière version
      const lastVersion = data[0].version;
      // Utiliser le code ASCII pour obtenir la prochaine lettre
      // 'A' est 65, 'B' est 66, etc.
      const lastLetter = lastVersion.charAt(0);
      const nextLetterCode = lastLetter.charCodeAt(0) + 1;
      const nextLetter = String.fromCharCode(nextLetterCode);
      
      return nextLetter;
    } catch (error) {
      console.error('Error determining next version letter:', error);
      return 'A'; // Par défaut, retourner 'A' en cas d'erreur
    }
  },

  // Ajouter une nouvelle version
  async addVersion(version: Version, file?: File, attachments?: File[]) {
    try {
      console.log('Adding new version:', version);
      let filePath = version.file_path || null;

      // Si un fichier est fourni, le télécharger d'abord
      if (file && !filePath) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${file.name}`;
        filePath = `${version.marche_id}/${fileName}`;

        // Vérifier si le bucket existe
        const { data: buckets } = await supabase.storage.listBuckets();
        if (!buckets || !buckets.some(b => b.name === 'versions')) {
          // Créer le bucket s'il n'existe pas
          await supabase.storage.createBucket('versions', {
            public: false
          });
        }

        const { error: uploadError } = await supabase.storage
          .from('versions')
          .upload(filePath, file);

        if (uploadError) throw uploadError;
      }

      // Log the data being sent to the database
      console.log('Inserting version with data:', {
        document_id: version.document_id,
        marche_id: version.marche_id,
        version: version.version,
        cree_par: version.cree_par,
        taille: version.taille,
        commentaire: version.commentaire,
        file_path: filePath,
        date_creation: new Date().toISOString(),
        statut: version.statut || 'En attente de diffusion'
      });

      // Insérer la version dans la base de données
      const { data, error } = await supabase
        .from('versions')
        .insert([{
          document_id: version.document_id,
          marche_id: version.marche_id,
          version: version.version,
          cree_par: version.cree_par,
          taille: version.taille,
          commentaire: version.commentaire,
          file_path: filePath,
          date_creation: new Date().toISOString(),
          statut: version.statut || 'En attente de diffusion'
        }])
        .select();

      if (error) {
        console.error('Error inserting version:', error);
        throw error;
      }
      
      // Mettre à jour le document parent avec la même version
      // pour assurer la synchronisation entre le document et sa version active
      await supabase
        .from('documents')
        .update({ version: version.version })
        .eq('id', version.document_id);
      
      // Si cette version a des pièces jointes, les traiter
      if (attachments && attachments.length > 0 && data && data[0] && data[0].id) {
        const versionId = data[0].id;
        
        // Téléverser chaque pièce jointe
        for (const attachment of attachments) {
          await this.addAttachmentToVersion(versionId, version.document_id, attachment);
        }
      }
      
      console.log('Version created successfully:', data);
      return data[0];
    } catch (error) {
      console.error('Erreur lors de la création de la version:', error);
      throw error;
    }
  },

  // Ajouter une pièce jointe à une version
  async addAttachmentToVersion(versionId: string, documentId: string, file: File) {
    try {
      const fileExt = file.name.split('.').pop()?.toUpperCase() || '';
      const fileSize = (file.size / 1024 / 1024).toFixed(2) + ' MB';
      const sanitizedFileName = file.name.replace(/\s+/g, '-');
      const fileNameWithTimestamp = `${Date.now()}_${sanitizedFileName}`;
      const filePath = `versions/${versionId}/${fileNameWithTimestamp}`;
      
      // Vérifier que le bucket attachments existe
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets || !buckets.some(b => b.name === 'attachments')) {
        await supabase.storage.createBucket('attachments', {
          public: false,
          fileSizeLimit: 10485760 // 10MB limit
        });
      }
      
      // Télécharger le fichier
      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Enregistrer l'attachement dans la base de données
      const { error } = await supabase
        .from('document_attachments')
        .insert({
          document_id: documentId,
          version_id: versionId,
          file_name: file.name,
          file_path: filePath,
          file_type: fileExt,
          file_size: fileSize
        });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la pièce jointe à la version:', error);
      return false;
    }
  },

  // Récupérer les pièces jointes d'une version
  async getVersionAttachments(versionId: string) {
    try {
      const { data, error } = await supabase
        .from('document_attachments')
        .select('*')
        .eq('version_id', versionId)
        .order('uploaded_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des pièces jointes de la version:', error);
      return [];
    }
  },

  // Créer automatiquement une version initiale pour un nouveau document
  async createInitialVersion(documentData: any, filePath: string | null, fileSize: string) {
    try {
      console.log('Creating initial version for document:', documentData.id);
      
      // La version initiale est toujours "A"
      const versionLetter = 'A';
      
      // Créer la version avec les données du document
      const versionData = {
        document_id: documentData.id,
        marche_id: documentData.marche_id,
        version: versionLetter,
        cree_par: "Système", // Remplacer par les infos de l'utilisateur quand l'authentification sera implémentée
        taille: fileSize,
        commentaire: "Version initiale créée automatiquement",
        file_path: filePath,
        statut: "En attente de diffusion"
      };
      
      console.log('Creating version with data:', versionData);
      
      // Ajouter la version en utilisant la fonction existante
      const result = await this.addVersion(versionData);
      console.log("Version initiale A créée automatiquement:", result);
      return result;
    } catch (error) {
      console.error("Erreur lors de la création de la version initiale:", error);
      throw error;
    }
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
    
    // Récupérer et supprimer les pièces jointes associées
    const { data: attachments } = await supabase
      .from('document_attachments')
      .select('id, file_path')
      .eq('version_id', versionId);
    
    if (attachments && attachments.length > 0) {
      // Supprimer les fichiers du stockage
      const filePaths = attachments.map(a => a.file_path).filter(Boolean);
      if (filePaths.length > 0) {
        await supabase.storage
          .from('attachments')
          .remove(filePaths);
      }
      
      // Supprimer les enregistrements de pièces jointes
      await supabase
        .from('document_attachments')
        .delete()
        .eq('version_id', versionId);
    }

    // Enfin, supprimer l'enregistrement
    const { error: deleteError } = await supabase
      .from('versions')
      .delete()
      .eq('id', versionId);

    if (deleteError) throw deleteError;
    return true;
  },

  // Diffuser une version (MOE uniquement) - Mise à jour selon le workflow
  async diffuseVersion(versionId: string, commentaire: string, file?: File) {
    try {
      // Récupérer les données de la version
      const { data: versionData, error: versionError } = await supabase
        .from('versions')
        .select('document_id, marche_id, version, cree_par')
        .eq('id', versionId)
        .single();

      if (versionError) throw versionError;

      // Récupérer les données de l'utilisateur (pour le demande_par)
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
      // MODIFIÉ: "En attente de visa" -> "En attente de validation" selon le workflow demandé
      const { error: updateError } = await supabase
        .from('versions')
        .update({ 
          statut: 'En attente de validation',
          commentaire: commentaire || 'Document diffusé'
        })
        .eq('id', versionId);

      if (updateError) throw updateError;

      // Mettre à jour également le statut du document
      // et s'assurer que la version du document est synchronisée
      const { error: docUpdateError } = await supabase
        .from('documents')
        .update({ 
          statut: 'En attente de validation',
          version: versionData.version
        })
        .eq('id', versionData.document_id);

      if (docUpdateError) throw docUpdateError;

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la diffusion de la version:', error);
      return { success: false, error };
    }
  },

  // Procédure de visa (Mandataire uniquement) - Mise à jour selon le workflow
  async processVisa(versionId: string, decision: 'approuve' | 'rejete', commentaire: string) {
    try {
      // Récupérer les données de la version
      const { data: versionData, error: versionError } = await supabase
        .from('versions')
        .select('document_id, version, marche_id')
        .eq('id', versionId)
        .single();

      if (versionError) throw versionError;

      // Récupérer le visa associé à cette version
      const { data: visaData, error: visaError } = await supabase
        .from('visas')
        .select('id')
        .eq('document_id', versionData.document_id)
        .eq('version', versionData.version)
        .eq('statut', 'En attente')
        .single();

      if (visaError) {
        console.error('Erreur lors de la récupération du visa:', visaError);
        // Continuer même si on ne trouve pas de visa
      }

      // Mettre à jour le statut du visa si trouvé
      if (visaData && visaData.id) {
        await visasService.updateVisaStatus(
          visaData.id, 
          decision === 'approuve' ? 'Approuvé' : 'Rejeté', 
          commentaire
        );
      }

      // Déterminer le nouveau statut selon le workflow mis à jour
      let nouveauStatut: string;
      let documentStatut: string;
      
      if (decision === 'approuve') {
        // VSO: Mettre le document en BPE (Bon Pour Exécution)
        nouveauStatut = 'BPE';
        documentStatut = 'BPE';
      } else {
        // Pour VAO ou Refusé
        // Extraire le type de décision du commentaire
        const isVAO = commentaire.includes('VAO:');
        
        if (isVAO) {
          // VAO: Version actuelle "À remettre à jour" et création d'une nouvelle version
          nouveauStatut = 'À remettre à jour';
          documentStatut = 'En attente de diffusion';
        } else {
          // Refusé: Version actuelle "Refusée", document retourne en "En attente de diffusion"
          nouveauStatut = 'Refusé';
          documentStatut = 'En attente de diffusion';
        }
      }

      // Mettre à jour le statut de la version
      const { error: updateError } = await supabase
        .from('versions')
        .update({ 
          statut: nouveauStatut,
          commentaire: commentaire
        })
        .eq('id', versionId);

      if (updateError) throw updateError;

      // Mettre à jour également le statut du document et synchroniser la version
      const { error: docUpdateError } = await supabase
        .from('documents')
        .update({
          statut: documentStatut,
          version: versionData.version // Garder la synchronisation avec la version actuelle
        })
        .eq('id', versionData.document_id);

      if (docUpdateError) throw docUpdateError;

      // Si c'est un VAO, créer automatiquement une nouvelle version (lettre suivante)
      if (nouveauStatut === 'À remettre à jour') {
        // Obtenir la prochaine lettre de version
        const nextLetter = await this.getNextVersionLetter(versionData.document_id);
        
        // Créer une nouvelle version en attente de diffusion
        await this.addVersion({
          document_id: versionData.document_id,
          marche_id: versionData.marche_id,
          version: nextLetter,
          cree_par: "Système", // À remplacer par l'utilisateur réel
          commentaire: `Nouvelle version suite à VAO de la version ${versionData.version}`,
          statut: "En attente de diffusion"
        });
        
        // Mettre à jour le document parent avec le nouvel indice
        await supabase
          .from('documents')
          .update({
            version: nextLetter
          })
          .eq('id', versionData.document_id);
      }

      return { success: true, nouveauStatut };
    } catch (error) {
      console.error('Erreur lors du traitement du visa:', error);
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
  }
};
