
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
  reference?: string | null;
}

// Vous pouvez ajouter d'autres types ici si nécessaire
