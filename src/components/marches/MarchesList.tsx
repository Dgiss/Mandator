
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { FileText } from 'lucide-react';
import { Marche } from '@/services/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface MarchesListProps {
  marches: Marche[];
  loading: boolean;
  error: string | null;
  onMarcheClick: (marcheId: string) => void;
}

const MarchesList: React.FC<MarchesListProps> = ({ 
  marches, 
  loading, 
  error, 
  onMarcheClick 
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch (error) {
      return dateString;
    }
  };

  const getStatusColor = (statut: string) => {
    switch(statut) {
      case 'En cours': return 'bg-btp-blue';
      case 'Terminé': return 'bg-btp-success';
      case 'En attente': return 'bg-btp-warning';
      default: return 'bg-gray-500';
    }
  };

  // Render loading skeleton
  const renderLoadingSkeleton = (
    <TableRow>
      <TableCell colSpan={5} className="p-0">
        <div className="space-y-3 p-4">
          {Array(5).fill(0).map((_, index) => (
            <div key={index} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-md" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      </TableCell>
    </TableRow>
  );

  // Render error state
  const renderError = error ? (
    <TableRow>
      <TableCell colSpan={5}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </TableCell>
    </TableRow>
  ) : null;

  // Debug output
  console.log("MarchesList - Props received:", { 
    marchesCount: marches ? marches.length : 0, 
    loading, 
    error,
    marchesData: marches
  });

  return (
    <div className="rounded-lg border shadow bg-white overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead>Marché</TableHead>
            <TableHead className="hidden md:table-cell">Client</TableHead>
            <TableHead className="hidden md:table-cell">Date</TableHead>
            <TableHead className="hidden md:table-cell">Budget</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            renderLoadingSkeleton
          ) : error ? (
            renderError
          ) : marches.length > 0 ? (
            marches.map((marche) => (
              <TableRow 
                key={marche.id} 
                className="cursor-pointer hover:bg-gray-50 border-t"
                onClick={() => onMarcheClick(marche.id)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-btp-blue flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{marche.titre}</p>
                      <p className="text-sm text-gray-500 md:hidden">{marche.client}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{marche.client}</TableCell>
                <TableCell className="hidden md:table-cell">{formatDate(marche.datecreation)}</TableCell>
                <TableCell className="hidden md:table-cell">{marche.budget}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(marche.statut)} mr-2 flex-shrink-0`}></div>
                    <span>{marche.statut}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                {marches.length === 0 ? "Aucun marché trouvé. Cliquez sur 'Nouveau marché' pour en créer un." : "Aucun résultat trouvé pour votre recherche."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {!loading && !error && marches.length > 0 && (
        <div className="flex justify-between items-center p-4 bg-gray-50 text-sm text-gray-500 border-t">
          <div>Total dans la base: <span className="font-medium">{marches.length} marchés</span></div>
          <div>Affichés: <span className="font-medium">{marches.length} marchés</span></div>
        </div>
      )}
    </div>
  );
};

export default MarchesList;
