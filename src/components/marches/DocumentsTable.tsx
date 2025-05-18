
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, FileText, Download, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/formatters';
import { Document } from '@/services/types';

interface DocumentsTableProps {
  documents: Document[];
  onEdit: (document: Document) => void;
  onDelete: (id: string) => void;
}

const DocumentsTable: React.FC<DocumentsTableProps> = ({ documents, onEdit, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approuvé':
      case 'Diffusé':
        return 'bg-green-100 text-green-800';
      case 'En révision':
      case 'En attente de diffusion':
        return 'bg-amber-100 text-amber-800';
      case 'Rejeté':
        return 'bg-red-100 text-red-800';
      case 'Soumis pour visa':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText size={16} className="text-red-500" />;
      case 'DOC':
      case 'DOCX':
        return <FileText size={16} className="text-blue-500" />;
      case 'XLS':
      case 'XLSX':
        return <FileText size={16} className="text-green-500" />;
      case 'PPT':
      case 'PPTX':
        return <FileText size={16} className="text-orange-500" />;
      case 'IMG':
        return <FileText size={16} className="text-purple-500" />;
      default:
        return <FileText size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead className="w-[250px]">Nom</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>
                <div className="flex items-center">
                  {getDocumentTypeIcon(doc.type)}
                </div>
              </TableCell>
              <TableCell className="font-medium">
                <div className="truncate max-w-[250px]" title={doc.nom}>
                  {doc.nom}
                </div>
                {doc.description && (
                  <div className="text-xs text-muted-foreground truncate max-w-[250px]" title={doc.description}>
                    {doc.description}
                  </div>
                )}
              </TableCell>
              <TableCell>{doc.version}</TableCell>
              <TableCell>
                <Badge variant="outline" className={getStatusColor(doc.statut)}>
                  {doc.statut}
                </Badge>
              </TableCell>
              <TableCell>
                {formatDate(doc.created_at) || formatDate(doc.dateupload) || 'N/A'}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {doc.file_path && (
                      <DropdownMenuItem 
                        onClick={() => window.open(`https://mfqyisynsaxcffawttlp.supabase.co/storage/v1/object/public/documents/${doc.file_path}`, '_blank')}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        <span>Télécharger</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onEdit(doc)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Modifier</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDelete(doc.id)} 
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Supprimer</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DocumentsTable;
