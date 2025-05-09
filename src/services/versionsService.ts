
import { supabase } from '@/lib/supabase';
import { Version } from './types';

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
  async addVersion(version: Version, file?: File) {
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
      
      console.log('Version created successfully:', data);
      return data[0];
    } catch (error) {
      console.error('Erreur lors de la création de la version:', error);
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
