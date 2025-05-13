
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Visa } from './types';

interface VisaFiltersProps {
  visas: Visa[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  activeTab: string;
  setActiveTab: (value: string) => void;
}

export const VisaFilters = ({ 
  visas, 
  searchTerm, 
  setSearchTerm, 
  activeTab, 
  setActiveTab 
}: VisaFiltersProps) => {
  return (
    <>
      <div className="mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="tous">
              Tous <span className="ml-1.5 text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">{visas.length}</span>
            </TabsTrigger>
            <TabsTrigger value="attente">
              En attente <span className="ml-1.5 text-xs bg-blue-100 px-1.5 py-0.5 rounded-full">{visas.filter(v => v.statut === 'En attente').length}</span>
            </TabsTrigger>
            <TabsTrigger value="vso">
              VSO <span className="ml-1.5 text-xs bg-green-100 px-1.5 py-0.5 rounded-full">{visas.filter(v => v.statut === 'VSO').length}</span>
            </TabsTrigger>
            <TabsTrigger value="vao">
              VAO <span className="ml-1.5 text-xs bg-amber-100 px-1.5 py-0.5 rounded-full">{visas.filter(v => v.statut === 'VAO').length}</span>
            </TabsTrigger>
            <TabsTrigger value="rejetes">
              Refusés <span className="ml-1.5 text-xs bg-red-100 px-1.5 py-0.5 rounded-full">{visas.filter(v => v.statut === 'Refusé').length}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un visa..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button variant="outline" className="flex items-center">
          <Filter className="mr-2 h-4 w-4" /> Filtrer
        </Button>
      </div>
    </>
  );
};
