
import React from 'react';
import { Button } from '@/components/ui/button';
import { Marche } from '@/services/types';
import { ArrowLeft, Download, Calendar, MapPin, User, Building, BarChart } from 'lucide-react';

interface MarcheHeaderProps {
  marche: Marche;
  getStatusColor: (statut: string) => string;
  formatDate: (dateString: string | null) => string;
}

const MarcheHeader: React.FC<MarcheHeaderProps> = ({ marche, getStatusColor, formatDate }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
          <a href="/marches">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Retour</span>
          </a>
        </Button>
        <p className="text-sm text-gray-500">Retour à la liste</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          {marche.logo && (
            <div className="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden">
              <img 
                src={marche.logo} 
                alt={`Logo ${marche.titre}`}
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{marche.titre}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(marche.statut)}`}>
                {marche.statut}
              </span>
              <span className="text-sm text-gray-500 flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                {formatDate(marche.datecreation)}
              </span>
              {marche.client && (
                <span className="text-sm text-gray-500 flex items-center">
                  <Building className="h-3.5 w-3.5 mr-1" />
                  {marche.client}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
          {/* Autres boutons d'action si nécessaire */}
        </div>
      </div>

      {marche.description && (
        <p className="text-gray-600 mb-4">{marche.description}</p>
      )}
    </div>
  );
};

export default MarcheHeader;
