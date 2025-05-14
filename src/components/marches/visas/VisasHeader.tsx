
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export interface VisasHeaderProps {
  onDiffusionOpen: () => void;
}

export const VisasHeader: React.FC<VisasHeaderProps> = ({ onDiffusionOpen }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-2xl font-bold">Visas et diffusions</h1>
      <Button onClick={onDiffusionOpen} className="flex items-center gap-2">
        <PlusCircle className="h-4 w-4" />
        Nouvelle diffusion
      </Button>
    </div>
  );
};
