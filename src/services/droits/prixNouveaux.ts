
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

export type PrixNouveau = Database['public']['Tables']['prix_nouveaux']['Row'];
export type PrixNouveauInsert = Database['public']['Tables']['prix_nouveaux']['Insert'];
export type PrixNouveauUpdate = Database['public']['Tables']['prix_nouveaux']['Update'];

/**
 * Récupère tous les prix nouveaux d'un marché
 */
export const getPrixNouveauxForMarche = async (marcheId: string) => {
  const { data, error } = await supabase
    .from('prix_nouveaux')
    .select('*')
    .eq('marche_id', marcheId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur lors de la récupération des prix nouveaux:', error);
    throw error;
  }

  return data;
};

/**
 * Récupère un prix nouveau par son ID
 */
export const getPrixNouveauById = async (prixNouveauId: string) => {
  const { data, error } = await supabase
    .from('prix_nouveaux')
    .select('*')
    .eq('id', prixNouveauId)
    .single();

  if (error) {
    console.error(`Erreur lors de la récupération du prix nouveau ${prixNouveauId}:`, error);
    throw error;
  }

  return data;
};

/**
 * Crée un nouveau prix nouveau
 */
export const createPrixNouveau = async (prixNouveau: PrixNouveauInsert) => {
  const { data, error } = await supabase
    .from('prix_nouveaux')
    .insert(prixNouveau)
    .select()
    .single();

  if (error) {
    console.error('Erreur lors de la création du prix nouveau:', error);
    throw error;
  }

  return data;
};

/**
 * Met à jour un prix nouveau existant
 */
export const updatePrixNouveau = async (prixNouveauId: string, updates: PrixNouveauUpdate) => {
  const { data, error } = await supabase
    .from('prix_nouveaux')
    .update(updates)
    .eq('id', prixNouveauId)
    .select()
    .single();

  if (error) {
    console.error(`Erreur lors de la mise à jour du prix nouveau ${prixNouveauId}:`, error);
    throw error;
  }

  return data;
};

/**
 * Supprime un prix nouveau
 */
export const deletePrixNouveau = async (prixNouveauId: string) => {
  const { error } = await supabase
    .from('prix_nouveaux')
    .delete()
    .eq('id', prixNouveauId);

  if (error) {
    console.error(`Erreur lors de la suppression du prix nouveau ${prixNouveauId}:`, error);
    throw error;
  }

  return true;
};
