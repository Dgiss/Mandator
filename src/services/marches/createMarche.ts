
import { supabase } from '@/lib/supabase';
import { Marche, MarcheCreateData } from './types';
import { fileStorage } from '../storage/fileStorage';
import { toast } from '@/hooks/use-toast';
import { clearRoleCache } from '@/hooks/userRole/roleCache';

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
    
    // Nettoyer les données d'entrée pour éviter les erreurs
    let cleanedData: Record<string, any> = {};
    
    // Copier uniquement les champs valides (non undefined/non objets complexes)
    Object.keys(marcheData).forEach(key => {
      const value = marcheData[key];
      if (value !== undefined) {
        // Convertir les objets complexes en valeurs simples
        if (value !== null && typeof value === 'object') {
          if ('_type' in value && value._type === 'undefined') {
            cleanedData[key] = null;
          } else if (typeof value.toString === 'function') {
            cleanedData[key] = value.toString();
          } else {
            cleanedData[key] = null;
          }
        } else {
          cleanedData[key] = value;
        }
      }
    });
    
    console.log("Création d'un nouveau marché avec les données:", cleanedData);
    
    // S'assurer que le titre est présent
    if (!cleanedData.titre || cleanedData.titre.trim() === '') {
      throw new Error('Le titre du marché est obligatoire');
    }
    
    // Vérifier l'existence du bucket pour les images si nécessaire
    if (cleanedData.image || cleanedData.logo) {
      try {
        await fileStorage.ensureBucketExists('marches', true);
      } catch (bucketError) {
        console.warn("Erreur non bloquante lors de la vérification du bucket:", bucketError);
      }
    }
    
    // Essayer d'utiliser la fonction RPC sécurisée d'abord (moins de problèmes de RLS)
    try {
      const { data: rpcResult, error: rpcError } = await supabase.rpc(
        'create_new_marche',
        { marche_data: cleanedData }
      );
      
      if (!rpcError) {
        console.log("Marché créé avec succès via RPC:", rpcResult);
        
        // Forcer la mise à jour du cache des droits
        clearRoleCache();
        
        return rpcResult as Marche;
      }
      
      console.warn("Impossible de créer le marché via RPC, tentative de fallback:", rpcError);
    } catch (rpcException) {
      console.warn("Exception RPC, tentative de fallback:", rpcException);
    }
    
    // Fallback: insertion directe dans la table marches
    const { data: insertResult, error: insertError } = await supabase
      .from('marches')
      .insert(cleanedData)
      .select('*')
      .single();
    
    if (insertError) {
      console.error('Erreur lors de la création du marché:', insertError);
      throw new Error(`Impossible de créer le marché: ${insertError.message}`);
    }
    
    const newMarche = insertResult as Marche;
    console.log("Marché créé avec succès via insertion directe:", newMarche);
    
    // Attribuer le rôle MOE au créateur
    if (newMarche && newMarche.id && cleanedData.user_id) {
      try {
        await supabase
          .from('droits_marche')
          .insert({
            user_id: cleanedData.user_id,
            marche_id: newMarche.id,
            role_specifique: 'MOE'
          });
        
        console.log(`Rôle MOE attribué à ${cleanedData.user_id} pour le marché ${newMarche.id}`);
        
        // Effacer le cache des rôles pour forcer une actualisation
        clearRoleCache();
      } catch (roleError) {
        console.warn('Erreur non bloquante lors de l\'attribution du rôle MOE:', roleError);
      }
    }
    
    return newMarche;
  } catch (error: any) {
    console.error('Exception lors de la création du marché:', error);
    
    const userFriendlyError = {
      message: error.message || 'Erreur lors de la création du marché',
      code: error.code || 'UNKNOWN',
      details: error.details || null
    };
    
    throw userFriendlyError;
  }
};
