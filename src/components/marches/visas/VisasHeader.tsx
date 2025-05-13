
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Upload } from 'lucide-react';
import { Document } from './types';

export interface VisasHeaderProps {
  onDiffusionOpen: (document: Document) => void;
}

export const VisasHeader: React.FC<VisasHeaderProps> = ({ onDiffusionOpen }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h2 className="text-2xl font-semibold">Visas</h2>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => {}}
        >
          <Upload className="h-4 w-4" />
          Demander un visa
        </Button>
        <Button className="flex items-center gap-2" onClick={() => {}}>
          <Plus className="h-4 w-4" />
          Diffuser un document
        </Button>
      </div>
    </div>
  );
};
