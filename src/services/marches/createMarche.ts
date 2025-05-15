
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
    
    // Traitement pour les champs pays et région qui peuvent causer des erreurs
    if (marcheData.pays !== null && 
        typeof marcheData.pays === 'object' && 
        marcheData.pays !== undefined) {
      if ('_type' in (marcheData.pays as any) && (marcheData.pays as any)._type === 'undefined') {
        marcheData.pays = null;
      }
    }
    
    if (marcheData.region !== null && 
        typeof marcheData.region === 'object' && 
        marcheData.region !== undefined) {
      if ('_type' in (marcheData.region as any) && (marcheData.region as any)._type === 'undefined') {
        marcheData.region = null;
      }
    }
    
    console.log("Création d'un nouveau marché avec les données:", marcheData);
    
    // Assurer que les buckets nécessaires existent avant d'insérer le marché
    try {
      if (marcheData.image || marcheData.logo) {
        await fileStorage.ensureBucketExists('marches', true);
        console.log("Vérification du bucket marches terminée");
      }
    } catch (bucketError) {
      // En cas d'erreur liée au bucket, on continue quand même
      console.warn("Erreur non bloquante lors de la vérification des buckets:", bucketError);
    }
    
    // Variable pour stocker le résultat final
    let resultData: Marche | null = null;
    
    // Utiliser la méthode RPC au lieu d'une insertion directe
    try {
      // S'assurer que marcheData a toutes les propriétés requises
      const rpcData = {
        ...marcheData,
        titre: marcheData.titre || '' // Assurer que titre existe et n'est pas undefined
      };
      
      const { data, error } = await supabase.rpc("create_new_marche", {
        marche_data: rpcData
      });
      
      if (error) {
        console.error('Erreur lors de la création du marché via RPC:', error);
        throw error;
      }
      
      // Conversion du résultat avec typage sécurisé
      resultData = data as unknown as Marche;
      console.log("Marché créé avec succès via RPC:", resultData);
    } catch (rpcError) {
      console.error('Exception lors de l\'appel RPC:', rpcError);
      
      // Fallback: essayer la méthode d'insertion directe
      console.log("Tentative d'insertion directe dans la table marches...");
      
      // S'assurer que marcheData a toutes les propriétés requises pour l'insertion
      // Typescript attend un objet avec une structure spécifique, pas juste Record<string, any>
      const insertData = {
        ...marcheData,
        titre: marcheData.titre || '' // Assurer que titre existe et n'est pas undefined
      };
      
      const insertResult = await supabase
        .from('marches')
        .insert(insertData)
        .select('*')
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
      
      resultData = insertResult.data as Marche;
      console.log("Marché créé avec succès via insertion directe:", resultData);
    }
    
    // Si marché créé avec succès, on s'assure qu'il y a bien des droits
    if (resultData && typeof resultData === 'object' && 'id' in resultData && resultData.id && marcheData.user_id) {
      try {
        // Vérifier si les droits existent déjà
        const { data: existingRights } = await supabase
          .from('droits_marche')
          .select('*')
          .eq('user_id', marcheData.user_id)
          .eq('marche_id', resultData.id)
          .single();
        
        // Si pas de droits, on les crée
        if (!existingRights) {
          await supabase
            .from('droits_marche')
            .insert({
              user_id: marcheData.user_id,
              marche_id: resultData.id,
              role_specifique: 'MOE'
            });
          console.log(`Rôle MOE attribué à ${marcheData.user_id} pour le marché ${resultData.id}`);
        }
      } catch (roleError) {
        console.error('Erreur non bloquante lors de l\'attribution du rôle MOE:', roleError);
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
