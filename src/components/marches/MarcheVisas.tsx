
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
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  FileText, 
  FilePen, 
  Upload, 
  Send,
  Check,
  X,
  ClipboardCheck
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// Import du formulaire de visa
import MarcheVisaForm from './MarcheVisaForm';

interface MarcheVisasProps {
  marcheId: string;
}

interface Visa {
  id: string;
  document: string;
  version: string;
  demandePar: string;
  dateDemande: string;
  echeance: string;
  statut: 'En attente' | 'VSO' | 'VAO' | 'Refusé';
}

// Types étendus pour gérer les statuts des documents
interface Version {
  id: string;
  version: string;
  statut: 'En attente de diffusion' | 'En attente de visa' | 'BPE' | 'À remettre à jour' | 'Refusé';
}

interface Document {
  id: string;
  nom: string;
  currentVersionId: string;
  statut: 'En attente de diffusion' | 'En attente de validation' | 'Validé' | 'Refusé';
  versions: Version[];
}

// Rôle de l'utilisateur actuel (simulé - dans une application réelle, viendrait de l'authentification)
type UserRole = 'Mandataire' | 'MOE' | 'MOA';

export default function MarcheVisas({ marcheId }: MarcheVisasProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('tous');
  const [visas, setVisas] = useState<Visa[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // État pour gérer le rôle de l'utilisateur
  const [userRole, setUserRole] = useState<UserRole>('Mandataire');
  
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
  
  // Chargement du rôle de l'utilisateur depuis Supabase
  useEffect(() => {
    if (user) {
      const fetchUserRole = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (data && data.role) {
          setUserRole(data.role as UserRole);
        } else {
          console.error('Error fetching user role:', error);
        }
      };
      
      fetchUserRole();
    }
  }, [user]);

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

  // Fonction pour obtenir le style du statut
  const getStatusStyle = (statut: Visa['statut']) => {
    switch (statut) {
      case 'En attente':
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          icon: <FileText className="h-4 w-4 mr-1.5" />
        };
      case 'VSO':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          icon: <CheckCircle className="h-4 w-4 mr-1.5" />
        };
      case 'VAO':
        return {
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-700',
          icon: <FilePen className="h-4 w-4 mr-1.5" />
        };
      case 'Refusé':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          icon: <XCircle className="h-4 w-4 mr-1.5" />
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          icon: <FileText className="h-4 w-4 mr-1.5" />
        };
    }
  };

  // Fonction pour déterminer si le bouton "Diffuser" est visible (Mandataire)
  const canShowDiffuseButton = (document: Document, version: Version) => {
    if (userRole !== 'Mandataire') return false;
    
    // Vérifie si le document est en attente de diffusion
    if (document.statut !== 'En attente de diffusion') return false;
    
    // Vérifie si la version est en attente de diffusion
    if (version.statut !== 'En attente de diffusion') return false;
    
    // Si c'est la première version et qu'elle n'a jamais été diffusée, autoriser la diffusion
    if (document.versions.length === 1 && version.id === document.versions[0].id) {
      return true;
    }
    
    // Pour les versions ultérieures, vérifier qu'il y a au moins un visa sur une version précédente
    const hasPreviousVisa = visas.some(v => 
      v.document === document.nom && 
      v.version !== version.version
    );
    
    return hasPreviousVisa;
  };

  // Fonction pour déterminer si le bouton "Viser" est visible (MOE)
  const canShowVisaButton = (document: Document, version: Version) => {
    if (userRole !== 'MOE') return false;
    
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

  // Basculer entre les rôles pour tester la visibilité des boutons
  const toggleRole = () => {
    setUserRole(role => role === 'Mandataire' ? 'MOE' : 'Mandataire');
    toast({
      title: "Rôle changé",
      description: `Vous êtes maintenant en mode ${userRole === 'Mandataire' ? 'MOE' : 'Mandataire'}`,
      variant: "default",
    });
  };

  return (
    <div className="pt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold">Visas</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={toggleRole} variant="outline" size="sm">
            Mode: {userRole}
          </Button>
          <MarcheVisaForm marcheId={marcheId} onVisaCreated={handleVisaCreated} />
        </div>
      </div>

      <div className="mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="tous">
              Tous <span className="ml-1.5 text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">{visas.length}</span>
            </TabsTrigger>
            <TabsTrigger value="attente">
              En attente <span className="ml-1.5 text-xs bg-blue-100 px-1.5 py-0.5 rounded-full">{visas.filter(v => v.statut === 'En attente').length}</span>
            </TabsTrigger>
            <TabsTrigger value="vso">
              VSO <span className="ml-1.5 text-xs bg-green-100 px-1.5 py-0.5 rounded-full">{visas.filter(v => v.statut === 'VSO').length}</span>
            </TabsTrigger>
            <TabsTrigger value="vao">
              VAO <span className="ml-1.5 text-xs bg-amber-100 px-1.5 py-0.5 rounded-full">{visas.filter(v => v.statut === 'VAO').length}</span>
            </TabsTrigger>
            <TabsTrigger value="rejetes">
              Refusés <span className="ml-1.5 text-xs bg-red-100 px-1.5 py-0.5 rounded-full">{visas.filter(v => v.statut === 'Refusé').length}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un visa..."
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
              <TableHead>Document</TableHead>
              <TableHead className="hidden md:table-cell">Version</TableHead>
              <TableHead className="hidden md:table-cell">Demandé par</TableHead>
              <TableHead className="hidden md:table-cell">Date demande</TableHead>
              <TableHead>Échéance</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map(document => (
              document.versions.map(version => {
                // Trouver le visa correspondant (dans un cas réel, nous aurions une relation directe)
                const matchingVisa = visas.find(v => 
                  v.document === document.nom && 
                  v.version === version.version
                );
                
                return (
                  <TableRow key={version.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-btp-blue" />
                        {document.nom}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{version.version}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {matchingVisa?.demandePar || '-'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {matchingVisa?.dateDemande || '-'}
                    </TableCell>
                    <TableCell>{matchingVisa?.echeance || '-'}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                        ${version.statut === 'En attente de diffusion' ? 'bg-blue-100 text-blue-700' : ''}
                        ${version.statut === 'En attente de visa' ? 'bg-yellow-100 text-yellow-700' : ''}
                        ${version.statut === 'BPE' ? 'bg-green-100 text-green-700' : ''}
                        ${version.statut === 'À remettre à jour' ? 'bg-amber-100 text-amber-700' : ''}
                        ${version.statut === 'Refusé' ? 'bg-red-100 text-red-700' : ''}
                      `}>
                        {version.statut === 'En attente de diffusion' && <FileText className="h-4 w-4 mr-1.5" />}
                        {version.statut === 'En attente de visa' && <FileText className="h-4 w-4 mr-1.5" />}
                        {version.statut === 'BPE' && <CheckCircle className="h-4 w-4 mr-1.5" />}
                        {version.statut === 'À remettre à jour' && <FilePen className="h-4 w-4 mr-1.5" />}
                        {version.statut === 'Refusé' && <XCircle className="h-4 w-4 mr-1.5" />}
                        {version.statut}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {canShowDiffuseButton(document, version) && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => openDiffusionDialog(document, version)}
                          >
                            <Upload className="h-4 w-4 mr-1.5" />
                            Diffuser
                          </Button>
                        )}
                        
                        {canShowVisaButton(document, version) && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => openVisaDialog(document, version)}
                          >
                            <ClipboardCheck className="h-4 w-4 mr-1.5" />
                            Viser
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ))}
            
            {documents.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Aucun document trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal de diffusion pour le Mandataire */}
      <Dialog open={diffusionDialogOpen} onOpenChange={setDiffusionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Diffuser le document</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Vous êtes sur le point de diffuser {selectedDocument?.nom} version {selectedVersion?.version}
              </p>
            </div>
            
            {/* Zone de dépôt de fichiers */}
            <div className="space-y-2">
              <Label>Fichiers à diffuser</Label>
              <div className="border border-dashed border-gray-300 rounded-md p-4">
                <label htmlFor="diffusion-files" className="flex flex-col items-center justify-center h-24 cursor-pointer">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">
                    {attachmentName ? attachmentName : "Cliquez ou glissez-déposez des fichiers ici"}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">PDF, DOCX, DWG, max 20MB</span>
                  <input
                    id="diffusion-files"
                    type="file"
                    accept=".pdf,.docx,.doc,.dwg"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
            
            {/* Commentaire */}
            <div className="space-y-2">
              <Label htmlFor="diffusion-comment">Commentaire</Label>
              <Textarea
                id="diffusion-comment"
                placeholder="Ajoutez un commentaire pour les validateurs..."
                value={diffusionComment}
                onChange={(e) => setDiffusionComment(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDiffusionDialogOpen(false)}
              className="flex items-center"
            >
              <X className="mr-2 h-4 w-4" />
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleDiffusionSubmit}
              className="flex items-center"
            >
              <Send className="mr-2 h-4 w-4" />
              Diffuser
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de visa pour le MOE */}
      <AlertDialog open={visaDialogOpen} onOpenChange={setVisaDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Visa du document</AlertDialogTitle>
            <AlertDialogDescription>
              Vous pouvez émettre un visa pour {selectedDocument?.nom} version {selectedVersion?.version}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Type de visa */}
            <div className="space-y-2">
              <Label>Type de visa</Label>
              <RadioGroup 
                value={visaType} 
                onValueChange={(value) => setVisaType(value as 'VSO' | 'VAO' | 'Refusé')}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2 p-2 border rounded-md hover:bg-gray-50">
                  <RadioGroupItem value="VSO" id="vso" />
                  <Label htmlFor="vso" className="flex items-center cursor-pointer">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <div>
                      <span className="font-medium">VSO (Visa Sans Observation)</span>
                      <p className="text-xs text-gray-500">Document approuvé, devient Bon Pour Exécution</p>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 p-2 border rounded-md hover:bg-gray-50">
                  <RadioGroupItem value="VAO" id="vao" />
                  <Label htmlFor="vao" className="flex items-center cursor-pointer">
                    <FilePen className="h-4 w-4 text-amber-600 mr-2" />
                    <div>
                      <span className="font-medium">VAO (Visa Avec Observation)</span>
                      <p className="text-xs text-gray-500">Nouvelle version requise avec modification</p>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 p-2 border rounded-md hover:bg-gray-50">
                  <RadioGroupItem value="Refusé" id="refuse" />
                  <Label htmlFor="refuse" className="flex items-center cursor-pointer">
                    <XCircle className="h-4 w-4 text-red-600 mr-2" />
                    <div>
                      <span className="font-medium">Refusé</span>
                      <p className="text-xs text-gray-500">Document rejeté, sans création de nouvelle version</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Zone de dépôt de fichiers */}
            <div className="space-y-2">
              <Label>Pièces jointes</Label>
              <div className="border border-dashed border-gray-300 rounded-md p-4">
                <label htmlFor="visa-files" className="flex flex-col items-center justify-center h-24 cursor-pointer">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">
                    {attachmentName ? attachmentName : "Cliquez ou glissez-déposez des fichiers ici"}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">PDF, DOCX, max 10MB</span>
                  <input
                    id="visa-files"
                    type="file"
                    accept=".pdf,.docx,.doc"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
            
            {/* Commentaire */}
            <div className="space-y-2">
              <Label htmlFor="visa-comment">Commentaire {visaType === 'VAO' && "(obligatoire)"}</Label>
              <Textarea
                id="visa-comment"
                placeholder={
                  visaType === 'VAO' 
                    ? "Précisez les modifications requises pour la nouvelle version..."
                    : "Commentaire ou observation sur le visa..."
                }
                value={visaComment}
                onChange={(e) => setVisaComment(e.target.value)}
                required={visaType === 'VAO'}
              />
              {visaType === 'VAO' && (
                <p className="text-xs text-amber-600">
                  * Obligatoire pour les visas avec observations (VAO).
                </p>
              )}
            </div>
          </div>
          
          <AlertDialogFooter className="sm:justify-end">
            <AlertDialogCancel className="flex items-center">
              <X className="mr-2 h-4 w-4" />
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleVisaSubmit} 
              className="flex items-center"
              disabled={visaType === 'VAO' && !visaComment.trim()}
            >
              <Check className="mr-2 h-4 w-4" />
              Valider
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
