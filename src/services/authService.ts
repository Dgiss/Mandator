
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { UserProfileData } from '@/types/auth';

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string) => {
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

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (
  email: string, 
  password: string, 
  userData?: UserProfileData
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

    // Check if we need to manually create a profile (sometimes trigger doesn't work)
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user?.id,
          email: email,
          nom: userData?.nom || '',
          prenom: userData?.prenom || '',
          entreprise: userData?.entreprise || '',
          role_global: 'STANDARD'
        }, { 
          onConflict: 'id',
          ignoreDuplicates: false
        });
        
      if (profileError) {
        console.warn('Profile creation warning:', profileError);
      }
    } catch (profileErr) {
      console.warn('Profile creation exception:', profileErr);
    }

    toast.success('Inscription réussie ! Veuillez vérifier votre email.');
    return { error: null };
  } catch (error: any) {
    toast.error(`Erreur d'inscription: ${error.message}`);
    return { error };
  }
};

/**
 * Sign out current user
 */
export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast.error(`Erreur de déconnexion: ${error.message}`);
      return { error };
    }
    
    toast.success('Déconnexion réussie !');
    return { error: null };
  } catch (error: any) {
    console.error('Exception lors de la déconnexion:', error);
    toast.error(`Erreur de déconnexion: ${error.message}`);
    return { error };
  }
};

/**
 * Fetch user profile data
 */
export const fetchUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erreur lors du chargement du profil:', error);
      
      // If profile doesn't exist, try to create it
      if (error.code === 'PGRST116') {
        const authUser = await supabase.auth.getUser();
        if (authUser.data?.user) {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .upsert({
              id: userId,
              email: authUser.data.user.email,
              role_global: 'STANDARD'
            }, {
              onConflict: 'id'
            });
            
          if (!createError) {
            return { data: newProfile, error: null };
          } else {
            console.error('Failed to create profile:', createError);
          }
        }
      }
      
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Erreur lors du chargement du profil:', error);
    return { data: null, error };
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string, 
  data: UserProfileData
) => {
  if (!userId) {
    return { error: { message: "Aucun utilisateur connecté" } };
  }

  try {
    // Update email in auth.users if email was changed
    if (data.email) {
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
      .eq('id', userId);

    if (error) {
      toast.error(`Erreur de mise à jour du profil: ${error.message}`);
      return { error };
    }

    toast.success('Profil mis à jour avec succès !');
    return { error: null };
  } catch (error: any) {
    toast.error(`Erreur de mise à jour du profil: ${error.message}`);
    return { error };
  }
};

// Export logout for backward compatibility
export { logout } from '@/utils/auth/logout';
