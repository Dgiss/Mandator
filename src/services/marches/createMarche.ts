
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
    
    // Nettoyer les valeurs undefined qui peuvent causer des problèmes
    const cleanedData = { ...marcheData };
    Object.keys(cleanedData).forEach(key => {
      if (cleanedData[key] === undefined) {
        delete cleanedData[key];
      }
    });
    
    // Traitement pour les champs pays et région qui peuvent causer des erreurs
    if (cleanedData.pays !== null && 
        typeof cleanedData.pays === 'object' && 
        cleanedData.pays !== undefined) {
      if ('_type' in (cleanedData.pays as any) && (cleanedData.pays as any)._type === 'undefined') {
        cleanedData.pays = null;
      }
    }
    
    if (cleanedData.region !== null && 
        typeof cleanedData.region === 'object' && 
        cleanedData.region !== undefined) {
      if ('_type' in (cleanedData.region as any) && (cleanedData.region as any)._type === 'undefined') {
        cleanedData.region = null;
      }
    }
    
    console.log("Création d'un nouveau marché avec les données:", cleanedData);
    
    // Assurer que les buckets nécessaires existent avant d'insérer le marché
    if (cleanedData.image || cleanedData.logo) {
      try {
        await fileStorage.ensureBucketExists('marches', true);
        console.log("Vérification du bucket marches terminée");
      } catch (bucketError) {
        // En cas d'erreur liée au bucket, on continue quand même
        console.warn("Erreur non bloquante lors de la vérification des buckets:", bucketError);
      }
    }
    
    // Vérifier si le titre existe et n'est pas vide
    if (!cleanedData.titre || cleanedData.titre.trim() === '') {
      throw new Error('Le titre du marché est obligatoire');
    }
    
    // Préparer les données pour l'insertion en s'assurant que les types sont corrects
    const insertableData = {
      titre: cleanedData.titre,
      description: cleanedData.description || null,
      client: cleanedData.client || null,
      statut: cleanedData.statut || 'En attente',
      budget: cleanedData.budget || null,
      image: cleanedData.image || null,
      logo: cleanedData.logo || null,
      user_id: cleanedData.user_id,
      datecreation: cleanedData.datecreation
    };
    
    // Ajouter les champs optionnels s'ils existent
    if (cleanedData.type_marche) insertableData['type_marche'] = cleanedData.type_marche;
    if (cleanedData.adresse) insertableData['adresse'] = cleanedData.adresse;
    if (cleanedData.ville) insertableData['ville'] = cleanedData.ville;
    if (cleanedData.code_postal) insertableData['code_postal'] = cleanedData.code_postal;
    if (cleanedData.pays && typeof cleanedData.pays === 'string') insertableData['pays'] = cleanedData.pays;
    if (cleanedData.region && typeof cleanedData.region === 'string') insertableData['region'] = cleanedData.region;
    if (cleanedData.date_debut) insertableData['date_debut'] = cleanedData.date_debut;
    if (cleanedData.date_fin) insertableData['date_fin'] = cleanedData.date_fin;
    if (cleanedData.date_notification) insertableData['date_notification'] = cleanedData.date_notification;
    if (cleanedData.periode_preparation) insertableData['periode_preparation'] = cleanedData.periode_preparation;
    if (cleanedData.periode_chantier) insertableData['periode_chantier'] = cleanedData.periode_chantier;
    if (cleanedData.date_fin_gpa) insertableData['date_fin_gpa'] = cleanedData.date_fin_gpa;
    if (cleanedData.commentaire) insertableData['commentaire'] = cleanedData.commentaire;
    
    // Variable pour stocker le résultat final
    let resultData: Marche | null = null;
    
    // Insertion directe - plus simple et moins propice aux erreurs
    const insertResult = await supabase
      .from('marches')
      .insert(insertableData)
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
    console.log("Marché créé avec succès:", resultData);
    
    // Si marché créé avec succès, on s'assure qu'il y a bien des droits
    if (resultData && typeof resultData === 'object' && 'id' in resultData && resultData.id && cleanedData.user_id) {
      try {
        // Attribuer directement le rôle MOE à l'utilisateur, sans vérification (optimisation)
        await supabase
          .from('droits_marche')
          .insert({
            user_id: cleanedData.user_id,
            marche_id: resultData.id,
            role_specifique: 'MOE'
          });
        console.log(`Rôle MOE attribué à ${cleanedData.user_id} pour le marché ${resultData.id}`);
        
        // Effacer le cache des rôles pour forcer une actualisation
        clearRoleCache();
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
