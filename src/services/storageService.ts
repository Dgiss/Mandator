
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

// Fonction pour télécharger une image sur Supabase Storage
export const uploadImage = async (file: File, path: string): Promise<string | null> => {
  try {
    console.log(`Tentative d'upload d'un fichier ${file.name} dans ${path}`);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;
    
    // Vérifier que le bucket existe avant l'upload
    await ensureBucketExists('marches');
    
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('marches')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) {
      console.error('Erreur lors du téléchargement de l\'image:', uploadError);
      throw uploadError;
    }
    
    console.log("Upload réussi:", uploadData);
    
    // Récupérer l'URL publique de l'image
    const { data } = supabase.storage
      .from('marches')
      .getPublicUrl(filePath);
    
    console.log("URL publique générée:", data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    console.error('Erreur détaillée lors du téléchargement de l\'image:', error);
    return null;
  }
};

// Fonction pour obtenir l'URL publique d'un fichier
export const getPublicUrl = (bucket: string, filePath: string): string | null => {
  try {
    if (!filePath) return null;
    
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'URL publique:', error);
    return null;
  }
};

// Fonction pour supprimer un fichier du stockage
export const deleteFile = async (bucket: string, filePath: string): Promise<boolean> => {
  try {
    if (!filePath) return false;
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);
    
    if (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Erreur détaillée lors de la suppression du fichier:', error);
    return false;
  }
};

// Nouvelle fonction pour télécharger un fichier d'attachement
export const uploadAttachment = async (file: File, documentId: string): Promise<string | null> => {
  try {
    console.log(`Tentative d'upload d'une pièce jointe ${file.name} pour le document ${documentId}`);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '-')}`;
    const filePath = `documents/${documentId}/${fileName}`;
    
    // Vérifier que le bucket existe
    await ensureBucketExists('attachments');
    
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) {
      console.error('Erreur lors du téléchargement de la pièce jointe:', uploadError);
      throw uploadError;
    }
    
    console.log("Upload de pièce jointe réussi:", uploadData);
    return filePath;
  } catch (error) {
    console.error('Erreur détaillée lors du téléchargement de la pièce jointe:', error);
    return null;
  }
};

// Fonction pour s'assurer qu'un bucket existe
export const ensureBucketExists = async (bucketName: string): Promise<boolean> => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    console.log("Buckets disponibles:", buckets);
    
    if (buckets && !buckets.some(b => b.name === bucketName)) {
      console.log(`Le bucket ${bucketName} n'existe pas, création...`);
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: bucketName === 'marches', // Only make marches bucket public
        fileSizeLimit: 10485760 // 10MB limit
      });
      
      if (error) {
        console.error(`Erreur lors de la création du bucket ${bucketName}:`, error);
        return false;
      }
      console.log(`Bucket ${bucketName} créé avec succès`);
    } else {
      console.log(`Le bucket ${bucketName} existe déjà`);
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la vérification/création du bucket:', error);
    return false;
  }
};

// Fonction pour récupérer les pièces jointes d'un document
export const getDocumentAttachments = async (documentId: string) => {
  try {
    // Using type-safe approach with our Database type
    const { data, error } = await supabase
      .from('document_attachments')
      .select('*')
      .eq('document_id', documentId)
      .order('uploaded_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des pièces jointes:', error);
    return [];
  }
};

// Fonction pour télécharger un attachement
export const downloadAttachment = async (filePath: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('attachments')
      .download(filePath);
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors du téléchargement de la pièce jointe:', error);
    return null;
  }
};
