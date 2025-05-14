
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
  // Helper function to get appropriate status badge styling
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'BPE':
        return 'bg-green-100 text-green-800';
      case 'En attente de validation':
      case 'En attente de visa':  // Ajout de ce statut
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
                      {/* Bouton Diffuser pour MOE quand version pas encore diffusée */}
                      {canShowDiffuseButton && latestVersion && canShowDiffuseButton(doc, latestVersion) && (
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDiffusionDialog && openDiffusionDialog(doc, latestVersion);
                          }}
                          disabled={loadingStates[doc.id]}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Diffuser</span>
                        </Button>
                      )}
                      
                      {/* Bouton Viser pour MANDATAIRE quand version déjà diffusée */}
                      {canShowVisaButton && latestVersion && canShowVisaButton(doc, latestVersion) && (
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openVisaDialog && openVisaDialog(doc, latestVersion);
                          }}
                          disabled={loadingStates[doc.id]}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Viser</span>
                        </Button>
                      )}
                      
                      {/* Bouton de traitement de visa (existant) */}
                      {canShowProcessVisaButton && latestVersion && canShowProcessVisaButton(doc) && (
                        <Button 
                          variant="btpPrimary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openProcessVisaDialog && openProcessVisaDialog(doc, latestVersion);
                          }}
                          disabled={loadingStates[doc.id]}
                        >
                          <FileCheck className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Viser</span>
                        </Button>
                      )}
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
