
import { supabaseClient } from '@/lib/supabase-client';
import { toast } from 'sonner';

/**
 * Utilitaire pour purger les données utilisateur et les fichiers stockés
 * sans supprimer les structures des tables dans Supabase
 */
export const purgeUserData = async (): Promise<{ success: boolean, message: string }> => {
  try {
    console.log('Début de la purge des données utilisateur...');
    
    // 1. Purger d'abord le stockage (les fichiers)
    console.log('Purge du stockage...');
    const { data: buckets } = await supabaseClient.storage.listBuckets();
    
    // Pour chaque bucket, supprimer tous les fichiers
    if (buckets && buckets.length > 0) {
      for (const bucket of buckets) {
        const { data: files, error: listError } = await supabaseClient.storage
          .from(bucket.name)
          .list();
          
        if (listError) {
          console.error(`Erreur lors de la récupération des fichiers du bucket ${bucket.name}:`, listError);
          continue;
        }
        
        if (files && files.length > 0) {
          const filePaths = files.map(file => file.name);
          const { error: deleteError } = await supabaseClient.storage
            .from(bucket.name)
            .remove(filePaths);
            
          if (deleteError) {
            console.error(`Erreur lors de la suppression des fichiers du bucket ${bucket.name}:`, deleteError);
          } else {
            console.log(`${filePaths.length} fichiers supprimés du bucket ${bucket.name}`);
          }
        }
      }
    }
    
    // 2. Purger les données des tables principales
    console.log('Purge des données des tables personnalisées...');
    // Cette approche est plus sûre que d'utiliser des commandes SQL directes
    // car elle utilise les RLS policies configirées
    const tables = [
      'profiles',
      'droits_marche',
      'marches',
      'documents',
      'versions',
      'fascicules',
      'visas',
      'questions',
      'reponses',
      'ordres_service',
      'prix_nouveaux',
      'situations',
      'document_attachments',
      'notifications',
      'alertes'
    ];
    
    for (const table of tables) {
      try {
        const { error } = await supabaseClient
          .from(table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Condition toujours vraie pour tout supprimer
          
        if (error) {
          console.error(`Erreur lors de la purge de la table ${table}:`, error);
        } else {
          console.log(`Table ${table} vidée avec succès`);
        }
      } catch (err) {
        console.error(`Exception lors de la purge de la table ${table}:`, err);
      }
    }
    
    // 3. Supprimer tous les utilisateurs (sauf peut-être un compte administrateur)
    console.log('Purge des utilisateurs...');
    
    // Récupérer tous les utilisateurs
    const { data: users, error: usersError } = await supabaseClient.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Erreur lors de la récupération des utilisateurs:', usersError);
      return { 
        success: false, 
        message: 'La purge a réussi partiellement. Impossible de supprimer les utilisateurs.'
      };
    }
    
    // Supprimer chaque utilisateur
    if (users?.users) {
      for (const user of users.users) {
        try {
          const { error } = await supabaseClient.auth.admin.deleteUser(user.id);
          if (error) {
            console.error(`Erreur lors de la suppression de l'utilisateur ${user.id}:`, error);
          } else {
            console.log(`Utilisateur ${user.id} supprimé avec succès`);
          }
        } catch (err) {
          console.error(`Exception lors de la suppression de l'utilisateur ${user.id}:`, err);
        }
      }
    }
    
    console.log('Purge complète des données terminée');
    
    return { 
      success: true, 
      message: 'Toutes les données utilisateur et fichiers ont été purgés avec succès'
    };
  } catch (error: any) {
    console.error('Erreur lors de la purge des données:', error);
    return { 
      success: false, 
      message: `Erreur lors de la purge: ${error.message || 'Erreur inconnue'}`
    };
  }
};

/**
 * Réinitialisation complète de l'application
 * Cette fonction supprime toutes les données mais préserve les structures des tables
 */
export const resetApplication = async () => {
  try {
    toast.info("Réinitialisation de l'application en cours...", { duration: 3000 });
    
    const result = await purgeUserData();
    
    if (result.success) {
      toast.success("Réinitialisation terminée avec succès", { duration: 5000 });
      
      // Déconnexion de l'utilisateur actuel après la purge
      await supabaseClient.auth.signOut();
      
      // Redirection vers la page d'accueil ou d'authentification
      setTimeout(() => {
        window.location.href = '/auth';
      }, 1500);
    } else {
      toast.error(`Échec de la réinitialisation: ${result.message}`, { duration: 5000 });
    }
  } catch (error: any) {
    toast.error(`Erreur lors de la réinitialisation: ${error.message || 'Erreur inconnue'}`, { duration: 5000 });
  }
};
