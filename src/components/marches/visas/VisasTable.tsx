
import React from 'react';
import { FileText, Upload, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { VisaStatusBadge } from './VisaStatusBadge';
import { Document, Version } from './types';

interface VisasTableProps {
  documents: Document[];
  canShowDiffuseButton: (document: Document, version: Version) => boolean;
  canShowVisaButton: (document: Document, version: Version) => boolean;
  openDiffusionDialog: (document: Document, version: Version) => void;
  openVisaDialog: (document: Document, version: Version) => void;
}

export const VisasTable = ({
  documents,
  canShowDiffuseButton,
  canShowVisaButton,
  openDiffusionDialog,
  openVisaDialog
}: VisasTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Document</TableHead>
          <TableHead className="hidden md:table-cell">Version</TableHead>
          <TableHead className="hidden md:table-cell">Demandé par</TableHead>
          <TableHead className="hidden md:table-cell">Date demande</TableHead>
          <TableHead>Échéance</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map(document => (
          document.versions.map(version => (
            <TableRow key={version.id}>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-btp-blue" />
                  {document.nom}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">{version.version}</TableCell>
              <TableCell className="hidden md:table-cell">-</TableCell>
              <TableCell className="hidden md:table-cell">-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>
                <VisaStatusBadge statut={version.statut} />
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  {/* Bouton pour diffuser (MOE uniquement) */}
                  {canShowDiffuseButton(document, version) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      onClick={() => openDiffusionDialog(document, version)}
                    >
                      <Upload className="h-4 w-4 mr-1.5" />
                      Diffuser
                    </Button>
                  )}
                  
                  {/* Bouton pour viser (Mandataire uniquement) */}
                  {canShowVisaButton(document, version) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                      onClick={() => openVisaDialog(document, version)}
                    >
                      <Eye className="h-4 w-4 mr-1.5" />
                      Viser
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        ))}
        
        {documents.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center">
              Aucun document trouvé
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
