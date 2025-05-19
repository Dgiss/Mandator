
import React from 'react';
import { Button } from '@/components/ui/button';
import { Send, Plus, FileHistory } from 'lucide-react';

interface VisasHeaderProps {
  onDiffusionOpen: () => void;
  visasCount?: number;
}

export const VisasHeader: React.FC<VisasHeaderProps> = ({ 
  onDiffusionOpen,
  visasCount = 0
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
      <div>
        <h1 className="text-2xl font-semibold">Historique des visas</h1>
        <p className="text-muted-foreground">
          <FileHistory className="inline mr-1 h-4 w-4" />
          {visasCount} visa{visasCount !== 1 ? 's' : ''} (VSO, VAO, Refusé)
        </p>
      </div>
    </div>
  );
};
