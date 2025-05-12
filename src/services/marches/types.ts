
import { Marche } from '@/services/types';

// Common interfaces and types for marches service
export interface MarcheCreateData {
  titre: string;
  description?: string | null;
  client?: string | null;
  statut: string;
  datecreation?: string | null;
  budget?: string | null;
  image?: string | null;
  logo?: string | null;
  user_id?: string | null;
  adresse?: string | null;
  ville?: string | null;
  code_postal?: string | null;
  pays?: string | null;
  region?: string | null;
  type_marche?: string | null;
  date_debut?: string | null;
  date_fin?: string | null;
  date_notification?: string | null;
  periode_preparation?: string | null;
  periode_chantier?: string | null;
  date_fin_gpa?: string | null;
  commentaire?: string | null;
}

// Re-export the Marche type for convenience
export type { Marche } from '@/services/types';
