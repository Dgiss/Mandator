
import { Session, User } from '@supabase/supabase-js';

// Auth context related types
export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any | null;
  loading: boolean;
  loginInProgress?: boolean;
  authError?: string | null;
  connectionStatus?: 'unknown' | 'connected' | 'disconnected';
  signIn: (email: string, password: string) => Promise<{ error: any | null; data?: any }>;
  signUp: (
    email: string, 
    password: string, 
    userData?: { 
      nom?: string; 
      prenom?: string; 
      entreprise?: string; 
      email?: string 
    }
  ) => Promise<{ error: any | null; data?: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: { 
    nom?: string; 
    prenom?: string; 
    entreprise?: string; 
    email?: string 
  }) => Promise<{ error: any | null }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error: any | null }>;
  refreshProfile?: () => void;
}

export interface UserProfileData {
  nom?: string;
  prenom?: string;
  entreprise?: string;
  email?: string;
}
