
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

/**
 * Fonction pour créer automatiquement des utilisateurs de test avec différents rôles
 */
export async function setupTestUsers() {
  try {
    // Créer l'utilisateur ADMIN
    await supabase.auth.signUp({
      email: 'admin@admin.com',
      password: 'password',
      options: {
        data: {
          nom: 'Admin',
          prenom: 'Super',
          entreprise: 'MandataireBTP',
          email: 'admin@admin.com',
          role_global: 'ADMIN'
        }
      }
    });

    // Créer l'utilisateur MOE
    await supabase.auth.signUp({
      email: 'moe@moe.com',
      password: 'password',
      options: {
        data: {
          nom: 'MOE',
          prenom: 'Expert',
          entreprise: 'Bureau d\'études',
          email: 'moe@moe.com',
          role_global: 'MOE'
        }
      }
    });

    // Créer l'utilisateur MANDATAIRE
    await supabase.auth.signUp({
      email: 'mandataire@mandataire.com',
      password: 'password',
      options: {
        data: {
          nom: 'Mandataire',
          prenom: 'Principal',
          entreprise: 'Entreprise BTP',
          email: 'mandataire@mandataire.com',
          role_global: 'MANDATAIRE'
        }
      }
    });

    // Appliquer les confirmations manuelles via l'API directement
    await autoConfirmUsers();

    toast.success("Utilisateurs de test créés avec succès");
    return true;
  } catch (error: any) {
    console.error("Erreur lors de la création des utilisateurs de test:", error);
    toast.error(`Erreur: ${error.message || "Impossible de créer les utilisateurs"}`);
    return false;
  }
}

/**
 * Confirme manuellement les emails des utilisateurs de test
 * Cette fonction est nécessaire car nous n'avons pas accès aux triggers auth.users en tant qu'utilisateur normal
 */
async function autoConfirmUsers() {
  try {
    // Utiliser une RPC ou une fonction qui peut gérer la confirmation côté serveur
    // Cette étape nécessitera une fonction Supabase Edge ou une API personnalisée
    
    // Pour l'instant, informons l'utilisateur qu'il pourra se connecter mais devra confirmer manuellement
    console.log("Les utilisateurs ont été créés. Pour une utilisation immédiate, désactivez la confirmation d'email dans les paramètres Supabase.");
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la confirmation des utilisateurs:", error);
    return false;
  }
}
