
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Marche } from '@/services/types';
import { FileText } from 'lucide-react';

interface MarcheHeaderProps {
  marche: Marche;
  getStatusColor: (statut: string) => string;
  formatDate: (dateString: string | null) => string;
}

const MarcheHeader: React.FC<MarcheHeaderProps> = ({ marche, getStatusColor, formatDate }) => {
  return (
    <div className="mb-6">
      <Link to="/marches">
        <Button variant="outline" size="sm" className="mb-4">
          <ChevronLeft className="mr-1 h-4 w-4" /> Retour aux marchés
        </Button>
      </Link>

      <div className="relative w-full h-56 rounded-lg overflow-hidden mb-6 bg-gray-200">
        {marche.image ? (
          <img 
            src={marche.image} 
            alt={marche.titre} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <FileText className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold">{marche.titre}</h1>
          <p className="text-gray-600">{marche.description || 'Aucune description'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(marche.statut)}`}>
            {marche.statut}
          </span>
          {marche.client && (
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Client: {marche.client}</span>
          )}
          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Date: {formatDate(marche.datecreation)}</span>
          {marche.budget && (
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Budget: {marche.budget}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarcheHeader;
