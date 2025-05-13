
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Send, FileText } from 'lucide-react';
import { Document, Version } from './types';
import { useUserRole } from '@/hooks/userRole';

export interface VisasTableProps {
  documents: Document[];
  onDocumentSelect: (document: Document) => void;
  onVisaOpen: (document: Document) => void;
  loadingStates: Record<string, boolean>;
  canShowDiffuseButton?: (document: Document, version: Version) => boolean;
  canShowVisaButton?: (document: Document, version: Version) => boolean;
  openDiffusionDialog?: (document: Document, version: Version) => void;
  openVisaDialog?: (document: Document, version: Version) => void;
}

export const VisasTable: React.FC<VisasTableProps> = ({
  documents,
  onDocumentSelect,
  onVisaOpen,
  loadingStates,
  canShowDiffuseButton,
  canShowVisaButton,
  openDiffusionDialog,
  openVisaDialog,
}) => {
  const { canDiffuse, canVisa } = useUserRole();

  const getStatusBadge = (statut: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      'En attente de diffusion': { color: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
      'En attente de validation': { color: 'bg-blue-100 text-blue-800', label: 'En attente' },
      'Validé': { color: 'bg-green-100 text-green-800', label: 'Validé' },
      'Refusé': { color: 'bg-red-100 text-red-800', label: 'Refusé' }
    };

    const config = statusConfig[statut] || { color: 'bg-gray-100 text-gray-800', label: statut };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getIconForType = (type: string | undefined) => {
    const iconColor = 'text-muted-foreground';
    return <FileText className={`h-4 w-4 ${iconColor}`} />;
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch (e) {
      return dateString;
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md bg-muted/10">
        <h3 className="text-lg font-medium">Aucun document trouvé</h3>
        <p className="text-muted-foreground mt-1">
          Il n'y a pas encore de documents à viser ou à diffuser pour ce marché.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document</TableHead>
            <TableHead className="hidden md:table-cell">Type</TableHead>
            <TableHead className="hidden md:table-cell">Version</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id} onClick={() => onDocumentSelect(doc)} className="cursor-pointer hover:bg-muted/50">
              <TableCell>
                <div className="flex items-center gap-2">
                  {getIconForType(doc.type)}
                  <span className="font-medium">{doc.nom}</span>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">{doc.type || 'N/A'}</TableCell>
              <TableCell className="hidden md:table-cell">
                {doc.latestVersion?.version || 'N/A'}
              </TableCell>
              <TableCell>{getStatusBadge(doc.statut)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={(e) => {
                    e.stopPropagation();
                    onDocumentSelect(doc);
                  }}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Voir</span>
                  </Button>

                  {canDiffuse() && doc.latestVersion && doc.statut === 'En attente de diffusion' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onVisaOpen(doc);
                      }}
                      disabled={loadingStates[doc.id]}
                    >
                      <Send className="h-4 w-4" />
                      <span className="sr-only">Diffuser</span>
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
