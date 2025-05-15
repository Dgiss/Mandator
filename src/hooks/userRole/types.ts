
/**
 * Types pour la gestion des rôles utilisateurs
 */

/**
 * Rôle global d'un utilisateur
 */
export type UserRole = 'ADMIN' | 'MOE' | 'MANDATAIRE' | 'STANDARD';

/**
 * Rôle spécifique à un marché
 */
export type MarcheSpecificRole = 'MOE' | 'MANDATAIRE' | 'OBSERVATEUR' | null;

/**
 * Informations complètes sur le rôle d'un utilisateur
 */
export interface UserRoleInfo {
  /**
   * Rôle global de l'utilisateur
   */
  role: UserRole | null;
  
  /**
   * Rôles spécifiques aux marchés (par ID de marché)
   */
  marcheRoles: Record<string, MarcheSpecificRole>;
  
  /**
   * État de chargement
   */
  loading: boolean;
  
  /**
   * Erreur éventuelle
   */
  error: Error | null;
}
