import { Document } from "@/services/types";
import { supabase } from "@/lib/supabase";

export const marcheExists = async (marcheId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('marches')
      .select('id')
      .eq('id', marcheId)
      .single();

    if (error) {
      console.error("Erreur lors de la vérification de l'existence du marché:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'existence du marché:", error);
    return false;
  }
};

export const createDocumentSafely = async (documentData: {
  nom: string;
  description: string;
  type: string;
  marche_id: string;
  fascicule_id?: string;
  file_path: string;
  taille: string;
  designation?: string;
  geographie?: string;
  phase?: string;
  type_operation?: string;
  domaine_technique?: string;
  numero?: string;
  emetteur?: string;
  date_diffusion?: Date | null;
  date_bpe?: Date | null;
}): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .insert([
        {
          nom: documentData.nom,
          description: documentData.description,
          type: documentData.type,
          statut: 'En attente de diffusion',
          version: 'A',
          marche_id: documentData.marche_id,
          fascicule_id: documentData.fascicule_id,
          file_path: documentData.file_path,
          taille: documentData.taille,
          dateupload: new Date().toISOString(),
          designation: documentData.designation,
          geographie: documentData.geographie,
          phase: documentData.phase,
          type_operation: documentData.type_operation,
          domaine_technique: documentData.domaine_technique,
          numero: documentData.numero,
          emetteur: documentData.emetteur,
          date_diffusion: documentData.date_diffusion,
          date_bpe: documentData.date_bpe,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Erreur lors de la création sécurisée du document:", error);
      throw error;
    }

    return data.id;
  } catch (error) {
    console.error("Erreur lors de la création sécurisée du document:", error);
    throw error;
  }
};
