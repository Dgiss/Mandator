
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { FileText, Plus, Search, Download, Filter, Eye, Edit } from 'lucide-react';
import MarcheDocumentForm from './MarcheDocumentForm';

interface MarcheDocumentsProps {
  marcheId: string;
}

interface Document {
  id: string;
  nom: string;
  type: string;
  statut: 'Approuvé' | 'En révision' | 'Soumis pour visa' | 'Rejeté';
  version: string;
  dateUpload: string;
  taille: string;
  description?: string;
  fasciculeId?: string;
}

const documentsMock: Document[] = [
  {
    id: "d1",
    nom: "Plan Structure v2",
    type: "PDF",
    statut: "Approuvé",
    version: "2.0",
    dateUpload: "16/03/2024",
    taille: "2.4 MB",
    description: "Plan structurel mis à jour avec corrections",
    fasciculeId: "f1"
  },
  {
    id: "d2",
    nom: "CCTP GC v1.1",
    type: "DOC",
    statut: "En révision",
    version: "1.1",
    dateUpload: "21/03/2024",
    taille: "1.8 MB",
    fasciculeId: "f1"
  },
  {
    id: "d3",
    nom: "Plan Coffrage R+1 v3",
    type: "PDF",
    statut: "Soumis pour visa",
    version: "3.0",
    dateUpload: "19/03/2024",
    taille: "4.2 MB",
    fasciculeId: "f2"
  },
  {
    id: "d4",
    nom: "Note de Calcul Fondations",
    type: "XLS",
    statut: "Approuvé",
    version: "1.0",
    dateUpload: "15/03/2024",
    taille: "0.8 MB",
    fasciculeId: "f3"
  },
  {
    id: "d5",
    nom: "Détails Façade Ouest",
    type: "PDF",
    statut: "Rejeté",
    version: "2.1",
    dateUpload: "14/03/2024",
    taille: "3.5 MB"
  }
];

export default function MarcheDocuments({ marcheId }: MarcheDocumentsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);

  // Filtrer les documents selon le terme de recherche
  const filteredDocuments = documentsMock.filter(doc => 
    doc.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtenir la couleur de fond en fonction du statut
  const getStatusColor = (statut: Document['statut']) => {
    switch(statut) {
      case 'Approuvé': return 'bg-green-100 text-green-700';
      case 'En révision': return 'bg-orange-100 text-orange-700';
      case 'Soumis pour visa': return 'bg-blue-100 text-blue-700';
      case 'Rejeté': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Obtenir l'icône en fonction du type de document
  const getDocumentIcon = (type: string) => {
    switch(type.toLowerCase()) {
      case 'pdf': return <FileText className="h-5 w-5 text-red-500" />;
      case 'doc': return <FileText className="h-5 w-5 text-blue-500" />;
      case 'xls': return <FileText className="h-5 w-5 text-green-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const handleEditDocument = (document: Document) => {
    setEditingDocument(document);
  };

  const handleDocumentSaved = () => {
    // In a real app, we would refresh the data from the server
    console.log("Document created or updated");
    setEditingDocument(null);
  };

  return (
    <div className="pt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold">Documents</h2>
        <MarcheDocumentForm 
          marcheId={marcheId} 
          editingDocument={editingDocument}
          setEditingDocument={setEditingDocument}
          onDocumentSaved={handleDocumentSaved}
        />
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un document..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button variant="outline" className="flex items-center">
          <Filter className="mr-2 h-4 w-4" /> Filtrer
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead className="hidden md:table-cell">Type</TableHead>
              <TableHead className="hidden md:table-cell">Version</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center">
                      {getDocumentIcon(doc.type)}
                      <span className="ml-2 font-medium">{doc.nom}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{doc.type}</TableCell>
                  <TableCell className="hidden md:table-cell">{doc.version}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.statut)}`}>
                      {doc.statut}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{doc.dateUpload}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleEditDocument(doc)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Modifier</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Voir</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Télécharger</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Aucun document trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
