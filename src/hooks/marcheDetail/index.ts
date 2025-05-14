
/**
 * Export all components from the marche detail hooks
 * Les hooks ci-dessous sont optimisés pour éviter les appels redondants
 * et les problèmes de dépendances circulaires
 */
export * from './types';
export * from './formatters';
export * from './useMarcheDetail';

// Ajout d'un export direct pour le hook principal
export { useMarcheDetail } from './useMarcheDetail';
