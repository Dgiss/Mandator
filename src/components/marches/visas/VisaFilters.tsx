
import React from 'react';
import { VisasFiltersProps } from './types';

export const VisaFilters: React.FC<VisasFiltersProps> = ({ options, onFilterChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <label className="block text-sm font-medium mb-1">Statut</label>
        <select 
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          value={options.statut} 
          onChange={(e) => onFilterChange('statut', e.target.value)}
        >
          <option value="Tous">Tous les statuts</option>
          <option value="En attente de diffusion">En attente de diffusion</option>
          <option value="En attente de validation">En attente de validation</option>
          <option value="Validé">Validé</option>
          <option value="Refusé">Refusé</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Type</label>
        <select 
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          value={options.type} 
          onChange={(e) => onFilterChange('type', e.target.value)}
        >
          <option value="Tous">Tous les types</option>
          <option value="Plan">Plan</option>
          <option value="Rapport">Rapport</option>
          <option value="Étude">Étude</option>
        </select>
      </div>
    </div>
  );
};
