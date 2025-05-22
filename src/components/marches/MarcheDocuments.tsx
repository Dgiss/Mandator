
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { FileText, Plus, Search, Download, Eye, Filter } from 'lucide-react';
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

export default function MarcheDocuments({ marcheId }: MarcheDocumentsProps) {
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
  const uniqueNumeros = Array.from(new Set(
    documents.filter(doc => doc.numero).map(doc => doc.numero)
  )).sort() as string[];
  
  // Add fetched IDs tracking to prevent duplicate requests
  const fetchedIds = useRef<Set<string>>(new Set());
  const isLoadingRef = useRef<boolean>(false);

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
      created_at: new Date().toISOString(),
    });
  };

  const onDocumentSaved = useCallback(() => {
    setEditingDocument(null);
    // Clear fetched IDs when we save a new document to force a refresh
    fetchedIds.current.clear();
    setLoadAttempt(prev => prev + 1);
    toast({
      title: "Succès",
      description: "Document sauvegardé avec succès.",
    });
  }, [toast]);

  const downloadDocument = (document: ProjectDocument) => {
    if (!document.file_path) {
      toast({
        title: "Erreur",
        description: "Aucun fichier associé à ce document.",
        variant: "destructive",
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

        // Create URL and anchor element for download using window.document
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
          description: "Le téléchargement du document a commencé.",
        });
      } catch (error: any) {
        toast({
          title: "Erreur",
          description: `Erreur lors du téléchargement du document: ${error.message}`,
          variant: "destructive",
        });
      }
    };

    downloadFile();
  };

  const viewDocument = (document: ProjectDocument) => {
    setViewingDocument(document);
  };

  // Cette fonction est utilisée pour formater la date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—";
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
    } catch (e) {
      return "—";
    }
  };

  // Obtenir la couleur du badge en fonction du statut
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

  // Récupérer les documents avec logique pour éviter les appels API excessifs
  useEffect(() => {
    const fetchDocuments = async () => {
      // Skip if already loading or if we've already fetched this market ID
      if (isLoadingRef.current || (fetchedIds.current.has(marcheId) && loadAttempt === 0)) {
        console.log(`Skipping fetch for marché: ${marcheId} - already loaded or in progress`);
        return;
      }
      
      isLoadingRef.current = true;
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

        if (data) {
          console.log(`Successfully fetched ${data.length} documents`);
          setDocuments(data);
          // Add to fetched IDs set
          fetchedIds.current.add(marcheId);
        } else {
          console.log('No documents found (empty data array)');
          setDocuments([]);
        }
      } catch (error: any) {
        console.error("Error fetching documents:", error);
        setError(`Erreur lors de la récupération des documents: ${error.message}`);
        
        toast({
          title: "Erreur",
          description: `Erreur lors de la récupération des documents: ${error.message}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    };

    // Appeler fetchDocuments immédiatement
    fetchDocuments();
    
    // Clean up function
    return () => {
      isLoadingRef.current = false;
    };
  }, [marcheId, loadAttempt, toast]);

  // Filtrer les documents
  const filteredDocuments = documents.filter(doc => {
    const searchLower = searchTerm.toLowerCase();
    const codification = generateDocumentReference(doc);
    
    // Filtrer par numéro d'abord si un filtre est sélectionné
    if (numeroFilter !== 'all-documents' && doc.numero !== numeroFilter) {
      return false;
    }
    
    // Puis appliquer le filtre de recherche textuelle
    return (
      doc.nom.toLowerCase().includes(searchLower) ||
      (doc.description && doc.description.toLowerCase().includes(searchLower)) ||
      (doc.type && doc.type.toLowerCase().includes(searchLower)) ||
      codification.toLowerCase().includes(searchLower)
    );
  });

  // État pour le rechargement manuel
  const [isReloading, setIsReloading] = useState(false);
  
  // Fonction pour recharger manuellement les documents
  const handleManualReload = () => {
    setIsReloading(true);
    // Clear fetched IDs to force a reload
    fetchedIds.current.clear();
    setLoadAttempt(prev => prev + 1);
    setTimeout(() => setIsReloading(false), 1000); // Show spinner for at least 1 second
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setNumeroFilter('all-documents');
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Documents du marché</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleManualReload}
            className={`flex items-center gap-2 ${isReloading ? 'opacity-50' : ''}`}
            disabled={isReloading}
          >
            {isReloading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-900"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                <path d="M3 21v-5h5"/>
              </svg>
            )}
            {isReloading ? 'Chargement...' : 'Actualiser'}
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
      
      {/* Formulaire de recherche et filtres */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un document..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
              {uniqueNumeros.map((numero) => (
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
      
      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-start">
          <div className="flex-shrink-0 mr-3 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" x2="12" y1="8" y2="12"/>
              <line x1="12" x2="12.01" y1="16" y2="16"/>
            </svg>
          </div>
          <div>
            <p className="font-medium">Erreur de chargement</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
      
      {/* Tableau des documents */}
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
                  <TableRow key={document.id} className="cursor-pointer hover:bg-gray-50" onClick={() => viewDocument(document)}>
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
                      <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={(e) => {
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
                          onClick={(e) => {
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
      
      {/* Formulaire de document (modal) */}
      {editingDocument !== null && (
        <MarcheDocumentForm 
          marcheId={marcheId} 
          editingDocument={editingDocument} 
          setEditingDocument={setEditingDocument} 
          onDocumentSaved={onDocumentSaved}
        />
      )}

      {/* Visualiseur de document */}
      <DocumentViewer 
        document={viewingDocument} 
        open={!!viewingDocument} 
        onOpenChange={(open) => !open && setViewingDocument(null)} 
        onDocumentUpdated={() => {
          fetchedIds.current.clear();
          setLoadAttempt(prev => prev + 1);
        }}
      />
    </div>
  );
}
