
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

export type Situation = Database['public']['Tables']['situations']['Row'];
export type SituationInsert = Database['public']['Tables']['situations']['Insert'];
export type SituationUpdate = Database['public']['Tables']['situations']['Update'];

/**
 * Récupère toutes les situations d'un marché
 */
export const getSituationsForMarche = async (marcheId: string) => {
  const { data, error } = await supabase
    .from('situations')
    .select('*')
    .eq('marche_id', marcheId)
    .order('numero', { ascending: false });

  if (error) {
    console.error('Erreur lors de la récupération des situations:', error);
    throw error;
  }

  return data;
};

/**
 * Récupère une situation par son ID
 */
export const getSituationById = async (situationId: string) => {
  const { data, error } = await supabase
    .from('situations')
    .select('*')
    .eq('id', situationId)
    .single();

  if (error) {
    console.error(`Erreur lors de la récupération de la situation ${situationId}:`, error);
    throw error;
  }

  return data;
};

/**
 * Crée une nouvelle situation
 */
export const createSituation = async (situation: SituationInsert) => {
  const { data, error } = await supabase
    .from('situations')
    .insert(situation)
    .select()
    .single();

  if (error) {
    console.error('Erreur lors de la création de la situation:', error);
    throw error;
  }

  return data;
};

/**
 * Met à jour une situation existante
 */
export const updateSituation = async (situationId: string, updates: SituationUpdate) => {
  const { data, error } = await supabase
    .from('situations')
    .update(updates)
    .eq('id', situationId)
    .select()
    .single();

  if (error) {
    console.error(`Erreur lors de la mise à jour de la situation ${situationId}:`, error);
    throw error;
  }

  return data;
};

/**
 * Supprime une situation
 */
export const deleteSituation = async (situationId: string) => {
  const { error } = await supabase
    .from('situations')
    .delete()
    .eq('id', situationId);

  if (error) {
    console.error(`Erreur lors de la suppression de la situation ${situationId}:`, error);
    throw error;
  }

  return true;
};
