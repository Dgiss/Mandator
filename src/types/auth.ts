
import { Session, User } from '@supabase/supabase-js';

// Auth context related types
export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (
    email: string, 
    password: string, 
    userData?: { 
      nom?: string; 
      prenom?: string; 
      entreprise?: string; 
      email?: string 
    }
  ) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: { 
    nom?: string; 
    prenom?: string; 
    entreprise?: string; 
    email?: string 
  }) => Promise<{ error: any | null }>;
}

export interface UserProfileData {
  nom?: string;
  prenom?: string;
  entreprise?: string;
  email?: string;
}
