
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

// Instead of defining Notification here, import it if needed
// import type { Notification } from './types/notifications';
// export type { Notification };

export interface Alerte {
  id: string;
  type: string;
  delai_jours: number;
  marche_id: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}
