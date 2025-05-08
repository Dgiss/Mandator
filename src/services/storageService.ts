
import { supabase } from '@/lib/supabase';

// Fonction pour télécharger une image sur Supabase Storage
export const uploadImage = async (file: File, path: string): Promise<string | null> => {
  try {
    console.log(`Tentative d'upload d'un fichier ${file.name} dans ${path}`);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;
    
    // Check that the bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    console.log("Buckets disponibles avant upload:", buckets);
    
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
