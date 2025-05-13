
import React from 'react';
import { Loader } from 'lucide-react';
import { VisasLoadingProps } from './types';

export const VisasLoading: React.FC<VisasLoadingProps> = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Chargement des documents en cours...</p>
    </div>
  );
};
