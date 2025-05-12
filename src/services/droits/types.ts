
export interface UserDroit {
  id: string;
  user_id: string;
  marche_id: string;
  role_specifique: string;
  created_at: string | null;
  userInfo?: {
    email?: string;
    nom?: string;
    prenom?: string;
  };
}
