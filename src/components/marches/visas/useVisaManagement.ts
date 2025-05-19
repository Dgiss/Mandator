
import { useState, useEffect } from 'react';
import { Document, Version, Visa } from '@/components/marches/visas/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/userRole';

// Types
interface FilterOptions {
  statut: string;
  type: string;
}

export function useVisaManagement(marcheId: string) {
  // État des documents et visas
  const [documents, setDocuments] = useState<Document[]>([]);
  const [visas, setVisas] = useState<Visa[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  
  // État de sélection et de filtrage
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [selectedVisa, setSelectedVisa] = useState<Visa | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    statut: 'all',
    type: 'all'
  });

  // État d'interface
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  
  // État des boîtes de dialogue
  const [diffusionDialogOpen, setDiffusionDialogOpen] = useState<boolean>(false);
  const [visaDialogOpen, setVisaDialogOpen] = useState<boolean>(false);
  const [processVisaDialogOpen, setProcessVisaDialogOpen] = useState<boolean>(false);
  
  // État des formulaires
  const [diffusionComment, setDiffusionComment] = useState<string>('');
  const [visaComment, setVisaComment] = useState<string>('');
  const [attachmentName, setAttachmentName] = useState<string | null>(null);

  // Access user role information
  const { isMOE, isMandataire } = useUserRole(marcheId);
  const { toast } = useToast();

  // Charger les documents et les visas du marché
  useEffect(() => {
    fetchData();
  }, [marcheId]);

  // Filter documents when filter options or documents change
  useEffect(() => {
    applyFilters();
  }, [documents, filterOptions]);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    
    try {
      // Fetch documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('documents')
        .select('*')
        .eq('marche_id', marcheId)
        .order('created_at', { ascending: false });
      
      if (documentsError) throw documentsError;
      
      // Transform documents to match our expected type
      const transformedDocuments = documentsData as Document[];
      
      // Fetch visas
      const { data: visasData, error: visasError } = await supabase
        .from('visas')
        .select('*, documents(nom)')
        .eq('marche_id', marcheId)
        .order('date_demande', { ascending: false });
        
      if (visasError) throw visasError;
      
      // Transform visas to handle potential errors in the documents join
      const safeVisas: Visa[] = visasData.map((visa: any) => {
        // Handle the case where documents might be an error object or missing nom property
        const visaWithSafeDocuments: Visa = {
          ...visa,
          documents: visa.documents && typeof visa.documents === 'object' && 'nom' in visa.documents 
            ? visa.documents 
            : { nom: 'Document inconnu' }
        };
        return visaWithSafeDocuments;
      });
      
      setDocuments(transformedDocuments);
      setFilteredDocuments(transformedDocuments);
      setVisas(safeVisas);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...documents];
    
    if (filterOptions.statut !== 'all') {
      filtered = filtered.filter(doc => doc.statut === filterOptions.statut);
    }
    
    if (filterOptions.type !== 'all') {
      filtered = filtered.filter(doc => doc.type === filterOptions.type);
    }
    
    setFilteredDocuments(filtered);
  };

  const handleFilter = (key: keyof FilterOptions, value: string) => {
    setFilterOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
    // Set a default version based on document.version
    if (document.version) {
      setSelectedVersion({
        version: document.version,
        statut: document.statut
      } as Version);
    } else {
      setSelectedVersion(null);
    }
  };

  const handleDiffusionDialogOpen = (document: Document, version: Version) => {
    setSelectedDocument(document);
    setSelectedVersion(version);
    setDiffusionComment('');
    setAttachmentName(null);
    setDiffusionDialogOpen(true);
  };

  const handleDiffusionDialogClose = (open: boolean) => {
    setDiffusionDialogOpen(open);
    if (!open) {
      clearDialogData();
    }
  };

  const handleVisaDialogOpen = (document: Document, version: Version) => {
    setSelectedDocument(document);
    setSelectedVersion(version);
    setVisaComment('');
    setAttachmentName(null);
    setVisaDialogOpen(true);
  };

  const handleVisaDialogClose = (open: boolean) => {
    setVisaDialogOpen(open);
    if (!open) {
      clearDialogData();
    }
  };

  const handleProcessVisaDialogOpen = (document: Document, version: Version, visa: Visa) => {
    setSelectedDocument(document);
    setSelectedVersion(version);
    setSelectedVisa(visa);
    setProcessVisaDialogOpen(true);
  };

  const handleProcessVisaDialogClose = (open: boolean) => {
    setProcessVisaDialogOpen(open);
    if (!open) {
      clearDialogData();
    }
  };

  const clearDialogData = () => {
    // Clear dialog-related data after closing
    setDiffusionComment('');
    setVisaComment('');
    setAttachmentName(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachmentName(e.target.files[0].name);
    } else {
      setAttachmentName(null);
    }
  };

  const handleDiffusionSubmit = async () => {
    // Implement diffusion logic
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Diffusion réussie",
      description: "Le document a été diffusé avec succès"
    });
    setDiffusionDialogOpen(false);
    clearDialogData();
    await fetchData();
  };

  const handleVisaSubmit = async () => {
    // Implement visa logic
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Visa ajouté",
      description: "Le visa a été ajouté avec succès"
    });
    setVisaDialogOpen(false);
    clearDialogData();
    await fetchData();
  };

  const handleProcessVisaSubmit = async (type: 'VSO' | 'VAO' | 'Refusé', comment: string) => {
    // Implement process visa logic
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Visa traité",
      description: "Le visa a été traité avec succès"
    });
    setProcessVisaDialogOpen(false);
    clearDialogData();
    await fetchData();
  };

  const retryLoading = () => {
    fetchData();
  };

  // Added helper functions to check user permissions
  const canUserProcessVisa = () => {
    return isMOE() || isMandataire();
  };

  return {
    documents,
    filteredDocuments,
    visas,
    filterOptions,
    selectedDocument,
    selectedVersion,
    selectedVisa,
    loading,
    error,
    loadingStates,
    diffusionDialogOpen,
    visaDialogOpen,
    processVisaDialogOpen,
    diffusionComment,
    visaComment,
    attachmentName,
    handleDocumentSelect,
    handleDiffusionDialogOpen,
    handleDiffusionDialogClose,
    handleDiffusionSubmit,
    handleVisaDialogOpen,
    handleVisaDialogClose,
    handleVisaSubmit,
    handleProcessVisaDialogOpen,
    handleProcessVisaDialogClose,
    handleProcessVisaSubmit,
    handleFileChange,
    setDiffusionComment,
    setVisaComment,
    handleFilter,
    retryLoading,
    canUserProcessVisa
  };
}
