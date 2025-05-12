
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface CollaborateursPageHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
}

const CollaborateursPageHeader: React.FC<CollaborateursPageHeaderProps> = ({ isLoading, onRefresh }) => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold">Gestion des collaborateurs</h2>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefresh}
        disabled={isLoading}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        Actualiser
      </Button>
    </div>
  );
};

export default CollaborateursPageHeader;
