
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface MarchesFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const MarchesFilters: React.FC<MarchesFiltersProps> = ({ 
  searchTerm, 
  onSearchChange 
}) => {
  return (
    <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher un marché..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" className="flex items-center">
          <Filter className="mr-2 h-4 w-4" /> Filtrer
        </Button>
      </div>
    </div>
  );
};

export default MarchesFilters;
