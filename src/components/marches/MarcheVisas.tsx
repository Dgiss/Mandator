
// Ce fichier est un simple wrapper qui exporte le composant MarcheVisas depuis son nouveau emplacement
// Ajout d'un mémoization pour éviter des re-rendus inutiles
import React, { memo } from 'react';
import MarcheVisasComponent from './visas/MarcheVisas';

// Export memoized component to prevent unnecessary re-renders
const MarcheVisas = memo(MarcheVisasComponent);
export default MarcheVisas;
