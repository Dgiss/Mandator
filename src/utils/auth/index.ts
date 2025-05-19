
// Re-export all auth utilities
export * from './accessControl';
export * from './checkAuth';
export * from './logout';
export * from './roles';
export * from './roleQueries';
export * from './setupUsers';

// Enrichir l'objet fascicule avec des données manquantes pour la démo
export const enrichFasciculeData = (fascicule: any) => {
  return {
    ...fascicule,
    emetteur: fascicule.emetteur || ['EIFFAGE', 'BOUYGUES', 'VINCI', 'SPIE'][Math.floor(Math.random() * 4)],
    progression: fascicule.progression !== undefined ? fascicule.progression : Math.floor(Math.random() * 100),
    nombredocuments: fascicule.nombredocuments || Math.floor(Math.random() * 20) + 1
  };
};
