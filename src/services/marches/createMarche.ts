
import { supabase } from '@/lib/supabase';
import { Marche, MarcheCreateData } from './types';
import { fileStorage } from '../storage/fileStorage';
import { toast } from '@/hooks/use-toast';

/**
 * Créer un nouveau marché
 * @param {MarcheCreateData} marcheData Les données du marché à créer
 * @returns {Promise<Marche | null>} Le marché créé ou null en cas d'erreur
 */
export const createMarche = async (marcheData: MarcheCreateData): Promise<Marche | null> => {
  try {
    console.log("Préparation de la création du marché...");
    
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
    
    // Nettoyer les valeurs undefined qui peuvent causer des problèmes
    Object.keys(marcheData).forEach(key => {
      if (marcheData[key] === undefined) {
        delete marcheData[key];
      }
    });
    
    // Traitement spécial pour les champs pays et région qui montrent des erreurs
    if (marcheData.pays !== null && typeof marcheData.pays === 'object' && 
        marcheData.pays && '_type' in marcheData.pays && marcheData.pays._type === 'undefined') {
      marcheData.pays = null;
    }
    
    if (marcheData.region !== null && typeof marcheData.region === 'object' && 
        marcheData.region && '_type' in marcheData.region && marcheData.region._type === 'undefined') {
      marcheData.region = null;
    }
    
    console.log("Création d'un nouveau marché avec les données:", marcheData);
    
    // Assurer que les buckets nécessaires existent avant d'insérer le marché
    if (marcheData.image || marcheData.logo) {
      await fileStorage.ensureBucketExists('marches', true);
    }
    
    // Variable pour stocker le résultat final
    let resultData: Marche | null = null;
    
    // Utiliser la méthode RPC au lieu d'une insertion directe pour contourner les problèmes de RLS
    const { data, error } = await supabase.rpc("create_new_marche" as any, {
      marche_data: marcheData
    });
    
    if (error) {
      console.error('Erreur lors de la création du marché via RPC:', error);
      
      // Essayer la méthode d'insertion directe comme fallback
      const insertResult = await supabase
        .from('marches')
        .insert(marcheData)
        .select()
        .single();
      
      if (insertResult.error) {
        // Gestion spécifique selon le type d'erreur
        if (insertResult.error.code === '42P17') {
          console.error('Erreur RLS détectée:', insertResult.error);
          throw new Error('Problème d\'accès à la base de données - Contactez l\'administrateur');
        } else if (insertResult.error.code === '23505') {
          console.error('Conflit de données:', insertResult.error);
          throw new Error('Un marché avec ces informations existe déjà');
        } else {
          console.error('Erreur lors de la création du marché:', insertResult.error);
          throw new Error(`Impossible de créer le marché: ${insertResult.error.message}`);
        }
      }
      
      if (!insertResult.data) {
        throw new Error('Aucune donnée retournée après la création du marché');
      }
      
      resultData = insertResult.data as Marche;
    } else {
      // Use type assertion with unknown as intermediate step for type safety
      resultData = data as unknown as Marche;
    }
    
    console.log("Marché créé avec succès:", resultData);
    
    // Si marché créé avec succès, attribuer automatiquement les droits de MOE au créateur
    if (resultData && typeof resultData === 'object' && 'id' in resultData && resultData.id && marcheData.user_id) {
      try {
        await supabase.rpc("assign_role_to_user" as any, {
          user_id: marcheData.user_id,
          marche_id: resultData.id,
          role_specifique: 'MOE'
        });
        console.log(`Rôle MOE attribué à ${marcheData.user_id} pour le marché ${resultData.id}`);
      } catch (roleError) {
        console.error('Erreur lors de l\'attribution du rôle MOE au créateur:', roleError);
        // On continue même en cas d'erreur d'attribution de rôle
      }
    }
    
    return resultData;
    
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
