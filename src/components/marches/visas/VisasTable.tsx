
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { VisaStatusBadge } from './VisaStatusBadge';
import { Document, Version } from './types';

interface VisasTableProps {
  documents: Document[];
  canShowDiffuseButton: (document: Document, version: Version) => boolean;
  canShowVisaButton: (document: Document, version: Version) => boolean;
  openDiffusionDialog: (document: Document, version: Version) => void;
  openVisaDialog: (document: Document, version: Version) => void;
}

export const VisasTable: React.FC<VisasTableProps> = ({
  documents,
  canShowDiffuseButton,
  canShowVisaButton,
  openDiffusionDialog,
  openVisaDialog
}) => {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Wrapper to track loading states for buttons
  const handleAction = async (
    documentId: string, 
    versionId: string,
    action: 'diffuse' | 'visa',
    callback: () => void
  ) => {
    const loadingKey = `${action}-${documentId}-${versionId}`;
    setActionLoading(loadingKey);
    
    try {
      // Small delay to simulate network request for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      callback();
    } finally {
      setActionLoading(null);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Aucun document à afficher
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Document</TableHead>
          <TableHead>Version</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map(document => (
          document.versions.map(version => {
            const diffuseLoadingKey = `diffuse-${document.id}-${version.id}`;
            const visaLoadingKey = `visa-${document.id}-${version.id}`;
            const showDiffuseButton = canShowDiffuseButton(document, version);
            const showVisaButton = canShowVisaButton(document, version);
            
            return (
              <TableRow key={`${document.id}-${version.id}`}>
                <TableCell className="font-medium">{document.nom}</TableCell>
                <TableCell>{version.version}</TableCell>
                <TableCell>
                  <VisaStatusBadge statut={version.statut} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {showDiffuseButton && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                        disabled={actionLoading !== null}
                        onClick={() => handleAction(
                          document.id, 
                          version.id,
                          'diffuse', 
                          () => openDiffusionDialog(document, version)
                        )}
                      >
                        {actionLoading === diffuseLoadingKey ? (
                          <>
                            <Loader className="h-4 w-4 mr-2 animate-spin" />
                            Chargement...
                          </>
                        ) : 'Diffuser'}
                      </Button>
                    )}
                    
                    {showVisaButton && (
                      <Button
                        size="sm"
                        variant="outline" 
                        className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                        disabled={actionLoading !== null}
                        onClick={() => handleAction(
                          document.id, 
                          version.id,
                          'visa', 
                          () => openVisaDialog(document, version)
                        )}
                      >
                        {actionLoading === visaLoadingKey ? (
                          <>
                            <Loader className="h-4 w-4 mr-2 animate-spin" />
                            Chargement...
                          </>
                        ) : 'Viser'}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        ))}
      </TableBody>
    </Table>
  );
};
