
/**
 * Utility functions for formatting and styling data in the marche detail view
 */
import { getStatusBadgeColor } from '@/utils/statusColors';

/**
 * Get the appropriate CSS class for a marché status
 */
export const getStatusColor = getStatusBadgeColor;

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
