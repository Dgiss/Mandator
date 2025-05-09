
import { supabase } from '@/lib/supabase';
import { Version, DocumentAttachment } from './types';

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
      const lastLetter = lastVersion.charAt(lastVersion.length - 1);
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
        statut: version.statut || 'Actif'
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
          statut: version.statut || 'Actif'
        }])
        .select();

      if (error) {
        console.error('Error inserting version:', error);
        throw error;
      }
      
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
        statut: "Actif"
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

  // Télécharger un fichier de version
  async downloadVersionFile(filePath: string) {
    const { data, error } = await supabase.storage
      .from('versions')
      .download(filePath);

    if (error) throw error;
    return data;
  }
};
