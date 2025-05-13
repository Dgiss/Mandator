
import React from 'react';
import { Button } from '@/components/ui/button';
import { FilePlus } from 'lucide-react';
import { VisasHeaderProps } from './types';

export const VisasHeader: React.FC<VisasHeaderProps> = ({ onDiffusionOpen }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">Gestion des visas</h2>
      <Button 
        className="flex items-center gap-2"
        onClick={() => onDiffusionOpen({
          id: '',
          nom: 'Nouveau document',
          currentVersionId: '',
          statut: 'En attente de diffusion',
          versions: []
        })}
      >
        <FilePlus className="h-5 w-5" />
        <span>Ajouter un document</span>
      </Button>
    </div>
  );
};
