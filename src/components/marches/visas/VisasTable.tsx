
import React from 'react';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Send, CheckCircle } from 'lucide-react';
import { Document } from './types';
import { Badge } from '@/components/ui/badge';
import { useUserRole } from '@/hooks/userRole';

interface VisasTableProps {
  documents: Document[];
  onDocumentSelect: (document: Document) => void;
  loadingStates: Record<string, boolean>;
  openDiffusionDialog: (document: Document) => void;
  openVisaDialog: (document: Document) => void;
}

export const VisasTable: React.FC<VisasTableProps> = ({ 
  documents, 
  onDocumentSelect,
  loadingStates,
  openDiffusionDialog,
  openVisaDialog
}) => {
  // Utiliser notre hook personnalisé pour vérifier les rôles utilisateur
  const { canDiffuse, canVisa, isMOE, isMandataire } = useUserRole();

  // Style badge selon le statut
  const getStatusBadgeVariant = (statut: string) => {
    switch (statut) {
      case 'BPE':
        return 'bg-green-100 text-green-800';
      case 'En attente de diffusion':
        return 'bg-amber-100 text-amber-800';
      case 'En attente de validation':
      case 'En attente de visa':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour déterminer si le bouton Diffuser doit être affiché
  const canShowDiffuseButton = (doc: Document) => {
    // Pour MOE seulement, uniquement si statut "En attente de diffusion"
    return isMOE() && doc.statut === 'En attente de diffusion';
  };

  // Fonction pour déterminer si le bouton Viser doit être affiché
  const canShowVisaButton = (doc: Document) => {
    // Pour MANDATAIRE seulement, uniquement si statut "En attente de validation" ou "En attente de visa"
    return isMandataire() && (doc.statut === 'En attente de validation' || doc.statut === 'En attente de visa');
  };

  return (
    <div className="rounded-md border overflow-hidden">
      {documents.length > 0 ? (
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[350px]">Document</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map(doc => (
              <TableRow 
                key={doc.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onDocumentSelect(doc)}
              >
                <TableCell className="font-medium">{doc.nom}</TableCell>
                <TableCell>{doc.type || '-'}</TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeVariant(doc.statut)}>
                    {doc.statut}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1">
                    {/* Bouton Diffuser - visible uniquement si MOE et document en attente de diffusion */}
                    {canShowDiffuseButton(doc) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                        disabled={loadingStates[doc.id]}
                        onClick={(e) => {
                          e.stopPropagation();
                          openDiffusionDialog(doc);
                        }}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Diffuser
                      </Button>
                    )}
                    
                    {/* Bouton Viser - visible uniquement si MANDATAIRE et document en attente de validation/visa */}
                    {canShowVisaButton(doc) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                        disabled={loadingStates[doc.id]}
                        onClick={(e) => {
                          e.stopPropagation();
                          openVisaDialog(doc);
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Viser
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="flex flex-col items-center justify-center px-4 py-8">
          <p className="text-gray-500 text-sm">
            Aucun document à afficher
          </p>
        </div>
      )}
    </div>
  );
};
