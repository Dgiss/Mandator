
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

export interface Notification {
  id: string;
  user_id: string;
  titre: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  lue: boolean;
  objet_type: string;
  objet_id: string;
  marche_id: string;
  created_at: string;
}

export interface Alerte {
  id: string;
  type: string;
  delai_jours: number;
  marche_id: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}
