
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { UserProfileData } from '@/types/auth';

/**
 * Sign in with email and password avec gestion améliorée des erreurs
 */
export const signInWithEmail = async (email: string, password: string) => {
  try {
    console.log(`Tentative de connexion pour ${email}`);
    
    // Ajout d'un délai minime pour éviter les conflits potentiels
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Erreur d'authentification:", error);
      
      // Gestion spécifique pour l'erreur "Database error querying schema"
      if (error.message?.includes("Database error querying schema") || error.message?.includes("querying")) {
        toast.error(`Erreur temporaire du serveur. Veuillez réessayer.`);
        return { error: { message: "Erreur temporaire, merci de réessayer" } };
      }
      
      toast.error(`Erreur de connexion: ${error.message}`);
      return { error };
    }

    // Vérifier si la session est bien créée
    if (!data.session) {
      console.error("Session non créée après authentification");
      toast.error("Erreur de connexion: Session non créée");
      return { error: { message: "Session non créée" } };
    }

    console.log("Connexion réussie:", data.user?.id);
    toast.success('Connexion réussie !');
    return { data, error: null };
  } catch (error: any) {
    console.error("Exception lors de la connexion:", error);
    toast.error(`Erreur de connexion: ${error.message || "Problème inattendu"}`);
    return { error };
  }
};

/**
 * Sign up with email and password avec gestion améliorée des profils et des erreurs
 */
export const signUpWithEmail = async (
  email: string, 
  password: string, 
  userData?: UserProfileData
) => {
  try {
    console.log(`Tentative d'inscription pour ${email}`, userData);
    
    // Add email to user metadata
    const userMetadata = {
      ...userData,
      email: email
    };

    // Inscription via Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userMetadata,
        emailRedirectTo: window.location.origin + '/auth'
      }
    });

    if (error) {
      console.error("Erreur d'inscription:", error);
      toast.error(`Erreur d'inscription: ${error.message}`);
      return { error };
    }

    if (!data.user) {
      console.error("Utilisateur non créé après inscription");
      toast.error("Erreur d'inscription: Utilisateur non créé");
      return { error: { message: "Utilisateur non créé" } };
    }

    // Création manuelle du profil pour assurer la synchronisation, avec gestion plus robuste
    console.log("Création manuelle du profil pour:", data.user.id);
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Court délai pour permettre à l'utilisateur d'être créé complètement
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
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
        console.warn('Avertissement création de profil:', profileError);
        toast.warning("L'inscription a réussi mais avec un avertissement sur le profil");
      }
    } catch (profileErr) {
      console.warn('Exception création de profil:', profileErr);
      toast.warning("L'inscription a réussi mais avec une erreur sur le profil");
    }

    console.log("Inscription réussie:", data.user.id);
    toast.success('Inscription réussie ! Veuillez vérifier votre email.');
    return { data, error: null };
  } catch (error: any) {
    console.error("Exception lors de l'inscription:", error);
    toast.error(`Erreur d'inscription: ${error.message}`);
    return { error };
  }
};

/**
 * Sign out current user avec nettoyage amélioré
 */
export const signOutUser = async () => {
  try {
    console.log("Tentative de déconnexion");
    const { error } = await supabase.auth.signOut({
      scope: 'local' // Déconnecter uniquement sur cet appareil
    });
    
    if (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast.error(`Erreur de déconnexion: ${error.message}`);
      return { error };
    }
    
    // Vider le localStorage pour être sûr
    localStorage.removeItem('supabase.auth.token');
    
    console.log("Déconnexion réussie");
    toast.success('Déconnexion réussie !');
    return { error: null };
  } catch (error: any) {
    console.error('Exception lors de la déconnexion:', error);
    toast.error(`Erreur de déconnexion: ${error.message}`);
    return { error };
  }
};

/**
 * Fetch user profile data avec gestion améliorée des erreurs
 */
export const fetchUserProfile = async (userId: string) => {
  try {
    console.log(`Récupération du profil pour ${userId}`);
    
    if (!userId) {
      console.error('fetchUserProfile appelé sans userId');
      return { data: null, error: { message: "ID utilisateur manquant" } };
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erreur lors du chargement du profil:', error);
      
      // Si le profil n'existe pas, essayez de le créer
      if (error.code === 'PGRST116') {
        console.log("Profil non trouvé, tentative de création...");
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
            console.log("Profil créé avec succès");
            return { data: newProfile, error: null };
          } else {
            console.error('Échec de création du profil:', createError);
            return { data: null, error: createError };
          }
        }
      }
      
      return { data: null, error };
    }

    console.log("Profil récupéré avec succès");
    return { data, error: null };
  } catch (error: any) {
    console.error('Exception lors du chargement du profil:', error);
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
    console.log(`Mise à jour du profil pour ${userId}`, data);
    
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
