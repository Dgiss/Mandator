
// Type pour un marché
export interface Marche {
  id: string;
  titre: string;
  description?: string | null;
  client?: string | null;
  statut: string;
  datecreation?: string | null;
  budget?: string | null;
  image?: string | null;
  logo?: string | null;
  user_id?: string | null;
  created_at?: string | null;
}

// Type pour une version de document
export interface Version {
  id?: string;
  document_id: string;
  marche_id: string;
  version: string;
  cree_par: string;
  date_creation?: string | null;
  taille?: string | null;
  commentaire?: string | null;
  file_path?: string | null;
  created_at?: string | null;
  statut?: string | null;
}

// Type pour un visa
export interface Visa {
  id?: string;
  document_id?: string | null;
  marche_id: string;
  version: string;
  demande_par: string;
  date_demande?: string | null;
  echeance?: string | null;
  statut?: string | null;
  commentaire?: string | null;
  attachment_path?: string | null;
  created_at?: string | null;
}

// Vous pouvez ajouter d'autres types ici si nécessaire
