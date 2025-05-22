
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { FileText, Plus, Search, Download, Eye, Filter, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Document as ProjectDocument } from '@/services/types';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import MarcheDocumentForm from './MarcheDocumentForm';
import DocumentViewer from './documents/DocumentViewer';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/userRole';
import { generateDocumentReference } from '@/utils/documentFormatters';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MarcheDocumentsProps {
  marcheId: string;
}

export default function MarcheDocuments({
  marcheId
}: MarcheDocumentsProps) {
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [numeroFilter, setNumeroFilter] = useState('all-documents');
  const [editingDocument, setEditingDocument] = useState<ProjectDocument | null>(null);
  const [viewingDocument, setViewingDocument] = useState<ProjectDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { canEdit } = useUserRole(marcheId);

  // Collect unique document numbers for filtering
  const uniqueNumeros = Array.from(new Set(documents.filter(doc => doc.numero).map(doc => doc.numero))).sort() as string[];

  // Refs for controlling fetch behavior
  const isLoadingRef = useRef<boolean>(false);
  const lastFetchTimestampRef = useRef<number>(0);
  const fetchInProgressRef = useRef<boolean>(false);
  const reloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reloadDisabledRef = useRef<boolean>(false);

  // State for reload button UI
  const [isReloading, setIsReloading] = useState(false);

  // Debounced fetch function to prevent multiple simultaneous calls
  const fetchDocuments = useCallback(async () => {
    // Skip if already loading, a fetch is in progress, or if the last fetch was too recent
    const now = Date.now();
    const minFetchInterval = 3000; // 3 seconds minimum between forced fetches
    
    if (isLoadingRef.current || fetchInProgressRef.current || (now - lastFetchTimestampRef.current < minFetchInterval && loadAttempt > 0)) {
      console.log('Skipping fetch - already in progress or too soon');
      return;
    }
    
    isLoadingRef.current = true;
    fetchInProgressRef.current = true;
    lastFetchTimestampRef.current = now;
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching documents for marché: ${marcheId}, attempt: ${loadAttempt}`);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('marche_id', marcheId);
      
      if (error) {
        throw new Error(error.message);
      }
      
      setDocuments(data || []);
      console.log(`Successfully fetched ${data?.length || 0} documents`);
    } catch (error: any) {
      console.error("Error fetching documents:", error);
      setError(`Erreur lors de la récupération des documents: ${error.message}`);
      toast({
        title: "Erreur",
        description: `Erreur lors de la récupération des documents: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
      
      // Delay clearing the fetchInProgress flag to prevent rapid consecutive fetches
      setTimeout(() => {
        fetchInProgressRef.current = false;
      }, 1000);
    }
  }, [marcheId, loadAttempt, toast]);

  // Initial data fetch on component mount and when dependencies change
  useEffect(() => {
    fetchDocuments();
    
    // Clean up timeouts on unmount
    return () => {
      if (reloadTimeoutRef.current) {
        clearTimeout(reloadTimeoutRef.current);
      }
    };
  }, [fetchDocuments, marcheId, loadAttempt]);

  const openNewDocumentForm = () => {
    setEditingDocument({
      id: '',
      nom: '',
      description: '',
      type: '',
      numero: '',
      domaine_technique: '',
      type_operation: '',
      dateupload: new Date().toISOString(),
      date_diffusion: new Date().toISOString(),
      date_bpe: new Date().toISOString(),
      phase: '',
      emetteur: '',
      geographie: '',
      statut: '',
      version: '',
      taille: '',
      file_path: '',
      marche_id: marcheId,
      created_at: new Date().toISOString()
    });
  };

  // Function called after a document is saved - added a delay to prevent immediate refetches
  const onDocumentSaved = useCallback(() => {
    setEditingDocument(null);
    
    // Use a controlled setTimeout to prevent rapid consecutive fetches
    setTimeout(() => {
      setLoadAttempt(prev => prev + 1);
    }, 1000);
    
    toast({
      title: "Succès",
      description: "Document sauvegardé avec succès."
    });
  }, [toast]);

  // Function to download a document
  const downloadDocument = (document: ProjectDocument) => {
    if (!document.file_path) {
      toast({
        title: "Erreur",
        description: "Aucun fichier associé à ce document.",
        variant: "destructive"
      });
      return;
    }
    
    const downloadFile = async () => {
      try {
        const { data, error } = await supabase.storage
          .from('marches')
          .download(document.file_path);
        
        if (error) {
          throw new Error(error.message);
        }

        const url = window.URL.createObjectURL(data);
        const link = window.document.createElement('a');
        link.href = url;
        link.setAttribute('download', document.nom);
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Téléchargement",
          description: "Le téléchargement du document a commencé."
        });
      } catch (error: any) {
        toast({
          title: "Erreur",
          description: `Erreur lors du téléchargement du document: ${error.message}`,
          variant: "destructive"
        });
      }
    };
    
    downloadFile();
  };

  // Function to view a document
  const viewDocument = (document: ProjectDocument) => {
    setViewingDocument(document);
  };

  // Format date function
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—";
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
    } catch (e) {
      return "—";
    }
  };

  // Get color based on document status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BPE':
      case 'Approuvé':
        return "bg-green-100 text-green-800";
      case 'En attente de validation':
      case 'En attente de visa':
        return "bg-amber-100 text-amber-800";
      case 'En attente de diffusion':
        return "bg-blue-100 text-blue-800";
      case 'À remettre à jour':
        return "bg-purple-100 text-purple-800";
      case 'Rejeté':
      case 'Refusé':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Manual reload function with debounce protection
  const handleManualReload = useCallback(() => {
    if (reloadDisabledRef.current || isReloading) {
      return;
    }
    
    setIsReloading(true);
    reloadDisabledRef.current = true;
    console.log('Starting manual document reload');
    
    setLoadAttempt(prev => prev + 1);
    
    // Minimum visual feedback time + prevention of rapid consecutive clicks
    reloadTimeoutRef.current = setTimeout(() => {
      setIsReloading(false);
      
      // Additional delay before allowing another reload
      setTimeout(() => {
        reloadDisabledRef.current = false;
      }, 5000);
    }, 1000);
  }, [isReloading]);

  // Filter documents based on search term and numero filter
  const filteredDocuments = documents.filter(doc => {
    const searchLower = searchTerm.toLowerCase();
    const codification = generateDocumentReference(doc);
    
    // First filter by numero if selected
    if (numeroFilter !== 'all-documents' && doc.numero !== numeroFilter) {
      return false;
    }
    
    // Then apply text search
    return doc.nom.toLowerCase().includes(searchLower) || 
           (doc.description && doc.description.toLowerCase().includes(searchLower)) || 
           (doc.type && doc.type.toLowerCase().includes(searchLower)) ||
           codification.toLowerCase().includes(searchLower);
  });

  // Reset filters function
  const resetFilters = () => {
    setSearchTerm('');
    setNumeroFilter('all-documents');
  };

  // Handle updates from document viewer without triggering infinite loops
  const handleDocumentUpdated = () => {
    // Only trigger a reload if another one isn't already in progress
    if (!fetchInProgressRef.current && !isLoadingRef.current) {
      // Add a slight delay before triggering reload
      setTimeout(() => {
        setLoadAttempt(prev => prev + 1);
      }, 1000);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Documents du marché</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleManualReload}
            disabled={isReloading || reloadDisabledRef.current}
            className="flex items-center gap-2"
            title="Rafraîchir les documents"
          >
            <RefreshCw size={16} className={isReloading ? "animate-spin" : ""} />
            Rafraîchir
          </Button>
          
          {canEdit && (
            <Button 
              variant="default" 
              onClick={openNewDocumentForm}
              className="flex items-center gap-2"
              aria-label="Ajouter un document"
            >
              <Plus size={16} />
              Nouveau document
            </Button>
          )}
        </div>
      </div>
      
      {/* Search and filter form */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher un document..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className="pl-10" 
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={numeroFilter} onValueChange={setNumeroFilter}>
            <SelectTrigger className="w-[200px]">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrer par numéro" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-documents">Tous les numéros</SelectItem>
              {uniqueNumeros.map(numero => (
                <SelectItem key={numero} value={numero}>{numero}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {(searchTerm || numeroFilter !== 'all-documents') && (
            <Button 
              variant="outline" 
              onClick={resetFilters}
              className="flex items-center gap-2"
            >
              Réinitialiser
            </Button>
          )}
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-start">
          <div className="flex-shrink-0 mr-3 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
          </div>
          <div>
            <p className="font-medium">Erreur de chargement</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
      
      {/* Documents table */}
      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Designation</TableHead>
                <TableHead>Codification</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredDocuments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-gray-500 text-lg font-semibold">Aucun document trouvé</p>
                      <p className="text-gray-400 text-sm">Ajoutez de nouveaux documents ou modifiez vos critères de recherche</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocuments.map(document => (
                  <TableRow 
                    key={document.id} 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => viewDocument(document)}
                  >
                    <TableCell>
                      <div className="font-medium">{document.description || document.nom}</div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {generateDocumentReference(document)}
                    </TableCell>
                    <TableCell>{document.version || '—'}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(document.statut)} variant="outline">
                        {document.statut}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(document.date_diffusion || document.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div 
                        className="flex justify-end space-x-2"
                        onClick={e => e.stopPropagation()}
                      >
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={e => {
                            e.stopPropagation();
                            downloadDocument(document);
                          }}
                        >
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Télécharger</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={e => {
                            e.stopPropagation();
                            viewDocument(document);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Voir</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      
      {/* Document form dialog */}
      {editingDocument !== null && (
        <MarcheDocumentForm 
          marcheId={marcheId}
          editingDocument={editingDocument}
          setEditingDocument={setEditingDocument}
          onDocumentSaved={onDocumentSaved}
        />
      )}
      
      {/* Document viewer */}
      <DocumentViewer 
        document={viewingDocument}
        open={!!viewingDocument}
        onOpenChange={open => !open && setViewingDocument(null)}
        onDocumentUpdated={handleDocumentUpdated}
      />
    </div>
  );
}
