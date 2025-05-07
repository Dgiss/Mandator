
import React, { useState, useEffect } from 'react';
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
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

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

export default function MarcheDocuments({ marcheId }: MarcheDocumentsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const { toast } = useToast();

  // Fetch documents from Supabase
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('marche_id', marcheId);
      
      if (error) throw error;
      
      const formattedData = data.map(doc => ({
        id: doc.id,
        nom: doc.nom,
        type: doc.type,
        statut: doc.statut as 'Approuvé' | 'En révision' | 'Soumis pour visa' | 'Rejeté',
        version: doc.version,
        dateUpload: doc.dateUpload || new Date().toLocaleDateString('fr-FR'),
        taille: doc.taille || '0 KB',
        description: doc.description,
        fasciculeId: doc.fascicule_id
      }));
      
      setDocuments(formattedData);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer la liste des documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, [marcheId]);

  // Filtrer les documents selon le terme de recherche
  const filteredDocuments = documents.filter(doc => 
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
    fetchDocuments();
  };

  // Download document from Supabase storage
  const handleDownloadDocument = async (documentItem: Document) => {
    try {
      // Get file path from document record
      const { data, error } = await supabase
        .from('documents')
        .select('file_path')
        .eq('id', documentItem.id)
        .single();
      
      if (error || !data || !data.file_path) {
        throw new Error('Le chemin du fichier est introuvable');
      }
      
      // Get download URL
      const { data: fileData, error: fileError } = await supabase.storage
        .from('documents')
        .download(data.file_path);
      
      if (fileError) {
        throw fileError;
      }
      
      // Create a download link using the browser's document object
      const url = URL.createObjectURL(fileData);
      const link = document.createElement('a');
      link.href = url;
      link.download = documentItem.nom;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le document",
        variant: "destructive",
      });
    }
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Chargement des documents...
                </TableCell>
              </TableRow>
            ) : filteredDocuments.length > 0 ? (
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
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleDownloadDocument(doc)}
                      >
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Télécharger</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
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
