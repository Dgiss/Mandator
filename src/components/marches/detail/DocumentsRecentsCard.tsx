
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight } from 'lucide-react';

interface Document {
  id: string;
  nom: string;
  type: string;
  statut: string;
  version: string;
  dateUpload?: string;
  taille?: string;
  description?: string;
  fascicule_id?: string;
  marche_id: string;
  created_at?: string;
  file_path?: string;
}

interface DocumentsRecentsCardProps {
  documentsRecents: Document[];
  formatDate: (dateString: string | null) => string;
  onViewAllClick: (e: React.MouseEvent) => void;
}

const DocumentsRecentsCard: React.FC<DocumentsRecentsCardProps> = ({
  documentsRecents,
  formatDate,
  onViewAllClick
}) => {
  // Get document icon based on type
  const getDocumentIcon = (type: string) => {
    switch(type.toLowerCase()) {
      case 'pdf': return <FileText className="h-5 w-5 text-red-500" />;
      case 'doc': return <FileText className="h-5 w-5 text-blue-500" />;
      case 'xls': return <FileText className="h-5 w-5 text-green-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold">Documents Récents</CardTitle>
        <Button variant="ghost" size="sm" className="h-8 px-2 text-btp-blue" onClick={onViewAllClick}>
          Voir tout <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {documentsRecents.length > 0 ? (
          <ul className="space-y-4">
            {documentsRecents.map((doc) => (
              <li key={doc.id} className="flex items-start">
                <div className="mr-3 mt-0.5">
                  {getDocumentIcon(doc.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{doc.nom}</h4>
                  <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-500">
                    <span>Version {doc.version}</span>
                    <span>·</span>
                    <span>{formatDate(doc.created_at || null)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">Aucun document récent</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentsRecentsCard;
