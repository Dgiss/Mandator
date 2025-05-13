
import React from 'react';
import MarcheVisaForm from '../MarcheVisaForm';

interface VisasHeaderProps {
  showNewVisaButton: boolean;
  marcheId: string;
  onVisaCreated: () => void;
}

export const VisasHeader = ({ 
  showNewVisaButton,
  marcheId,
  onVisaCreated
}: VisasHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h2 className="text-2xl font-semibold">Visas</h2>
      <div className="flex items-center space-x-2">
        {/* Afficher le bouton Nouveau Visa uniquement pour les MOE ou Admin */}
        {showNewVisaButton && (
          <MarcheVisaForm marcheId={marcheId} onVisaCreated={onVisaCreated} />
        )}
      </div>
    </div>
  );
};
