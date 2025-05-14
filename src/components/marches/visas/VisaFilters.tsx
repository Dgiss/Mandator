
import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export interface VisaFiltersProps {
  statusFilter: string;
  typeFilter: string;
  onFilterChange: (name: string, value: string) => void;
}

export const VisaFilters: React.FC<VisaFiltersProps> = ({
  statusFilter,
  typeFilter,
  onFilterChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="statut-filter">Filtrer par statut</Label>
        <Select 
          value={statusFilter} 
          onValueChange={(value) => onFilterChange('statut', value)}
        >
          <SelectTrigger id="statut-filter">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Tous">Tous les statuts</SelectItem>
            <SelectItem value="En attente de diffusion">En attente de diffusion</SelectItem>
            <SelectItem value="En attente de visa">En attente de visa</SelectItem>
            <SelectItem value="Visé">Visé</SelectItem>
            <SelectItem value="Refusé">Refusé</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="type-filter">Filtrer par type</Label>
        <Select
          value={typeFilter}
          onValueChange={(value) => onFilterChange('type', value)}
        >
          <SelectTrigger id="type-filter">
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Tous">Tous les types</SelectItem>
            <SelectItem value="Plan">Plan</SelectItem>
            <SelectItem value="Document">Document</SelectItem>
            <SelectItem value="Note">Note</SelectItem>
            <SelectItem value="Autre">Autre</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
