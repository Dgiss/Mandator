
import React from 'react';
import { Button } from '@/components/ui/button';
import { Marche } from '@/services/types';
import { ArrowLeft, Download, Calendar, MapPin, User, Building, BarChart, SquareM } from 'lucide-react';
import { useUserRole } from '@/hooks/userRole';
import { Badge } from '@/components/ui/badge';
import { MarcheSpecificRole } from '@/hooks/userRole/types';

interface MarcheHeaderProps {
  marche: Marche;
  getStatusColor: (statut: string) => string;
  formatDate: (dateString: string | null) => string;
}

const MarcheHeader: React.FC<MarcheHeaderProps> = ({ marche, getStatusColor, formatDate }) => {
  const { getMarcheRole } = useUserRole(marche.id);
  const [marcheRole, setMarcheRole] = React.useState<MarcheSpecificRole>(null);
  
  React.useEffect(() => {
    const fetchMarcheRole = async () => {
      if (marche.id) {
        const specificRole = await getMarcheRole(marche.id);
        setMarcheRole(specificRole);
      }
    };
    fetchMarcheRole();
  }, [marche.id, getMarcheRole]);

  const getRoleBadgeVariant = (roleType: string | null) => {
    switch(roleType) {
      case 'MOE': return 'default';
      case 'MANDATAIRE': return 'secondary';
      case 'OBSERVATEUR': return 'outline';
      default: return 'outline';
    }
  };

  const getRoleBadgeText = () => {
    if (marcheRole) {
      return marcheRole;
    }
    return 'VISITEUR';
  };

  return (
    <div className="mb-6">
      {marche.image && (
        <div className="w-full h-48 md:h-64 mb-6 rounded-lg overflow-hidden relative">
          <img 
            src={marche.image} 
            alt={`Couverture du marché ${marche.titre}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
      )}

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
          {marche.logo ? (
            <div className="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden">
              <img 
                src={marche.logo} 
                alt={`Logo ${marche.titre}`}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#5743e9] to-[#7e69c5] rounded-md flex items-center justify-center">
              <SquareM className="h-6 w-6 text-white" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-800">{marche.titre}</h1>
              <Badge variant={getRoleBadgeVariant(marcheRole)} className="text-xs">
                {getRoleBadgeText()}
              </Badge>
            </div>
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
