
import React from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

interface DocumentRecent {
  id: string;
  document_id: string;
  version: string;
  date_creation: string | null;
}

interface DocumentsRecentsCardProps {
  documentsRecents: DocumentRecent[];
  formatDate: (dateString: string | null) => string;
  onViewAllClick: (e: React.MouseEvent) => void;
}

const DocumentsRecentsCard: React.FC<DocumentsRecentsCardProps> = ({ documentsRecents, formatDate, onViewAllClick }) => {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Documents Récents</h3>
        <a href="#" 
           onClick={onViewAllClick} 
           className="text-btp-blue text-sm hover:underline">
          Voir tout
        </a>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documentsRecents.length > 0 ? (
              documentsRecents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.document_id ? doc.document_id.slice(0, 8) : "Document"}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      Version {doc.version}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(doc.date_creation)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  Aucun document récent
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default DocumentsRecentsCard;
