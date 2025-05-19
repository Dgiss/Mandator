
import { supabase } from '@/lib/supabase';

/**
 * Vérifie si un marché existe
 * Fonction optimisée pour éviter les problèmes de récursion dans les politiques RLS
 * @param id Identifiant du marché
 * @returns Promise<boolean> Vrai si le marché existe
 */
export const marcheExists = async (id: string): Promise<boolean> => {
  try {
    // Utiliser la fonction non-récursive pour obtenir les marchés accessibles
    const { data: accessibleMarches, error: rpcError } = await supabase.rpc('get_accessible_marches');
    
    if (rpcError) {
      console.error('Erreur lors de la récupération des marchés accessibles via RPC:', rpcError);
      
      // Plan B: Tentative directe avec une requête sécurisée
      const { data, error } = await supabase
        .from('marches')
        .select('id')
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error(`Erreur lors de la vérification directe de l'existence du marché ${id}:`, error);
        return false;
      }
      
      return !!data;
    }
    
    // Vérifier si le marché demandé est dans la liste des marchés accessibles
    if (Array.isArray(accessibleMarches)) {
      return accessibleMarches.some(marche => marche.id === id);
    }
    
    return false;
  } catch (error) {
    console.error('Exception lors de la vérification du marché:', error);
    return false;
  }
};

/**
 * Vérifie si l'utilisateur a accès à un marché spécifique
 * @param marcheId Identifiant du marché
 * @returns Promise<boolean> Vrai si l'utilisateur a accès
 */
export const userHasAccessToMarche = async (marcheId: string): Promise<boolean> => {
  try {
    // Utiliser la fonction RPC non-récursive pour obtenir les marchés
    const { data, error } = await supabase.rpc('get_accessible_marches');
    
    if (error) {
      console.error('Erreur lors de la vérification des accès via RPC:', error);
      return false;
    }
    
    if (!Array.isArray(data)) {
      return false;
    }
    
    return data.some(marche => marche.id === marcheId);
  } catch (error) {
    console.error('Exception lors de la vérification des accès:', error);
    return false;
  }
};

/**
 * Crée un document en utilisant la fonction sécurisée
 * @param documentData Données du document à créer
 * @returns Promise<string> Identifiant du document créé
 */
export const createDocumentSafely = async (documentData: {
  nom: string;
  type: string;
  marche_id: string;
  description?: string;
  statut?: string;
  version?: string;
  fascicule_id?: string;
  file_path?: string;
  taille?: string;
  designation?: string;
  geographie?: string;
  phase?: string;
  numero_operation?: string;
  domaine_technique?: string;
  numero?: string;
  emetteur?: string;
  date_diffusion?: Date | null;
  date_bpe?: Date | null;
}): Promise<string> => {
  try {
    // Convert Date objects to ISO strings for PostgreSQL compatibility
    const date_diffusion = documentData.date_diffusion ? documentData.date_diffusion.toISOString() : null;
    const date_bpe = documentData.date_bpe ? documentData.date_bpe.toISOString() : null;
    
    const { data, error } = await supabase.rpc('create_document_safely', {
      p_nom: documentData.nom,
      p_type: documentData.type,
      p_marche_id: documentData.marche_id,
      p_description: documentData.description || null,
      p_statut: documentData.statut || 'En attente de diffusion',
      p_version: documentData.version || 'A',
      p_fascicule_id: documentData.fascicule_id || null,
      p_file_path: documentData.file_path || null,
      p_taille: documentData.taille || '0 KB',
      p_designation: documentData.designation || null,
      p_geographie: documentData.geographie || null,
      p_phase: documentData.phase || null,
      p_numero_operation: documentData.numero_operation || null,
      p_domaine_technique: documentData.domaine_technique || null,
      p_numero: documentData.numero || null,
      p_emetteur: documentData.emetteur || null,
      p_date_diffusion: date_diffusion,
      p_date_bpe: date_bpe
    });

    if (error) {
      console.error('Erreur lors de la création du document:', error);
      throw new Error(`Erreur lors de la création du document: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Exception lors de la création du document:', error);
    throw error;
  }
};
