
import { fileStorage } from '../storage/fileStorage';

/**
 * Service pour la gestion des uploads d'images
 */
export const imageUploader = {
  /**
   * Télécharge une image de couverture pour un marché
   * @param file Fichier image à uploader
   * @returns URL publique de l'image ou null en cas d'échec
   */
  async uploadCoverImage(file: File): Promise<string | null> {
    try {
      console.log(`Tentative d'upload d'un fichier ${file.name} dans covers`);
      
      // S'assurer que le bucket marches existe
      await fileStorage.ensureBucketExists('marches', true);
      
      // Upload le fichier
      const result = await fileStorage.uploadFile('marches', 'covers', file);
      
      if (!result) {
        throw new Error("Échec de l'upload de l'image de couverture");
      }
      
      console.log('Upload réussi:', result);
      
      // Générer l'URL publique
      const publicUrl = fileStorage.getPublicUrl('marches', result.path);
      console.log('URL publique générée:', publicUrl);
      
      return publicUrl;
    } catch (error) {
      console.error("Erreur lors de l'upload de l'image de couverture:", error);
      return null;
    }
  },
  
  /**
   * Télécharge un logo pour un marché
   * @param file Fichier image à uploader
   * @returns URL publique du logo ou null en cas d'échec
   */
  async uploadLogoImage(file: File): Promise<string | null> {
    try {
      console.log(`Tentative d'upload d'un fichier ${file.name} dans logos`);
      
      // S'assurer que le bucket marches existe
      await fileStorage.ensureBucketExists('marches', true);
      
      // Upload le fichier
      const result = await fileStorage.uploadFile('marches', 'logos', file);
      
      if (!result) {
        throw new Error("Échec de l'upload du logo");
      }
      
      console.log('Upload réussi:', result);
      
      // Générer l'URL publique
      const publicUrl = fileStorage.getPublicUrl('marches', result.path);
      console.log('URL publique générée:', publicUrl);
      
      return publicUrl;
    } catch (error) {
      console.error("Erreur lors de l'upload du logo:", error);
      return null;
    }
  },
  
  /**
   * Télécharge un document pour un marché
   * @param file Fichier à uploader
   * @param marcheId ID du marché
   * @returns URL publique du document ou null en cas d'échec
   */
  async uploadDocument(file: File, marcheId: string): Promise<string | null> {
    try {
      console.log(`Tentative d'upload d'un document ${file.name} pour le marché ${marcheId}`);
      
      // S'assurer que le bucket marches existe
      await fileStorage.ensureBucketExists('marches', true);
      
      // Créer un dossier spécifique pour les documents de ce marché
      const folderPath = `documents/${marcheId}`;
      
      // Upload le fichier
      const result = await fileStorage.uploadFile('marches', folderPath, file);
      
      if (!result) {
        throw new Error("Échec de l'upload du document");
      }
      
      console.log('Upload réussi:', result);
      
      // Générer l'URL publique
      const publicUrl = fileStorage.getPublicUrl('marches', result.path);
      console.log('URL publique générée:', publicUrl);
      
      return publicUrl;
    } catch (error) {
      console.error("Erreur lors de l'upload du document:", error);
      return null;
    }
  }
};
