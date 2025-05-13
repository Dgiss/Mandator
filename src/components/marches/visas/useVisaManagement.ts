
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Document, Version } from './types';
import { useToast } from '@/hooks/use-toast';

export const useVisaManagement = (marcheId: string) => {
  // Data states
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [filterOptions, setFilterOptions] = useState({
    statut: 'Tous',
    type: 'Tous'
  });
  
  // UI states
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [loadAttempts, setLoadAttempts] = useState(0);
  
  // Dialog states
  const [diffusionDialogOpen, setDiffusionDialogOpen] = useState(false);
  const [visaDialogOpen, setVisaDialogOpen] = useState(false);
  const [diffusionComment, setDiffusionComment] = useState('');
  const [visaComment, setVisaComment] = useState('');
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [visaSelectedDestinaire, setVisaSelectedDestinaire] = useState('');
  const [visaEcheance, setVisaEcheance] = useState<Date | null>(null);
  
  const { toast } = useToast();

  // Load documents with retry mechanism and error handling
  const loadDocuments = useCallback(async () => {
    // Skip if no marcheId is provided
    if (!marcheId) {
      console.log("No marcheId provided, skipping document load");
      setLoading(false);
      return;
    }

    console.log(`Chargement des documents pour le marché ${marcheId}...`);
    
    try {
      setLoading(true);
      setError(null);
      
      // Get documents for the specified marche
      const { data: documentsData, error: documentsError } = await supabase
        .from('documents')
        .select('*')
        .eq('marche_id', marcheId);
      
      if (documentsError) {
        console.error("Erreur lors du chargement des documents:", documentsError);
        throw documentsError;
      }
      
      if (!documentsData || documentsData.length === 0) {
        console.log("Aucun document trouvé pour ce marché");
        setDocuments([]);
        setFilteredDocuments([]);
        setLoading(false);
        return;
      }
      
      console.log(`${documentsData.length} documents trouvés, chargement des versions...`);

      // Get versions for each document
      const { data: versionsData, error: versionsError } = await supabase
        .from('versions')
        .select('*')
        .eq('marche_id', marcheId);
        
      if (versionsError) {
        console.error("Erreur lors du chargement des versions:", versionsError);
        throw versionsError;
      }

      console.log(`${versionsData?.length || 0} versions trouvées, construction des données...`);

      // Map versions to documents, ensuring we follow our Document interface
      const documentsWithVersions: Document[] = documentsData.map(doc => {
        const docVersions = versionsData?.filter(v => v.document_id === doc.id) || [];
        const sortedVersions = docVersions.sort((a, b) => 
          new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime()
        );
        
        // Map the versions to our Version interface
        const mappedVersions: Version[] = sortedVersions.map(v => ({
          id: v.id,
          version: v.version,
          statut: v.statut as any
        }));
        
        const latestVersion = mappedVersions.length > 0 ? mappedVersions[0] : null;

        // Map the document to our Document interface
        return {
          id: doc.id,
          nom: doc.nom,
          type: doc.type,
          currentVersionId: latestVersion ? latestVersion.id : '',
          statut: doc.statut as any,
          versions: mappedVersions,
          latestVersion
        };
      });

      console.log("Traitement des documents terminé");
      setDocuments(documentsWithVersions);
      setFilteredDocuments(documentsWithVersions);
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error as Error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [marcheId, toast]);

  // Retry loading function
  const retryLoading = useCallback(() => {
    setLoadAttempts(prev => prev + 1);
  }, []);

  // Load documents only when marcheId changes or loadAttempts changes
  useEffect(() => {
    if (marcheId) {
      loadDocuments();
    }
  }, [loadDocuments, loadAttempts, marcheId]);

  // Filter documents based on selected options - use useMemo for performance
  const updateFilteredDocuments = useCallback(() => {
    if (!documents.length) return;
    
    let filtered = [...documents];
    
    if (filterOptions.statut !== 'Tous') {
      filtered = filtered.filter(doc => doc.statut === filterOptions.statut);
    }
    
    if (filterOptions.type !== 'Tous' && filtered.some(doc => doc.type)) {
      filtered = filtered.filter(doc => doc.type === filterOptions.type);
    }
    
    setFilteredDocuments(filtered);
  }, [documents, filterOptions]);

  // Apply filters when filterOptions or documents change
  useEffect(() => {
    updateFilteredDocuments();
  }, [updateFilteredDocuments]);

  // Handle document selection
  const handleDocumentSelect = useCallback((document: Document) => {
    setSelectedDocument(document);
    setSelectedVersion(document.latestVersion);
  }, []);

  // Handle diffusion dialog
  const handleDiffusionDialogOpen = useCallback((document: Document) => {
    setSelectedDocument(document);
    setSelectedVersion(document.latestVersion);
    setDiffusionDialogOpen(true);
  }, []);

  const handleDiffusionDialogClose = useCallback(() => {
    setDiffusionDialogOpen(false);
    setDiffusionComment('');
    setAttachmentName(null);
    setAttachmentFile(null);
  }, []);

  // Handle visa dialog
  const handleVisaDialogOpen = useCallback((document: Document) => {
    setSelectedDocument(document);
    setSelectedVersion(document.latestVersion);
    setVisaDialogOpen(true);
  }, []);

  const handleVisaDialogClose = useCallback(() => {
    setVisaDialogOpen(false);
    setVisaComment('');
    setVisaSelectedDestinaire('');
    setVisaEcheance(null);
    setAttachmentName(null);
    setAttachmentFile(null);
  }, []);

  // Handle file selection
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setAttachmentName(files[0].name);
      setAttachmentFile(files[0]);
    }
  }, []);

  // Handle diffusion submission
  const handleDiffusionSubmit = useCallback(async () => {
    if (!selectedDocument || !selectedVersion) {
      toast({
        title: "Erreur",
        description: "Aucun document ou version sélectionné",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Set loading state for this document
      setLoadingStates(prev => ({ ...prev, [selectedDocument.id]: true }));
      
      // TODO: Implement the actual diffusion logic here
      // For now, just show a success message and close the dialog
      
      toast({
        title: "Succès",
        description: "Document diffusé avec succès",
        variant: "success",
      });
      
      handleDiffusionDialogClose();
      loadDocuments(); // Reload the documents to reflect changes
    } catch (error) {
      console.error('Error during diffusion:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la diffusion",
        variant: "destructive",
      });
    } finally {
      // Reset loading state
      setLoadingStates(prev => ({ ...prev, [selectedDocument.id]: false }));
    }
  }, [selectedDocument, selectedVersion, toast, handleDiffusionDialogClose, loadDocuments]);

  // Handle visa submission
  const handleVisaSubmit = useCallback(async () => {
    if (!selectedDocument || !selectedVersion) {
      toast({
        title: "Erreur",
        description: "Aucun document ou version sélectionné",
        variant: "destructive",
      });
      return;
    }
    
    if (!visaSelectedDestinaire) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un destinataire",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Set loading state for this document
      setLoadingStates(prev => ({ ...prev, [selectedDocument.id]: true }));
      
      // TODO: Implement the actual visa request logic here
      // For now, just show a success message and close the dialog
      
      toast({
        title: "Succès",
        description: "Demande de visa envoyée avec succès",
        variant: "success",
      });
      
      handleVisaDialogClose();
      loadDocuments(); // Reload the documents to reflect changes
    } catch (error) {
      console.error('Error during visa request:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de la demande de visa",
        variant: "destructive",
      });
    } finally {
      // Reset loading state
      setLoadingStates(prev => ({ ...prev, [selectedDocument.id]: false }));
    }
  }, [selectedDocument, selectedVersion, visaSelectedDestinaire, toast, handleVisaDialogClose, loadDocuments]);

  // Handle filter changes
  const handleFilter = useCallback((name: string, value: string) => {
    setFilterOptions(prev => ({ ...prev, [name]: value }));
  }, []);

  return {
    documents,
    filteredDocuments,
    filterOptions,
    selectedDocument,
    selectedVersion,
    loading,
    error,
    loadingStates,
    attachmentName,
    diffusionComment,
    visaComment,
    visaDialogOpen,
    diffusionDialogOpen,
    visaSelectedDestinaire,
    visaEcheance,
    handleDocumentSelect,
    handleDiffusionDialogOpen,
    handleDiffusionDialogClose,
    handleDiffusionSubmit,
    handleVisaDialogOpen,
    handleVisaDialogClose,
    handleVisaSubmit,
    handleFileChange,
    setDiffusionComment,
    setVisaComment,
    setVisaSelectedDestinaire,
    setVisaEcheance,
    handleFilter,
    retryLoading
  };
};
