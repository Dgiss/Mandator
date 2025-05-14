
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
import { Send, Check, AlertCircle, FileCheck } from 'lucide-react';
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
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      doc.statut === 'Validé' ? 'bg-green-100 text-green-800' :
                      doc.statut === 'En attente de validation' ? 'bg-amber-100 text-amber-800' :
                      doc.statut === 'En attente de diffusion' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {doc.statut}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
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
                          <Check className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Ajouter un visa</span>
                        </Button>
                      )}
                      
                      {canShowProcessVisaButton && latestVersion && canShowProcessVisaButton(doc, latestVersion) && (
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
