
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Document, Version, Visa } from './types';

export const useVisaManagement = (marcheId: string) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('tous');
  const [visas, setVisas] = useState<Visa[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // États pour les modales
  const [diffusionDialogOpen, setDiffusionDialogOpen] = useState(false);
  const [visaDialogOpen, setVisaDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  
  // États pour les formulaires dans les modales
  const [diffusionComment, setDiffusionComment] = useState('');
  const [visaType, setVisaType] = useState<'VSO' | 'VAO' | 'Refusé'>('VSO');
  const [visaComment, setVisaComment] = useState('');
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Chargement des documents et visas depuis Supabase
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        // Charger les documents
        const { data: documentsData, error: documentsError } = await supabase
          .from('documents')
          .select('*')
          .eq('marche_id', marcheId);
          
        if (documentsError) throw documentsError;
        
        // Charger les versions
        const { data: versionsData, error: versionsError } = await supabase
          .from('versions')
          .select('*')
          .eq('marche_id', marcheId);
          
        if (versionsError) throw versionsError;
        
        // Charger les visas
        const { data: visasData, error: visasError } = await supabase
          .from('visas')
          .select('*')
          .eq('marche_id', marcheId);
          
        if (visasError) throw visasError;
        
        // Transformer les données pour correspondre à notre structure
        const formattedDocuments: Document[] = documentsData.map((doc) => {
          const docVersions = versionsData
            .filter(v => v.document_id === doc.id)
            .map(v => ({
              id: v.id,
              version: v.version,
              statut: (v.statut || 'En attente de diffusion') as Version['statut']
            }));
            
          const latestVersion = docVersions[docVersions.length - 1];
          
          return {
            id: doc.id,
            nom: doc.nom,
            currentVersionId: latestVersion?.id || '',
            statut: doc.statut as Document['statut'],
            versions: docVersions
          };
        });
        
        const formattedVisas: Visa[] = visasData.map((visa) => {
          // Trouver le document associé
          const document = documentsData.find(d => d.id === visa.document_id);
          
          return {
            id: visa.id,
            document: document?.nom || 'Document inconnu',
            version: visa.version,
            demandePar: visa.demande_par,
            dateDemande: new Date(visa.date_demande ?? '').toLocaleDateString('fr-FR'),
            echeance: visa.echeance ? new Date(visa.echeance).toLocaleDateString('fr-FR') : '-',
            statut: (visa.statut as 'En attente' | 'VSO' | 'VAO' | 'Refusé') || 'En attente'
          };
        });
        
        setDocuments(formattedDocuments);
        setVisas(formattedVisas);
        
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données",
          variant: "destructive",
        });
      }
    };
    
    loadDocuments();
  }, [marcheId, toast]);

  // Fonction pour rafraîchir les données après création d'un visa
  const handleVisaCreated = () => {
    // Recharger les données après création d'un visa
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('visas')
          .select('*')
          .eq('marche_id', marcheId);
          
        if (error) throw error;
        
        // Mettre à jour les visas avec les nouvelles données
        const formattedVisas = data.map(visa => ({
          id: visa.id,
          document: visa.document_id,  // Dans un cas réel, on ferait une jointure
          version: visa.version,
          demandePar: visa.demande_par,
          dateDemande: new Date(visa.date_demande ?? '').toLocaleDateString('fr-FR'),
          echeance: visa.echeance ? new Date(visa.echeance).toLocaleDateString('fr-FR') : '-',
          statut: (visa.statut as 'En attente' | 'VSO' | 'VAO' | 'Refusé') || 'En attente'
        }));
        
        setVisas(formattedVisas);
      } catch (error) {
        console.error('Error refreshing visas:', error);
      }
    };
    
    fetchData();
  };

  // Filtrer les visas selon le terme de recherche et l'onglet actif
  const filteredVisas = visas
    .filter(visa => visa.document.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(visa => {
      if (activeTab === 'tous') return true;
      if (activeTab === 'attente') return visa.statut === 'En attente';
      if (activeTab === 'vso') return visa.statut === 'VSO';
      if (activeTab === 'vao') return visa.statut === 'VAO';
      if (activeTab === 'rejetes') return visa.statut === 'Refusé';
      return true;
    });

  // Fonction pour déterminer si on peut diffuser une version (pour les MOE)
  const canShowDiffuseButton = (document: Document, version: Version) => {
    // Les vérifications d'autorisation sont faites dans le composant parent
    // Cette fonction ne vérifie que les conditions liées au document/version
    
    // Vérifie si le document est en attente de diffusion
    if (document.statut !== 'En attente de diffusion') return false;
    
    // Vérifie si la version est en attente de diffusion
    if (version.statut !== 'En attente de diffusion') return false;
    
    return true;
  };

  // Fonction pour déterminer si on peut voir le bouton "Viser" (pour les Mandataires)
  const canShowVisaButton = (document: Document, version: Version) => {
    // Les vérifications d'autorisation sont faites dans le composant parent
    // Cette fonction ne vérifie que les conditions liées au document/version
    
    // Vérifie si le document est en attente de validation
    if (document.statut !== 'En attente de validation') return false;
    
    // Vérifie si la version est en attente de visa
    return version.statut === 'En attente de visa';
  };

  // Ouvrir la modal de diffusion
  const openDiffusionDialog = (document: Document, version: Version) => {
    setSelectedDocument(document);
    setSelectedVersion(version);
    setDiffusionComment('');
    setAttachmentName(null);
    setSelectedFile(null);
    setDiffusionDialogOpen(true);
  };

  // Ouvrir la modal de visa
  const openVisaDialog = (document: Document, version: Version) => {
    setSelectedDocument(document);
    setSelectedVersion(version);
    setVisaType('VSO');
    setVisaComment('');
    setAttachmentName(null);
    setSelectedFile(null);
    setVisaDialogOpen(true);
  };

  // Fonction pour incrémenter l'index de version (A -> B -> C, etc.)
  const handleNewVersionIndex = (currentVersion: string): string => {
    if (!currentVersion) return "A";
    
    // Extraire la première lettre (ex: "A" de "A1.0")
    const letterPart = currentVersion.charAt(0);
    
    // Incrémenter cette lettre (A → B, B → C, etc.)
    const newLetterCode = letterPart.charCodeAt(0) + 1;
    const newLetter = String.fromCharCode(newLetterCode);
    
    return newLetter;
  };

  // Gérer la soumission du formulaire de diffusion
  const handleDiffusionSubmit = async () => {
    if (!selectedDocument || !selectedVersion) return;
    
    try {
      let filePath = null;
      
      // Téléverser le fichier si disponible
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}_${selectedFile.name}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(`marches/${marcheId}/${fileName}`, selectedFile);
          
        if (uploadError) throw uploadError;
        
        filePath = uploadData?.path || null;
      }
      
      // Mettre à jour le statut du document
      const { error: docUpdateError } = await supabase
        .from('documents')
        .update({ 
          statut: 'En attente de validation',
          file_path: filePath || selectedDocument.versions[0].id
        })
        .eq('id', selectedDocument.id);
        
      if (docUpdateError) throw docUpdateError;
      
      // Mettre à jour le statut de la version
      const { error: versionUpdateError } = await supabase
        .from('versions')
        .update({ statut: 'En attente de visa' })
        .eq('id', selectedVersion.id);
        
      if (versionUpdateError) throw versionUpdateError;
      
      // Fermer la dialog et mettre à jour l'état local
      setDiffusionDialogOpen(false);
      
      // Mettre à jour l'état local pour refléter les changements
      setDocuments(prevDocs => prevDocs.map(doc => {
        if (doc.id === selectedDocument.id) {
          return {
            ...doc,
            statut: 'En attente de validation' as Document['statut'],
            versions: doc.versions.map(ver => {
              if (ver.id === selectedVersion.id) {
                return {
                  ...ver,
                  statut: 'En attente de visa' as Version['statut']
                };
              }
              return ver;
            })
          };
        }
        return doc;
      }));
      
      toast({
        title: "Document diffusé",
        description: `${selectedDocument.nom} v${selectedVersion.version} a été diffusé avec succès.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error submitting diffusion:', error);
      toast({
        title: "Erreur",
        description: "Impossible de diffuser le document.",
        variant: "destructive",
      });
    }
  };

  // Gérer la soumission du formulaire de visa
  const handleVisaSubmit = async () => {
    if (!selectedDocument || !selectedVersion || !user) return;
    
    try {
      let filePath = null;
      
      // Téléverser le fichier si disponible
      if (selectedFile) {
        const fileName = `${Date.now()}_${selectedFile.name}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('visas')
          .upload(`marches/${marcheId}/${fileName}`, selectedFile);
          
        if (uploadError) throw uploadError;
        
        filePath = uploadData?.path || null;
      }
      
      // Créer un nouveau visa
      const newVisa = {
        document_id: selectedDocument.id,
        marche_id: marcheId,
        version: selectedVersion.version,
        demande_par: user.email || 'Utilisateur actuel',
        statut: visaType,
        commentaire: visaComment,
        attachment_path: filePath,
        echeance: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      const { data: visaData, error: visaError } = await supabase
        .from('visas')
        .insert([newVisa])
        .select();
        
      if (visaError) throw visaError;
      
      // Gérer les différents cas selon le type de visa
      switch(visaType) {
        case 'VSO':
          // Mettre à jour le statut du document à Validé et la version à BPE
          await supabase
            .from('documents')
            .update({ statut: 'Validé' })
            .eq('id', selectedDocument.id);
            
          await supabase
            .from('versions')
            .update({ statut: 'BPE' })
            .eq('id', selectedVersion.id);
            
          // Mettre à jour l'état local
          setDocuments(prevDocs => prevDocs.map(doc => {
            if (doc.id === selectedDocument.id) {
              return {
                ...doc,
                statut: 'Validé' as Document['statut'],
                versions: doc.versions.map(ver => {
                  if (ver.id === selectedVersion.id) {
                    return { 
                      ...ver, 
                      statut: 'BPE' as Version['statut'] 
                    };
                  }
                  return ver;
                })
              };
            }
            return doc;
          }));
          
          toast({
            title: "Document approuvé",
            description: `${selectedDocument.nom} v${selectedVersion.version} a été approuvé sans observation.`,
            variant: "default",
          });
          break;
          
        case 'VAO':
          // Créer une nouvelle version avec la lettre incrémentée
          const versionBase = selectedVersion.version.substring(1); // Enlever la première lettre
          const newVersionLetter = handleNewVersionIndex(selectedVersion.version);
          const newVersionString = `${newVersionLetter}${versionBase}`;
          
          // Mettre à jour l'ancienne version comme "À remettre à jour"
          await supabase
            .from('versions')
            .update({ statut: 'À remettre à jour' })
            .eq('id', selectedVersion.id);
            
          // Créer la nouvelle version
          const { data: newVersionData, error: newVersionError } = await supabase
            .from('versions')
            .insert([{
              document_id: selectedDocument.id,
              marche_id: marcheId,
              version: newVersionString,
              cree_par: user.email || 'Utilisateur système',
              statut: 'En attente de diffusion',
              commentaire: `Nouvelle version suite au visa VAO sur ${selectedVersion.version}`
            }])
            .select();
            
          if (newVersionError) throw newVersionError;
          
          // Mettre à jour le document
          await supabase
            .from('documents')
            .update({ 
              statut: 'En attente de diffusion'
            })
            .eq('id', selectedDocument.id);
            
          // Mettre à jour l'état local
          if (newVersionData && newVersionData.length > 0) {
            const newVersion = {
              id: newVersionData[0].id,
              version: newVersionString,
              statut: 'En attente de diffusion' as Version['statut']
            };
            
            setDocuments(prevDocs => prevDocs.map(doc => {
              if (doc.id === selectedDocument.id) {
                return {
                  ...doc,
                  statut: 'En attente de diffusion' as Document['statut'],
                  currentVersionId: newVersion.id,
                  versions: [
                    ...doc.versions.map(ver => {
                      if (ver.id === selectedVersion.id) {
                        return { 
                          ...ver, 
                          statut: 'À remettre à jour' as Version['statut'] 
                        };
                      }
                      return ver;
                    }),
                    newVersion
                  ]
                };
              }
              return doc;
            }));
          }
          
          toast({
            title: "Document avec observations",
            description: `${selectedDocument.nom} v${selectedVersion.version} a reçu un visa avec observations. Une nouvelle version ${newVersionLetter}${versionBase} a été créée.`,
            variant: "default",
          });
          break;
          
        case 'Refusé':
          // Mettre à jour le statut du document et de la version
          await supabase
            .from('documents')
            .update({ statut: 'En attente de diffusion' })
            .eq('id', selectedDocument.id);
            
          await supabase
            .from('versions')
            .update({ statut: 'Refusé' })
            .eq('id', selectedVersion.id);
            
          // Mettre à jour l'état local
          setDocuments(prevDocs => prevDocs.map(doc => {
            if (doc.id === selectedDocument.id) {
              return {
                ...doc,
                statut: 'En attente de diffusion' as Document['statut'],
                versions: doc.versions.map(ver => {
                  if (ver.id === selectedVersion.id) {
                    return { 
                      ...ver, 
                      statut: 'Refusé' as Version['statut'] 
                    };
                  }
                  return ver;
                })
              };
            }
            return doc;
          }));
          
          toast({
            title: "Document refusé",
            description: `${selectedDocument.nom} v${selectedVersion.version} a été refusé.`,
            variant: "destructive",
          });
          break;
      }
      
      // Fermer la dialog
      setVisaDialogOpen(false);
      
      // Ajouter le nouveau visa à la liste locale
      const newVisaForState: Visa = {
        id: visaData?.[0]?.id || 'temp-id',
        document: selectedDocument.nom,
        version: selectedVersion.version,
        demandePar: user.email || 'Utilisateur actuel',
        dateDemande: new Date().toLocaleDateString('fr-FR'),
        echeance: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
        statut: visaType
      };
      
      setVisas([...visas, newVisaForState]);
      
    } catch (error) {
      console.error('Error submitting visa:', error);
      toast({
        title: "Erreur",
        description: "Impossible de soumettre le visa.",
        variant: "destructive",
      });
    }
  };

  // Gérer le changement de fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAttachmentName(file.name);
    }
  };

  return {
    documents,
    visas: filteredVisas,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    diffusionDialogOpen,
    setDiffusionDialogOpen,
    visaDialogOpen,
    setVisaDialogOpen,
    selectedDocument,
    selectedVersion,
    diffusionComment,
    setDiffusionComment,
    visaType,
    setVisaType,
    visaComment,
    setVisaComment,
    attachmentName,
    handleVisaCreated,
    canShowDiffuseButton,
    canShowVisaButton,
    openDiffusionDialog,
    openVisaDialog,
    handleDiffusionSubmit,
    handleVisaSubmit,
    handleFileChange
  };
};
