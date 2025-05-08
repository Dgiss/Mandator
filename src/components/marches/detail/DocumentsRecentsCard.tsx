
import React from 'react';
import { Card } from '@/components/ui/card';
import { File, Calendar } from 'lucide-react';

interface Document {
  id: string;
  nom: string;
  type: string;
  statut: string;
  dateUpload?: string | null;
  created_at?: string | null;
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
  // Fonction pour obtenir une couleur pour le type de document
  const getTypeColor = (type: string) => {
    switch(type.toUpperCase()) {
      case 'PDF': return 'text-red-500';
      case 'DOC': case 'DOCX': return 'text-blue-500';
      case 'XLS': case 'XLSX': return 'text-green-500';
      case 'PPT': case 'PPTX': return 'text-orange-500';
      case 'DWG': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

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
      
      <div className="space-y-4">
        {documentsRecents.length > 0 ? (
          documentsRecents.map((doc) => (
            <div key={doc.id} className="flex items-start">
              <div className="bg-gray-100 p-2 rounded mr-3">
                <File className={`h-5 w-5 ${getTypeColor(doc.type)}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium truncate">{doc.nom}</h4>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{formatDate(doc.dateUpload || doc.created_at)}</span>
                </div>
              </div>
              <div className="ml-2">
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  doc.statut === 'Approuvé' ? 'bg-green-100 text-green-800' : 
                  doc.statut === 'En révision' ? 'bg-amber-100 text-amber-800' : 
                  'bg-blue-100 text-blue-800'
                }`}>
                  {doc.statut}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center py-4 text-gray-500">
            Aucun document récent
          </p>
        )}
      </div>
    </Card>
  );
};

export default DocumentsRecentsCard;
