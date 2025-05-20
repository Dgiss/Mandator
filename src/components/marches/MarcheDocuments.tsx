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
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FileText, Plus, Search, Download, Filter, Eye, Edit, Send, CheckCircle, History } from 'lucide-react';
import MarcheDocumentForm from './MarcheDocumentForm';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Document } from '@/services/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useUserRole } from '@/hooks/useUserRole';
import MarcheDiffusionDialog from './MarcheDiffusionDialog';
import MarcheVisaDialog from './MarcheVisaDialog';
import ViewDocumentButton from './documents/ViewDocumentButton';

interface MarcheDocumentsProps {
  marcheId: string;
}

interface DocumentWithVersion extends Document {
  date_diffusion_formatted?: string;
  date_visa_formatted?: string;
  latest_version?: any;
}

export default function MarcheDocuments({ marcheId }: MarcheDocumentsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [documents, setDocuments] = useState<DocumentWithVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [showDiffusionDialog, setShowDiffusionDialog] = useState(false);
  const [showVisaDialog, setShowVisaDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showAllVersions, setShowAllVersions] = useState(false);
  const { toast } = useToast();
  const { isMOE, isMandataire } = useUserRole(marcheId);

  // Fetch documents from Supabase
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      // Get documents with their latest version
      const { data, error } = await supabase
        .from('documents')
        .select('*, versions(*)')
        .eq('marche_id', marcheId)
        .order('nom', { ascending: true });
      
      if (error) throw error;
      
      // Process documents to format dates and enrich with version information
      const processedData = data.map((doc: any) => {
        // Find the latest version if versions exist
        const versions = doc.versions && Array.isArray(doc.versions) ? doc.versions : [];
        const latestVersion = versions.length > 0 ? 
          versions.sort((a: any, b: any) => {
            // Ensure we have date_creation values to sort by
            const dateA = a.date_creation ? new Date(a.date_creation).getTime() : 0;
            const dateB = b.date_creation ? new Date(b.date_creation).getTime() : 0;
            return dateB - dateA;
          })[0] 
          : null;
        
        // Safely format dates if they exist
        let dateDiffusionFormatted = '-';
        if (doc.date_diffusion) {
          try {
            dateDiffusionFormatted = format(new Date(doc.date_diffusion), 'dd/MM/yyyy', { locale: fr });
          } catch (e) {
            console.error("Error formatting date_diffusion:", e);
          }
        }
        
        let dateBpeFormatted = '-';
        if (doc.date_bpe) {
          try {
            dateBpeFormatted = format(new Date(doc.date_bpe), 'dd/MM/yyyy', { locale: fr });
          } catch (e) {
            console.error("Error formatting date_bpe:", e);
          }
        }
        
        return {
          ...doc,
          date_diffusion_formatted: dateDiffusionFormatted,
          date_visa_formatted: dateBpeFormatted,
          latest_version: latestVersion
        } as DocumentWithVersion;
      });
      
      setDocuments(processedData);
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

  // Filtrer les documents selon le terme de recherche et option d'affichage des versions
  const filteredDocuments = documents.filter(doc => {
    const matchSearch = doc.nom.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (showAllVersions) {
      return matchSearch;
    } else {
      // Par défaut, n'afficher que le document avec la version la plus récente par nom de document
      const docsByName = documents.filter(d => 
        d.nom.toLowerCase().includes(searchTerm.toLowerCase()) && 
        d.nom.split(' - ')[0] === doc.nom.split(' - ')[0]
      );
      
      if (docsByName.length === 0) return false;
      
      // Trouver la version la plus récente
      const mostRecentDoc = docsByName.reduce((latest, current) => {
        if (!latest.version) return current;
        if (!current.version) return latest;
        return current.version > latest.version ? current : latest;
      });
      
      return doc.id === mostRecentDoc.id && matchSearch;
    }
  });

  // Obtenir la couleur de badge en fonction du statut
  const getStatusColor = (statut: string) => {
    switch(statut) {
      case 'BPE':
      case 'Approuvé': 
        return 'bg-green-100 text-green-700';
      case 'En attente de diffusion': 
        return 'bg-yellow-100 text-yellow-700';
      case 'En attente de visa': 
      case 'En attente de validation':
        return 'bg-blue-100 text-blue-700';
      case 'Refusé': 
        return 'bg-red-100 text-red-700';
      case 'À remettre à jour':
        return 'bg-purple-100 text-purple-700';
      default: 
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Obtenir l'icône en fonction du type de document
  const getDocumentIcon = (type: string) => {
    switch(type.toLowerCase()) {
      case 'pdf': return <FileText className="h-5 w-5 text-red-500" />;
      case 'doc': 
      case 'docx': 
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'xls':
      case 'xlsx': 
        return <FileText className="h-5 w-5 text-green-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const handleEditDocument = (document: Document) => {
    setEditingDocument(document);
  };

  const handleDocumentSaved = () => {
    fetchDocuments();
  };

  // Vérifier si un document peut être diffusé (MOE uniquement)
  const canDiffuseDocument = (document: Document) => {
    return isMOE() && document.statut === 'En attente de diffusion';
  };

  // Vérifier si un document peut être visé (MANDATAIRE uniquement)
  const canVisaDocument = (document: Document) => {
    return isMandataire() && document.statut === 'En attente de visa';
  };

  // Ouvrir la boîte de dialogue de diffusion
  const handleOpenDiffusionDialog = (document: Document) => {
    setSelectedDocument(document);
    setShowDiffusionDialog(true);
  };

  // Ouvrir la boîte de dialogue de visa
  const handleOpenVisaDialog = (document: Document) => {
    setSelectedDocument(document);
    setShowVisaDialog(true);
  };

  // Download document from Supabase storage
  const handleDownloadDocument = async (documentItem: Document) => {
    try {
      if (!documentItem.file_path) {
        throw new Error('Le chemin du fichier est introuvable');
      }
      
      // Get download URL
      const { data: fileData, error: fileError } = await supabase.storage
        .from('documents')
        .download(documentItem.file_path);
      
      if (fileError) {
        throw fileError;
      }
      
      // Create a download link
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

  // Extraire et retourner que le titre du document (sans l'indice)
  const getDocumentTitle = (fullName: string) => {
    // Supprimer l'indice potentiel à la fin du nom
    return fullName.split(' - ')[0];
  };

  // Gérer la fin du processus de diffusion
  const handleDiffusionComplete = () => {
    setShowDiffusionDialog(false);
    fetchDocuments();
    toast({
      title: "Succès",
      description: "Le document a été diffusé avec succès",
    });
  };

  // Gérer la fin du processus de visa
  const handleVisaComplete = () => {
    setShowVisaDialog(false);
    fetchDocuments();
    toast({
      title: "Succès",
      description: "Le document a été visé avec succès",
    });
  };

  return (
    <div className="pt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold">Documents</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAllVersions(!showAllVersions)}
          >
            <History className="mr-2 h-4 w-4" />
            {showAllVersions ? "Masquer les anciennes versions" : "Afficher toutes les versions"}
          </Button>
          <MarcheDocumentForm 
            marcheId={marcheId} 
            editingDocument={editingDocument}
            setEditingDocument={setEditingDocument}
            onDocumentSaved={handleDocumentSaved}
          />
        </div>
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
              <TableHead>Titre</TableHead>
              <TableHead className="w-[80px]">Indice</TableHead>
              <TableHead className="hidden md:table-cell">Type</TableHead>
              <TableHead className="hidden md:table-cell">Date diffusion</TableHead>
              <TableHead className="hidden md:table-cell">Date visa</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Chargement des documents...
                </TableCell>
              </TableRow>
            ) : filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center">
                      {getDocumentIcon(doc.type)}
                      <span className="ml-2 font-medium">{getDocumentTitle(doc.nom)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    {doc.version}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{doc.type}</TableCell>
                  <TableCell className="hidden md:table-cell">{doc.date_diffusion_formatted}</TableCell>
                  <TableCell className="hidden md:table-cell">{doc.date_visa_formatted}</TableCell>
                  <TableCell>
                    <Badge className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.statut)}`}>
                      {doc.statut}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      {canDiffuseDocument(doc) && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8"
                                onClick={() => handleOpenDiffusionDialog(doc)}
                              >
                                <Send className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Diffuser</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Diffuser le document pour visa</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      
                      {!canDiffuseDocument(doc) && isMOE() && doc.statut !== 'BPE' && doc.statut !== 'Approuvé' && doc.statut !== 'Refusé' && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8"
                                disabled
                              >
                                <Send className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Diffuser</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Ce document a déjà été diffusé</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      
                      {canVisaDocument(doc) && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="default" 
                                size="sm"
                                className="h-8" 
                                onClick={() => handleOpenVisaDialog(doc)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Viser</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Valider ou refuser ce document</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      
                      {!canVisaDocument(doc) && isMandataire() && doc.statut !== 'BPE' && doc.statut !== 'Approuvé' && doc.statut !== 'Refusé' && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8"
                                disabled
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Viser</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Ce document doit d'abord être diffusé avant de pouvoir être visé</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleEditDocument(doc)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Modifier</span>
                      </Button>
                      
                      {/* Remplacer le bouton Voir par notre nouveau ViewDocumentButton */}
                      <ViewDocumentButton document={doc} />
                      
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
                <TableCell colSpan={7} className="text-center py-8">
                  Aucun document trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Boîte de dialogue pour la diffusion */}
      {selectedDocument && (
        <MarcheDiffusionDialog
          document={selectedDocument}
          open={showDiffusionDialog}
          onOpenChange={setShowDiffusionDialog}
          onDiffusionComplete={handleDiffusionComplete}
        />
      )}

      {/* Boîte de dialogue pour le visa */}
      {selectedDocument && (
        <MarcheVisaDialog
          document={selectedDocument}
          open={showVisaDialog}
          onOpenChange={setShowVisaDialog}
          onVisaComplete={handleVisaComplete}
        />
      )}
    </div>
  );
}
