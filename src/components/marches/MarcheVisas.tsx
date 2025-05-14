
// Ce fichier est un simple wrapper qui exporte le composant MarcheVisas depuis son nouveau emplacement
// Ajout d'un mémoization pour éviter des re-rendus inutiles
import React, { memo, useMemo } from 'react';
import MarcheVisasComponent from './visas/MarcheVisas';

// Utilisation d'un composant avec propriétés mémorisées pour éviter les boucles de rendu
const MarcheVisas = memo(({ marcheId }: { marcheId: string }) => {
  // Mémorise la valeur du marcheId pour éviter des rendus en cascade
  const stableMarcheId = useMemo(() => marcheId, [marcheId]);
  
  return <MarcheVisasComponent marcheId={stableMarcheId} />;
});

// Ajout d'un displayName pour faciliter le debugging
MarcheVisas.displayName = 'MarcheVisasWrapper';

export default MarcheVisas;
