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

  // Nouvelle fonction pour incrémenter l'indice de version alphabétiquement
  const getNextVersionLetter = (currentVersion: string): string => {
    // Extraire la première lettre de la version actuelle (ex: 'A' dans 'A')
    const currentLetter = currentVersion.charAt(0);
    
    // Convertir en code ASCII et incrémenter (A→B, B→C, etc.)
    const nextLetterCode = currentLetter.charCodeAt(0) + 1;
    
    // Reconvertir en caractère
    return String.fromCharCode(nextLetterCode);
  };

  // Fonction pour créer une nouvelle version à partir d'une version refusée
  const createNextVersion = async (document: Document, refusedVersion: string, commentaire: string) => {
    try {
      // Obtenir la lettre suivante pour la nouvelle version
      const nextVersionLetter = getNextVersionLetter(refusedVersion);
      
      console.log(`Création de la version ${nextVersionLetter} suite au refus de la version ${refusedVersion}`);
      
      // Créer la nouvelle version dans la base de données
      const { data: newVersionData, error: newVersionError } = await supabase
        .from('versions')
        .insert({
          document_id: document.id,
          marche_id: marcheId,
          version: nextVersionLetter,
          cree_par: "Système (suite à refus)",
          commentaire: `Nouvelle version suite au refus de la version ${refusedVersion} - ${commentaire}`,
          statut: "En attente de diffusion",
          date_creation: new Date().toISOString()
        })
        .select();
      
      if (newVersionError) throw newVersionError;
      
      // Mettre à jour le document avec la nouvelle version comme version courante
      const { error: updateDocError } = await supabase
        .from('documents')
        .update({
          version: nextVersionLetter,
          statut: "En attente de diffusion"
        })
        .eq('id', document.id);
      
      if (updateDocError) throw updateDocError;
      
      toast({
        title: "Nouvelle version créée",
        description: `La version ${nextVersionLetter} du document a été créée automatiquement`
      });
      
      // Recharger les données pour actualiser l'affichage
      await fetchData();
      
      return true;
    } catch (error) {
      console.error("Erreur lors de la création de la nouvelle version:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la nouvelle version du document",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleProcessVisaSubmit = async (type: 'VSO' | 'VAO' | 'Refusé', comment: string) => {
    if (!selectedDocument || !selectedVersion) return;
    
    try {
      setLoadingStates(prev => ({...prev, [selectedDocument.id]: true}));
      
      let commentWithPrefix = '';
      let newDocumentStatus = '';
      let newVersionStatus = '';
      let createNewVersion = false;
      
      // Déterminer le commentaire et les statuts selon le type de visa
      switch (type) {
        case 'VSO':
          commentWithPrefix = `VSO: ${comment || 'Visa sans observation'}`;
          newDocumentStatus = 'BPE';
          newVersionStatus = 'BPE';
          createNewVersion = false;
          break;
        case 'VAO':
          commentWithPrefix = `VAO: ${comment}`;
          newDocumentStatus = 'En attente de diffusion';
          newVersionStatus = 'À remettre à jour';
          createNewVersion = true;
          break;
        case 'Refusé':
          commentWithPrefix = `Refusé: ${comment}`;
          newDocumentStatus = 'En attente de diffusion';
          newVersionStatus = 'Refusé';
          createNewVersion = true;
          break;
      }
      
      // Mettre à jour la version avec le nouveau statut
      const { error: versionError } = await supabase
        .from('versions')
        .update({ 
          statut: newVersionStatus,
          commentaire: commentWithPrefix
        })
        .eq('document_id', selectedDocument.id)
        .eq('version', selectedVersion.version);
      
      if (versionError) throw versionError;
      
      // Mettre à jour le document avec le nouveau statut
      const { error: documentError } = await supabase
        .from('documents')
        .update({ statut: newDocumentStatus })
        .eq('id', selectedDocument.id);
      
      if (documentError) throw documentError;
      
      // Mettre à jour le visa si nécessaire
      if (selectedVisa) {
        const { error: visaError } = await supabase
          .from('visas')
          .update({ 
            statut: type === 'VSO' ? 'Approuvé' : 'Refusé',
            commentaire: commentWithPrefix
          })
          .eq('id', selectedVisa.id);
        
        if (visaError) throw visaError;
      }
      
      // Si nécessaire, créer automatiquement une nouvelle version
      if (createNewVersion) {
        await createNextVersion(selectedDocument, selectedVersion.version, comment);
      }
      
      toast({
        title: "Visa traité",
        description: `Le document a été ${type === 'VSO' ? 'approuvé' : type === 'VAO' ? 'retourné avec observations' : 'refusé'}`
      });
      
      // Fermer la boîte de dialogue et actualiser les données
      setProcessVisaDialogOpen(false);
      clearDialogData();
      await fetchData();
    } catch (error) {
      console.error('Error processing visa:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du traitement du visa",
        variant: "destructive"
      });
    } finally {
      setLoadingStates(prev => ({...prev, [selectedDocument.id]: false}));
    }
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
