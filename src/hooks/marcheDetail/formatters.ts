
/**
 * Utility functions for formatting and styling data in the marche detail view
 */

/**
 * Get the appropriate CSS class for a marché status
 */
export const getStatusColor = (statut: string): string => {
  switch(statut) {
    case 'En cours': return 'bg-btp-blue text-white';
    case 'Terminé': return 'bg-green-500 text-white';
    case 'En attente': return 'bg-amber-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

/**
 * Format a date string to a localized date
 */
export const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Non spécifiée';
  try {
    return new Date(dateString).toLocaleDateString('fr-FR');
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error, dateString);
    return dateString;
  }
};
