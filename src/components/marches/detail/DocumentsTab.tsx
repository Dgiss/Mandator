
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import DocumentsTable from '../DocumentsTable';
import { useToast } from '@/hooks/use-toast';
import MarcheDocumentForm from '../MarcheDocumentForm';
import { getDocumentsForMarche } from '@/utils/auth/accessControl';
import type { Document } from '@/services/types';

const DocumentsTab: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  
  // Fonction de chargement des documents utilisant la fonction sécurisée
  const loadDocuments = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Utiliser la fonction sécurisée pour éviter les problèmes de récursion RLS
      const data = await getDocumentsForMarche(id);
      setDocuments(data);
    } catch (error: any) {
      console.error('Erreur lors du chargement des documents:', error);
      setError(error.message || "Une erreur s'est produite lors du chargement des documents");
      toast({
        title: "Erreur",
        description: "Impossible de charger les documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);
  
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);
  
  // Filtrer les documents en fonction de la recherche
  const filteredDocuments = documents.filter(doc => 
    doc.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Documents du marché</h2>
        {id && (
          <MarcheDocumentForm 
            marcheId={id} 
            onDocumentSaved={loadDocuments}
          />
        )}
      </div>
      
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un document..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex gap-2 items-center">
          <Filter className="h-4 w-4" />
          Filtrer
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="p-4 text-center">
          <p className="text-destructive">{error}</p>
          <Button onClick={loadDocuments} className="mt-4" variant="outline">Réessayer</Button>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">
            {searchQuery ? "Aucun document ne correspond à votre recherche" : "Aucun document n'a été ajouté à ce marché"}
          </p>
          {!searchQuery && id && (
            <MarcheDocumentForm 
              marcheId={id} 
              onDocumentSaved={loadDocuments}
            />
          )}
        </div>
      ) : (
        <DocumentsTable 
          documents={filteredDocuments} 
          onEdit={setEditingDocument}
          onDelete={() => {
            /* Fonction à implémenter */
            loadDocuments();
          }}
        />
      )}
      
      {editingDocument && (
        <MarcheDocumentForm
          marcheId={id || ''}
          editingDocument={editingDocument}
          setEditingDocument={setEditingDocument}
          onDocumentSaved={loadDocuments}
        />
      )}
    </div>
  );
};

export default DocumentsTab;
