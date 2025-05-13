
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export interface VisaFiltersProps {
  options: Record<string, string>;
  onFilterChange: (name: string, value: string) => void;
}

export const VisaFilters: React.FC<VisaFiltersProps> = ({ options, onFilterChange }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="w-full md:w-1/3">
        <Label htmlFor="statut-filter" className="mb-2 block text-sm">
          Filtrer par statut
        </Label>
        <Select
          defaultValue={options.statut}
          onValueChange={(value) => onFilterChange('statut', value)}
        >
          <SelectTrigger id="statut-filter">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Tous">Tous les statuts</SelectItem>
            <SelectItem value="En attente de diffusion">En attente de diffusion</SelectItem>
            <SelectItem value="En attente de validation">En attente de validation</SelectItem>
            <SelectItem value="Validé">Validé</SelectItem>
            <SelectItem value="Refusé">Refusé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full md:w-1/3">
        <Label htmlFor="type-filter" className="mb-2 block text-sm">
          Filtrer par type
        </Label>
        <Select
          defaultValue={options.type}
          onValueChange={(value) => onFilterChange('type', value)}
        >
          <SelectTrigger id="type-filter">
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Tous">Tous les types</SelectItem>
            <SelectItem value="PDF">PDF</SelectItem>
            <SelectItem value="DOC">DOC</SelectItem>
            <SelectItem value="XLS">XLS</SelectItem>
            <SelectItem value="DWG">DWG</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
