
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
import { Send, CheckCircle, AlertTriangle, FileCheck } from 'lucide-react';
import { Document, Version } from './types';
import { useUserRole } from '@/hooks/userRole';

export const VisasTable = ({ 
  documents, 
  onDocumentSelect,
  loadingStates,
  canShowDiffuseButton,
  canShowVisaButton,
  canShowProcessVisaButton,
  openDiffusionDialog,
  openVisaDialog,
  openProcessVisaDialog
}) => {
  // Get user roles information
  const { isMOE, isMandataire } = useUserRole();

  // Helper function to get appropriate status badge styling
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'BPE':
        return 'bg-green-100 text-green-800';
      case 'En attente de validation':
      case 'En attente de visa':
        return 'bg-amber-100 text-amber-800';
      case 'En attente de diffusion':
        return 'bg-blue-100 text-blue-800';
      case 'À remettre à jour':
        return 'bg-purple-100 text-purple-800';
      case 'Refusé':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour déterminer si le bouton Diffuser doit être activé selon les règles
  const shouldEnableDiffuseButton = (doc: Document) => {
    // Pour MOE, activer uniquement si statut "En attente de diffusion"
    if (isMOE()) {
      return doc.statut === 'En attente de diffusion';
    }
    
    // Pour MANDATAIRE, toujours désactivé
    return false;
  };

  // Fonction pour déterminer si le bouton Viser doit être activé selon les règles
  const shouldEnableVisaButton = (doc: Document) => {
    // Pour MANDATAIRE, activer uniquement si statut "En attente de visa"
    if (isMandataire()) {
      return doc.statut === 'En attente de visa';
    }
    
    // Pour MOE, toujours désactivé
    return false;
  };

  // Fonction pour déterminer si les boutons doivent être affichés (selon rôle et statut)
  const shouldShowDiffuseButton = (doc: Document) => {
    // Pour MOE, montrer le bouton mais il sera activé/désactivé selon la fonction shouldEnableDiffuseButton
    return isMOE();
  };

  const shouldShowVisaButton = (doc: Document) => {
    // Pour MANDATAIRE, montrer le bouton mais il sera activé/désactivé selon la fonction shouldEnableVisaButton
    return isMandataire();
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Document</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Aucun document trouvé
              </TableCell>
            </TableRow>
          ) : (
            documents.map((doc) => {
              const latestVersion = doc.versions.length > 0 ? doc.versions[0] : null;
              
              return (
                <TableRow 
                  key={doc.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onDocumentSelect(doc)}
                >
                  <TableCell className="font-medium">{doc.nom}</TableCell>
                  <TableCell>{doc.type || 'N/A'}</TableCell>
                  <TableCell>
                    {latestVersion ? latestVersion.version : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(doc.statut)}`}>
                      {doc.statut}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      {/* Bouton Diffuser - uniquement pour MOE */}
                      {shouldShowDiffuseButton(doc) && (
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDiffusionDialog && openDiffusionDialog(doc, latestVersion);
                          }}
                          disabled={!shouldEnableDiffuseButton(doc) || loadingStates[doc.id]}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Diffuser</span>
                        </Button>
                      )}
                      
                      {/* Bouton Viser - uniquement pour MANDATAIRE */}
                      {shouldShowVisaButton(doc) && (
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openVisaDialog && openVisaDialog(doc, latestVersion);
                          }}
                          disabled={!shouldEnableVisaButton(doc) || loadingStates[doc.id]}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Viser</span>
                        </Button>
                      )}
                      
                      {/* Suppression du bouton traiter le visa en doublon - nous n'utiliserons que le bouton de visa standard */}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
