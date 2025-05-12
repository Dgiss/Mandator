
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, userData?: { nom?: string; prenom?: string; entreprise?: string; email?: string }) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: { nom?: string; prenom?: string; entreprise?: string; email?: string }) => Promise<{ error: any | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // If session changed and user exists, fetch profile
        if (currentSession?.user) {
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // Fetch profile if user is logged in
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
      }
      
      setLoading(false);
    });

    // Clean up the subscription when the component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Function to fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erreur lors du chargement du profil:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(`Erreur de connexion: ${error.message}`);
        return { error };
      }

      toast.success('Connexion réussie !');
      return { error: null };
    } catch (error: any) {
      toast.error(`Erreur de connexion: ${error.message}`);
      return { error };
    }
  };

  // Sign up function
  const signUp = async (
    email: string, 
    password: string, 
    userData?: { nom?: string; prenom?: string; entreprise?: string; email?: string }
  ) => {
    try {
      // Add email to user metadata
      const userMetadata = {
        ...userData,
        email: email
      };

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userMetadata
        }
      });

      if (error) {
        toast.error(`Erreur d'inscription: ${error.message}`);
        return { error };
      }

      toast.success('Inscription réussie ! Veuillez vérifier votre email.');
      return { error: null };
    } catch (error: any) {
      toast.error(`Erreur d'inscription: ${error.message}`);
      return { error };
    }
  };

  // Sign out function - Fixed to handle session state properly
  const signOut = async () => {
    try {
      // First update local state to prevent multiple logout attempts
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Then perform the actual signout
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erreur lors de la déconnexion:', error);
        toast.error(`Erreur de déconnexion: ${error.message}`);
        return;
      }
      
      toast.success('Déconnexion réussie !');
    } catch (error: any) {
      console.error('Exception lors de la déconnexion:', error);
      toast.error(`Erreur de déconnexion: ${error.message}`);
    }
  };

  // Update profile function
  const updateProfile = async (data: { nom?: string; prenom?: string; entreprise?: string; email?: string }) => {
    if (!user) {
      return { error: { message: "Aucun utilisateur connecté" } };
    }

    try {
      // Update email in auth.users if email was changed
      if (data.email && data.email !== user.email) {
        const { error: updateAuthError } = await supabase.auth.updateUser({
          email: data.email
        });

        if (updateAuthError) {
          toast.error(`Erreur de mise à jour de l'email: ${updateAuthError.message}`);
          return { error: updateAuthError };
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) {
        toast.error(`Erreur de mise à jour du profil: ${error.message}`);
        return { error };
      }

      // Update profile in state
      fetchUserProfile(user.id);
      toast.success('Profil mis à jour avec succès !');
      return { error: null };
    } catch (error: any) {
      toast.error(`Erreur de mise à jour du profil: ${error.message}`);
      return { error };
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        session, 
        user, 
        profile, 
        loading, 
        signIn, 
        signUp, 
        signOut, 
        updateProfile 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
