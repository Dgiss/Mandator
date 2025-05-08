

export interface Version {
  id: string;
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

export interface DocumentStatus {
  id: string;
  nom: string;
  statut: 'En attente de diffusion' | 'En attente de validation' | 'Validé' | 'Refusé';
}

export interface VersionStatus {
  id: string;
  version: string;
  statut: 'En attente de diffusion' | 'En attente de visa' | 'BPE' | 'À remettre à jour' | 'Refusé';
}

export interface UserProfile {
  id: string;
  nom?: string | null;
  prenom?: string | null;
  role?: string | null;
  entreprise?: string | null;
  role_utilisateur?: string | null;
}

export interface Marche {
  id: string;
  titre: string;
  description?: string | null;
  client?: string | null;
  statut: string;
  datecreation?: string | null;
  budget?: string | null;
  image?: string | null;
  reference?: string | null;
  logo?: string | null;
  user_id?: string | null;
  created_at?: string | null;
}

