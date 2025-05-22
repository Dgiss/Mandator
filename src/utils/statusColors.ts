
/**
 * Utilitaire centralisé pour la gestion des couleurs de statut des marchés
 */

/**
 * Obtient la classe Tailwind pour la couleur de fond d'un badge de statut
 */
export const getStatusBadgeColor = (statut: string = ''): string => {
  if (!statut) return 'bg-gray-500 text-white';
  
  switch(statut.toLowerCase()) {
    case 'en cours': return 'bg-btp-blue text-white';
    case 'terminé': return 'bg-green-500 text-white';
    case 'en attente': return 'bg-amber-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

/**
 * Obtient la classe Tailwind pour un indicateur de statut (point)
 */
export const getStatusDotColor = (statut: string = ''): string => {
  if (!statut) return 'bg-gray-500';
  
  switch(statut.toLowerCase()) {
    case 'en cours': return 'bg-btp-blue';
    case 'terminé': return 'bg-green-500';
    case 'en attente': return 'bg-amber-500';
    default: return 'bg-gray-500';
  }
};

/**
 * Obtient les classes Tailwind pour un badge de texte avec statut
 */
export const getStatusTextWithDot = (statut: string = ''): { dotClass: string, textClass: string } => {
  if (!statut) return { dotClass: 'bg-gray-500', textClass: 'text-gray-600' };
  
  switch(statut.toLowerCase()) {
    case 'en cours': 
      return { dotClass: 'bg-btp-blue', textClass: 'text-btp-blue' };
    case 'terminé': 
      return { dotClass: 'bg-green-500', textClass: 'text-green-600' };
    case 'en attente': 
      return { dotClass: 'bg-amber-500', textClass: 'text-amber-600' };
    default: 
      return { dotClass: 'bg-gray-500', textClass: 'text-gray-600' };
  }
};
