
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

export type OrdreService = Database['public']['Tables']['ordres_service']['Row'];
export type OrdreServiceInsert = Database['public']['Tables']['ordres_service']['Insert'];
export type OrdreServiceUpdate = Database['public']['Tables']['ordres_service']['Update'];

/**
 * Récupère tous les ordres de service d'un marché
 */
export const getOrdresServiceForMarche = async (marcheId: string) => {
  const { data, error } = await supabase
    .from('ordres_service')
    .select('*')
    .eq('marche_id', marcheId)
    .order('date_emission', { ascending: false });

  if (error) {
    console.error('Erreur lors de la récupération des ordres de service:', error);
    throw error;
  }

  return data;
};

/**
 * Récupère un ordre de service par son ID
 */
export const getOrdreServiceById = async (ordreServiceId: string) => {
  const { data, error } = await supabase
    .from('ordres_service')
    .select('*')
    .eq('id', ordreServiceId)
    .single();

  if (error) {
    console.error(`Erreur lors de la récupération de l'ordre de service ${ordreServiceId}:`, error);
    throw error;
  }

  return data;
};

/**
 * Crée un nouvel ordre de service
 */
export const createOrdreService = async (ordreService: OrdreServiceInsert) => {
  const { data, error } = await supabase
    .from('ordres_service')
    .insert(ordreService)
    .select()
    .single();

  if (error) {
    console.error('Erreur lors de la création de l\'ordre de service:', error);
    throw error;
  }

  return data;
};

/**
 * Met à jour un ordre de service existant
 */
export const updateOrdreService = async (ordreServiceId: string, updates: OrdreServiceUpdate) => {
  const { data, error } = await supabase
    .from('ordres_service')
    .update(updates)
    .eq('id', ordreServiceId)
    .select()
    .single();

  if (error) {
    console.error(`Erreur lors de la mise à jour de l'ordre de service ${ordreServiceId}:`, error);
    throw error;
  }

  return data;
};

/**
 * Supprime un ordre de service
 */
export const deleteOrdreService = async (ordreServiceId: string) => {
  const { error } = await supabase
    .from('ordres_service')
    .delete()
    .eq('id', ordreServiceId);

  if (error) {
    console.error(`Erreur lors de la suppression de l'ordre de service ${ordreServiceId}:`, error);
    throw error;
  }

  return true;
};
