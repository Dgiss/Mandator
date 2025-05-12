
import { supabase } from '@/lib/supabase';
import { Marche, MarcheCreateData } from './types';

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
    }
    
    console.log("Création d'un nouveau marché avec les données:", marcheData);
    
    const { data, error } = await supabase
      .from('marches')
      .insert(marcheData)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la création du marché:', error);
      throw error;
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
  } catch (error) {
    console.error('Exception lors de la création du marché:', error);
    throw error;
  }
};
