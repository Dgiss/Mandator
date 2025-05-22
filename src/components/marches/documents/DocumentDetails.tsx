
import React from 'react';
import { Document } from '@/services/types';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { FileText } from 'lucide-react';
import ModifyDocumentButton from './ModifyDocumentButton';

interface DocumentDetailsProps {
  document: Document;
  formatDate: (date: string | undefined | null) => string;
}

const DocumentDetails: React.FC<DocumentDetailsProps> = ({ 
  document, 
  formatDate 
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium">Informations générales</h3>
        <ModifyDocumentButton document={document} />
      </div>
      
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Nom</TableCell>
            <TableCell>{document.nom}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Type</TableCell>
            <TableCell>
              <Badge variant="outline" className="font-normal">
                {document.type || '—'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Statut</TableCell>
            <TableCell>
              <Badge className={`font-normal ${
                document.statut === 'Approuvé' ? 'bg-green-100 text-green-800' :
                document.statut === 'En attente' ? 'bg-yellow-100 text-yellow-800' :
                document.statut === 'Rejeté' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {document.statut || '—'}
              </Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Numéro</TableCell>
            <TableCell>{document.numero || '—'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Version</TableCell>
            <TableCell>{document.version || '—'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Émetteur</TableCell>
            <TableCell>{document.emetteur || '—'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Description</TableCell>
            <TableCell>{document.description || '—'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Taille</TableCell>
            <TableCell>{document.taille || '—'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Date d'upload</TableCell>
            <TableCell>{formatDate(document.dateupload)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Date de diffusion</TableCell>
            <TableCell>{formatDate(document.date_diffusion)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Date BPE</TableCell>
            <TableCell>{formatDate(document.date_bpe)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      
      {document.description && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{document.description}</p>
        </div>
      )}
    </div>
  );
};

export default DocumentDetails;
