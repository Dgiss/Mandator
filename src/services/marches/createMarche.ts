
import { supabase } from '@/lib/supabase';
import { Marche, MarcheCreateData } from './types';
import { fileStorage } from '../storage/fileStorage';

/**
 * Créer un nouveau marché
 * @param {MarcheCreateData} marcheData Les données du marché à créer
 * @returns {Promise<Marche | null>} Le marché créé ou null en cas d'erreur
 */
export const createMarche = async (marcheData: MarcheCreateData): Promise<Marche | null> => {
  try {
    // Ajout de la date de création si non fournie
    if (!marcheData.datecreation) {
      marcheData.datecreation = new Date().toISOString();
    }
    
    // Assurer que le user_id est défini
    if (!marcheData.user_id) {
      const { data: { user } } = await supabase.auth.getUser();
      marcheData.user_id = user?.id;
      
      if (!marcheData.user_id) {
        console.error('Création de marché impossible : utilisateur non connecté');
        throw new Error('Utilisateur non connecté');
      }
    }
    
    console.log("Création d'un nouveau marché avec les données:", marcheData);
    
    // Assurer que les buckets nécessaires existent avant d'insérer le marché
    if (marcheData.image || marcheData.logo) {
      await fileStorage.ensureBucketExists('marches', true);
    }
    
    // Utilisation d'un try/catch spécifique pour l'insertion 
    // pour capturer les erreurs précises
    try {
      const { data, error } = await supabase
        .from('marches')
        .insert(marcheData)
        .select()
        .single();
      
      if (error) {
        if (error.code === '42P17') {
          console.error('Erreur de récursion infinie détectée dans la politique RLS:', error);
          throw new Error('Erreur de configuration RLS - Contactez le support technique.');
        } else {
          console.error('Erreur lors de la création du marché:', error);
          throw error;
        }
      }
      
      console.log("Marché créé avec succès:", data);
      
      // Après la création réussie, attribuer automatiquement les droits de MOE au créateur
      if (data && data.id && marcheData.user_id) {
        try {
          await supabase.rpc('assign_role_to_user', {
            user_id: marcheData.user_id,
            marche_id: data.id,
            role_specifique: 'MOE'
          });
          console.log(`Rôle MOE attribué à ${marcheData.user_id} pour le marché ${data.id}`);
        } catch (roleError) {
          console.error('Erreur lors de l\'attribution du rôle MOE au créateur:', roleError);
          // On continue même en cas d'erreur d'attribution de rôle
        }
      }
      
      return data as Marche;
    } catch (insertError) {
      // Capture spécifique de l'erreur d'insertion
      console.error('Exception lors de l\'insertion du marché:', insertError);
      throw insertError;
    }
  } catch (error: any) {
    console.error('Exception lors de la création du marché:', error);
    
    // Transformer l'erreur pour l'affichage utilisateur
    const userFriendlyError = {
      message: error.message || 'Erreur lors de la création du marché',
      code: error.code || 'UNKNOWN',
      details: error.details || null
    };
    
    throw userFriendlyError;
  }
};
