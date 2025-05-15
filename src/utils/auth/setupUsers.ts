
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { UserRole } from '@/hooks/userRole/types';

/**
 * Crée un utilisateur avec auto-confirmation et un rôle global spécifique
 */
export const createTestUser = async (
  email: string, 
  password: string, 
  role: UserRole = 'STANDARD',
  userData: { nom?: string; prenom?: string; entreprise?: string; } = {}
) => {
  try {
    console.log(`Création de l'utilisateur test ${email} avec rôle ${role}`);
    
    // 1. Créer l'utilisateur via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { ...userData, email }
      }
    });

    if (authError) {
      console.error(`Erreur lors de la création de l'utilisateur ${email}:`, authError);
      toast.error(`Erreur: ${authError.message}`);
      return false;
    }

    if (!authData.user) {
      console.error(`Utilisateur non créé: ${email}`);
      return false;
    }

    // 2. Mettre à jour le rôle global dans le profil
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role_global: role })
      .eq('id', authData.user.id);
      
    if (profileError) {
      console.error(`Erreur lors de la mise à jour du profil pour ${email}:`, profileError);
      toast.error(`Erreur lors de la mise à jour du profil: ${profileError.message}`);
      return false;
    }

    console.log(`Utilisateur ${email} créé avec succès (ID: ${authData.user.id})`);
    return true;
  } catch (error: any) {
    console.error(`Exception lors de la création de l'utilisateur ${email}:`, error);
    toast.error(`Erreur inattendue: ${error.message || error}`);
    return false;
  }
};

/**
 * Crée les utilisateurs de test pour l'application
 */
export const setupTestUsers = async () => {
  const results = [];
  
  // Créer l'utilisateur administrateur
  results.push(await createTestUser(
    'admin@admin.com',
    'password',
    'ADMIN',
    { nom: 'Admin', prenom: 'Super', entreprise: 'MandataireBTP' }
  ));
  
  // Créer l'utilisateur MOE
  results.push(await createTestUser(
    'moe@moe.com',
    'password',
    'MOE',
    { nom: 'MOE', prenom: 'Expert', entreprise: 'Bureau d\'études' }
  ));
  
  // Créer l'utilisateur Mandataire
  results.push(await createTestUser(
    'mandataire@mandataire.com',
    'password',
    'MANDATAIRE',
    { nom: 'Mandataire', prenom: 'Principal', entreprise: 'Entreprise BTP' }
  ));
  
  // Vérifier si tous les utilisateurs ont été créés avec succès
  const allSuccess = results.every(result => result === true);
  
  if (allSuccess) {
    toast.success('Tous les utilisateurs de test ont été créés avec succès!');
    return true;
  } else {
    toast.warning('Certains utilisateurs n\'ont pas pu être créés. Vérifiez les logs pour plus de détails.');
    return false;
  }
};
