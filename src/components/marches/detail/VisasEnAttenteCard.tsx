
import React from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Visa } from '@/services/types';

interface VisasEnAttenteCardProps {
  visasEnAttente: Visa[];
  formatDate: (dateString: string | null) => string;
  onViewAllClick: (e: React.MouseEvent) => void;
}

const VisasEnAttenteCard: React.FC<VisasEnAttenteCardProps> = ({ visasEnAttente, formatDate, onViewAllClick }) => {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Visas en Attente ({visasEnAttente.length})</h3>
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
              <TableHead>Document</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Demandé</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visasEnAttente.length > 0 ? (
              visasEnAttente.map((visa) => (
                <TableRow key={visa.id}>
                  <TableCell>{visa.document_id ? visa.document_id.slice(0, 8) : "Document"}</TableCell>
                  <TableCell>{visa.version}</TableCell>
                  <TableCell>{formatDate(visa.date_demande)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  Aucun visa en attente
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default VisasEnAttenteCard;
