
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
    // Configurer l'écouteur d'événements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // En cas de changement d'état d'authentification, charger le profil utilisateur
        if (currentSession?.user) {
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // Vérifier s'il existe une session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // Charger le profil utilisateur s'il est connecté
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fonction pour récupérer le profil utilisateur
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

  // Fonction de connexion
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

  // Fonction d'inscription
  const signUp = async (
    email: string, 
    password: string, 
    userData?: { nom?: string; prenom?: string; entreprise?: string; email?: string }
  ) => {
    try {
      // S'assurer que l'email est inclus dans les données utilisateur
      const userMetadata = {
        ...userData,
        email: email // Ajouter l'email aux métadonnées
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

  // Fonction de déconnexion
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Déconnexion réussie !');
    } catch (error: any) {
      toast.error(`Erreur de déconnexion: ${error.message}`);
    }
  };

  // Fonction de mise à jour du profil
  const updateProfile = async (data: { nom?: string; prenom?: string; entreprise?: string; email?: string }) => {
    if (!user) {
      return { error: { message: "Aucun utilisateur connecté" } };
    }

    try {
      // Mettre à jour l'email dans auth.users si l'email a été modifié
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

      // Mettre à jour le profil dans le state
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
