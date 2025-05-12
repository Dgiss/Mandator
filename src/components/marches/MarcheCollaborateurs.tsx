
import React from 'react';
import CollaborateursManager from './collaborateurs/CollaborateursManager';

interface MarcheCollaborateursProps {
  marcheId: string;
}

const MarcheCollaborateurs: React.FC<MarcheCollaborateursProps> = ({ marcheId }) => {
  return <CollaborateursManager marcheId={marcheId} />;
};

export default MarcheCollaborateurs;
