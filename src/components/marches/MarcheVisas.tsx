
import React, { useState } from 'react';
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

const visasMock: Visa[] = [
  {
    id: "v1",
    document: "CCTP GC v1.1",
    version: "A1.1",
    demandePar: "Martin Dupont",
    dateDemande: "21/03/2024",
    echeance: "28/03/2024",
    statut: "En attente"
  },
  {
    id: "v2",
    document: "Plan Coffrage R+1 v3",
    version: "B3.0",
    demandePar: "Sophie Laurent",
    dateDemande: "19/03/2024",
    echeance: "26/03/2024",
    statut: "VSO"
  },
  {
    id: "v3",
    document: "Note de Calcul Fondations",
    version: "A1.0",
    demandePar: "Thomas Bernard",
    dateDemande: "15/03/2024",
    echeance: "22/03/2024",
    statut: "VAO"
  },
  {
    id: "v4",
    document: "Détails Façade Ouest",
    version: "C2.1",
    demandePar: "Julie Moreau",
    dateDemande: "14/03/2024",
    echeance: "21/03/2024",
    statut: "Refusé"
  },
  {
    id: "v5",
    document: "Plan Structure v2",
    version: "B2.0",
    demandePar: "Pierre Lefebvre",
    dateDemande: "16/03/2024",
    echeance: "23/03/2024",
    statut: "VSO"
  }
];

// Documents fictifs pour simuler la logique de visibilité
const documentsMock: Document[] = [
  {
    id: "d1",
    nom: "CCTP GC",
    currentVersionId: "v1-1",
    statut: "En attente de diffusion",
    versions: [
      {
        id: "v1-1",
        version: "A1.1",
        statut: "En attente de diffusion"
      }
    ]
  },
  {
    id: "d2",
    nom: "Plan Coffrage R+1",
    currentVersionId: "v2-3",
    statut: "En attente de validation",
    versions: [
      {
        id: "v2-1",
        version: "A1.0",
        statut: "BPE"
      },
      {
        id: "v2-2",
        version: "B2.0",
        statut: "BPE"
      },
      {
        id: "v2-3",
        version: "B3.0",
        statut: "En attente de visa"
      }
    ]
  },
  {
    id: "d3",
    nom: "Note de Calcul Fondations",
    currentVersionId: "v3-2",
    statut: "En attente de diffusion",
    versions: [
      {
        id: "v3-1",
        version: "A1.0",
        statut: "À remettre à jour"
      },
      {
        id: "v3-2",
        version: "B1.0",
        statut: "En attente de diffusion"
      }
    ]
  },
  {
    id: "d4",
    nom: "Détails Façade Ouest",
    currentVersionId: "v4-1",
    statut: "Refusé",
    versions: [
      {
        id: "v4-1",
        version: "C2.1",
        statut: "Refusé"
      }
    ]
  },
  {
    id: "d5",
    nom: "Plan Structure",
    currentVersionId: "v5-2",
    statut: "Validé",
    versions: [
      {
        id: "v5-1",
        version: "A1.0",
        statut: "À remettre à jour"
      },
      {
        id: "v5-2",
        version: "B2.0",
        statut: "BPE"
      }
    ]
  }
];

export default function MarcheVisas({ marcheId }: MarcheVisasProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('tous');
  const [visas, setVisas] = useState<Visa[]>(visasMock);
  const [documents, setDocuments] = useState<Document[]>(documentsMock);
  
  // État pour gérer le rôle de l'utilisateur (dans une app réelle, viendrait de l'authentification)
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
  
  const { toast } = useToast();

  // Fonction pour rafraîchir les données après création d'un visa
  const handleVisaCreated = () => {
    // Dans une application réelle, cette fonction ferait un appel API
    // pour récupérer les données à jour. Ici, nous simulons cela.
    console.log('Visa créé, rafraîchissement des données...');
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

  // Fonction pour déterminer si le bouton "Diffuser" est visible
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

  // Fonction pour déterminer si le bouton "Viser" est visible
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
    setDiffusionDialogOpen(true);
  };

  // Ouvrir la modal de visa
  const openVisaDialog = (document: Document, version: Version) => {
    setSelectedDocument(document);
    setSelectedVersion(version);
    setVisaType('VSO');
    setVisaComment('');
    setAttachmentName(null);
    setVisaDialogOpen(true);
  };

  // Gérer la soumission du formulaire de diffusion
  const handleDiffusionSubmit = () => {
    if (!selectedDocument || !selectedVersion) return;
    
    // Dans une application réelle, ceci serait un appel API
    // Mise à jour du statut du document et de la version
    const updatedDocuments = documents.map(doc => {
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
    });
    
    setDocuments(updatedDocuments);
    setDiffusionDialogOpen(false);
    
    toast({
      title: "Document diffusé",
      description: `${selectedDocument.nom} v${selectedVersion.version} a été diffusé avec succès.`,
      variant: "success",
    });
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
  const handleVisaSubmit = () => {
    if (!selectedDocument || !selectedVersion) return;
    
    // Dans une application réelle, ceci serait un appel API
    
    // Créer un nouveau visa
    const newVisa: Visa = {
      id: `visa-${Date.now()}`,
      document: selectedDocument.nom,
      version: selectedVersion.version,
      demandePar: 'Utilisateur actuel', // Dans une app réelle, serait l'utilisateur connecté
      dateDemande: new Date().toLocaleDateString('fr-FR'),
      echeance: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'), // +7 jours
      statut: visaType
    };
    
    setVisas([...visas, newVisa]);
    
    // Mettre à jour le statut selon le type de visa
    let updatedDocuments = [...documents];
    let notificationTitle = "";
    let notificationDescription = "";
    
    switch(visaType) {
      case 'VSO':
        // Mettre à jour le statut du document à Validé et la version à BPE
        updatedDocuments = documents.map(doc => {
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
        });
        
        notificationTitle = "Document approuvé";
        notificationDescription = `${selectedDocument.nom} v${selectedVersion.version} a été approuvé sans observation.`;
        break;
        
      case 'VAO':
        // Créer une nouvelle version et mettre à jour le statut
        const newVersionLetter = handleNewVersionIndex(selectedVersion.version);
        const versionBase = selectedVersion.version.substring(1); // Enlever la première lettre
        const newVersion: Version = {
          id: `${selectedDocument.id}-v${Date.now()}`,
          version: `${newVersionLetter}${versionBase}`,
          statut: 'En attente de diffusion'
        };
        
        updatedDocuments = documents.map(doc => {
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
        });
        
        notificationTitle = "Document avec observations";
        notificationDescription = `${selectedDocument.nom} v${selectedVersion.version} a reçu un visa avec observations. Une nouvelle version ${newVersionLetter}${versionBase} a été créée.`;
        break;
        
      case 'Refusé':
        // Mettre à jour le statut du document à En attente de diffusion et la version à Refusé
        updatedDocuments = documents.map(doc => {
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
        });
        
        notificationTitle = "Document refusé";
        notificationDescription = `${selectedDocument.nom} v${selectedVersion.version} a été refusé.`;
        break;
    }
    
    setDocuments(updatedDocuments);
    setVisaDialogOpen(false);
    
    toast({
      title: notificationTitle,
      description: notificationDescription,
      variant: visaType === 'Refusé' ? "destructive" : "success",
    });
  };

  // Gérer le changement de fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
            <AlertDialogAction onClick={handleVisaSubmit} className="flex items-center">
              <Check className="mr-2 h-4 w-4" />
              Valider
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
