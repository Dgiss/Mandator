
import { supabase } from '@/lib/supabase';
import { getDocumentsForMarche } from '@/utils/auth/accessControl';
import type { Document } from '../types';

/**
 * Récupère les documents d'un marché spécifique
 * Utilise la fonction sécurisée pour éviter les problèmes de récursion RLS
 * @param marcheId Identifiant du marché
 * @returns Promise<Document[]> Liste des documents
 */
export async function fetchDocumentsByMarcheId(marcheId: string): Promise<Document[]> {
  try {
    if (!marcheId) {
      console.error('ID du marché manquant');
      return [];
    }
    
    // Utiliser la fonction RPC sécurisée
    const documents = await getDocumentsForMarche(marcheId);
    return documents;
    
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    throw error;
  }
}
