
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
  attachments?: DocumentAttachment[]; // New field for attachments
  documents?: { nom: string } | { error: boolean } | any; // Updated to handle error cases
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

// Type pour un fascicule 
export interface Fascicule {
  id: string;
  nom: string;
  nombredocuments: number;
  datemaj: string;
  progression: number;
  description?: string;
  marche_id: string;
}

// Nouveau type pour les pièces jointes
export interface DocumentAttachment {
  id?: string;
  document_id: string;
  version_id?: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: string;
  uploaded_at?: string;
}

// Type pour un document
export interface Document {
  id: string;
  nom: string;
  type: string;
  statut: string; // Using string type to match Supabase
  version: string;
  dateupload?: string; // Using lowercase to match Supabase column name
  taille?: string;
  description?: string;
  fascicule_id?: string;
  marche_id: string;
  file_path?: string;
  created_at?: string;
  
  // Nouveaux champs
  designation?: string;
  geographie?: string;
  phase?: string;
  emetteur?: string; // Gardé dans le type mais sera rempli automatiquement
  numero_operation?: string;
  domaine_technique?: string;
  numero?: string;
  date_diffusion?: string;
  date_bpe?: string;
  attachments?: DocumentAttachment[]; // New field for attachments
}

// Types pour les rôles utilisateur
export type UserRole = 'MANDATAIRE' | 'MOE' | 'STANDARD';

// Type pour un utilisateur étendu avec rôle
export interface UserWithRole {
  id: string;
  email?: string;
  nom?: string;
  prenom?: string;
  role: UserRole;
  entreprise?: string;
}

// Types de visa disponibles
export type VisaType = 'VISA_SIMPLE' | 'BON_POUR_EXECUTION' | 'APPROUVE' | 'REJETE';

// États possible d'un document dans le workflow
export type DocumentStatus = 
  | 'En attente de diffusion'
  | 'En attente de visa'
  | 'Approuvé'
  | 'Rejeté';
