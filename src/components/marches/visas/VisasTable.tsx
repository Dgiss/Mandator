
import React, { useState } from 'react';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Document, Version, Visa, VisaWithDocument } from '@/components/marches/visas/types';
import { useUserRole } from '@/hooks/userRole';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { generateDocumentReference } from '@/utils/documentFormatters';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VisaViewDialog } from './VisaViewDialog';

interface VisasTableProps {
  documents: Document[];
  onDocumentSelect: (document: Document) => void;
  loadingStates: Record<string, boolean>;
  openDiffusionDialog?: (document: Document, version: Version) => void;
  openVisaDialog?: (document: Document, version: Version) => void;
  visas?: Visa[];
  showHistoricalVisas?: boolean;
}

export const VisasTable: React.FC<VisasTableProps> = ({ 
  documents, 
  onDocumentSelect,
  loadingStates,
  openDiffusionDialog,
  openVisaDialog,
  visas = [],
  showHistoricalVisas = false
}) => {
  const [selectedVisa, setSelectedVisa] = useState<Visa | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);
  
  // Get user roles information with the marcheId from the first document (if available)
  const marcheId = documents.length > 0 && documents[0].marche_id ? documents[0].marche_id : undefined;
  const { isMOE, isMandataire } = useUserRole(marcheId);

  // Helper function to get appropriate status badge styling
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'BPE':
      case 'Approuvé':
      case 'VSO':
      case 'VAO':
        return 'bg-green-100 text-green-800';
      case 'En attente de validation':
      case 'En attente de visa':
        return 'bg-amber-100 text-amber-800';
      case 'En attente de diffusion':
      case 'Diffusé':
        return 'bg-blue-100 text-blue-800';
      case 'Brouillon':
        return 'bg-purple-100 text-purple-800';
      case 'Rejeté':
      case 'Refusé':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to get visa type from comment
  const getVisaType = (comment: string | null) => {
    if (!comment) return 'Inconnu';
    const lowerComment = comment.toLowerCase();
    if (lowerComment.includes('vso:')) return 'VSO';
    if (lowerComment.includes('vao:')) return 'VAO';
    if (lowerComment.includes('refusé:')) return 'REFUSÉ';
    return 'Autre';
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Date inconnue';
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy', { locale: fr });
    } catch (error) {
      return 'Date invalide';
    }
  };

  // Check if a document has a visa (VSO, VAO, Refusé, BPE)
  const hasVisa = (doc: Document) => {
    const visaStatuses = ['VSO', 'VAO', 'Refusé', 'BPE'];
    return visaStatuses.includes(doc.statut);
  };

  // Handle viewing a visa
  const handleViewVisa = (visa: Visa) => {
    setSelectedVisa(visa);
    setViewDialogOpen(true);
  };

  // Règles d'affichage du bouton de visa selon rôle (MOE UNIQUEMENT)
  const canUserViseDocument = (doc: Document) => {
    // Ajouter plus de logs pour déboguer
    console.log(`Viser button check for ${doc.nom}:`, {
      userIsMOE: isMOE(),
      userIsMandataire: isMandataire(),
      docStatus: doc.statut,
      hasVisaDialog: !!openVisaDialog,
      hasVisa: hasVisa(doc),
      docMarcheId: doc.marche_id
    });
    
    // Un MOE peut viser UNIQUEMENT un document "Diffusé" ou "En attente de visa" qui n'a pas déjà un visa
    // Si l'utilisateur a les deux rôles, on prioritise le rôle de MOE pour cette action
    return isMOE() && 
           (doc.statut === 'Diffusé' || doc.statut === 'En attente de visa') && 
           !!openVisaDialog && 
           !hasVisa(doc);
  };
  
  // Règles d'affichage du bouton de diffusion selon rôle (MANDATAIRE UNIQUEMENT)
  const canUserDiffuseDocument = (doc: Document) => {
    // Ajouter plus de logs pour déboguer
    console.log(`Diffuser button check for ${doc.nom}:`, {
      userIsMOE: isMOE(),
      userIsMandataire: isMandataire(),
      docStatus: doc.statut,
      hasDiffusionDialog: !!openDiffusionDialog,
      docMarcheId: doc.marche_id
    });
    
    // Un Mandataire peut diffuser UNIQUEMENT un document en "En attente de diffusion"
    // Le rôle MOE ne devrait JAMAIS pouvoir diffuser
    return isMandataire() && 
           !isMOE() &&   // Restriction explicite: MOE ne peut JAMAIS diffuser
           doc.statut === 'En attente de diffusion' && 
           !!openDiffusionDialog;
  };

  // Helper function to convert Document from visas/types to services/types format if needed
  const enrichDocumentIfNeeded = (document: Document) => {
    // Fix: Check if document is an object before trying to spread it
    if (!document) {
      return document;
    }
    
    // Now safely add marche_id if needed
    if (openDiffusionDialog && !('marche_id' in document) && marcheId) {
      return {
        ...document,
        marche_id: marcheId,
      };
    }
    return document;
  };

  return (
    <div className="rounded-md border">
      {!showHistoricalVisas ? (
        // Affichage normal des documents
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Designation</TableHead>
              <TableHead className="w-[240px]">Codification</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Aucun document trouvé
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => {
                const latestVersion = doc.version ? { version: doc.version, statut: doc.statut } : null;
                const showViserButton = canUserViseDocument(doc);
                const showDiffuserButton = canUserDiffuseDocument(doc);
                
                return (
                  <TableRow 
                    key={doc.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onDocumentSelect(doc)}
                  >
                    <TableCell className="font-medium truncate">
                      {doc.description || doc.nom}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {generateDocumentReference(enrichDocumentIfNeeded(doc))}
                    </TableCell>
                    <TableCell>
                      {latestVersion ? latestVersion.version : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(doc.statut)}`}>
                        {doc.statut}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        {/* Bouton Viser - uniquement pour MOE sur documents diffusés */}
                        {showViserButton && (
                          <button 
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (latestVersion && openVisaDialog) openVisaDialog(doc, latestVersion as Version);
                            }}
                          >
                            Viser
                          </button>
                        )}
                        
                        {/* Bouton Diffuser - uniquement pour Mandataire sur documents en attente de diffusion */}
                        {showDiffuserButton && (
                          <button 
                            className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-xs font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (latestVersion && openDiffusionDialog) openDiffusionDialog(doc, latestVersion as Version);
                            }}
                          >
                            Diffuser
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      ) : (
        // Affichage des visas historiques
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Type de visa</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Par</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Commentaire</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Aucun visa historique trouvé
                </TableCell>
              </TableRow>
            ) : (
              visas.map((visa) => {
                const visaType = getVisaType(visa.commentaire);
                let badgeClass;
                
                switch (visaType) {
                  case 'VSO':
                    badgeClass = 'bg-green-100 text-green-800';
                    break;
                  case 'VAO':
                    badgeClass = 'bg-yellow-100 text-yellow-800';
                    break;
                  case 'REFUSÉ':
                    badgeClass = 'bg-red-100 text-red-800';
                    break;
                  default:
                    badgeClass = 'bg-gray-100 text-gray-800';
                }
                
                // Extraire le commentaire sans le préfixe du type
                let cleanComment = visa.commentaire || '';
                if (cleanComment.includes(':')) {
                  cleanComment = cleanComment.split(':').slice(1).join(':').trim();
                }
                
                // Get document name safely
                const visaWithDoc = visa as unknown as VisaWithDocument;
                const documentName = visaWithDoc.documents && 
                  typeof visaWithDoc.documents === 'object' && 
                  'nom' in visaWithDoc.documents 
                    ? visaWithDoc.documents.nom 
                    : 'Document inconnu';
                
                return (
                  <TableRow key={visa.id}>
                    <TableCell className="font-medium">
                      {documentName}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${badgeClass} font-normal`}>
                        {visaType}
                      </Badge>
                    </TableCell>
                    <TableCell>{visa.version}</TableCell>
                    <TableCell>{visa.demande_par}</TableCell>
                    <TableCell>{formatDate(visa.date_demande)}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {cleanComment || 'Aucun commentaire'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleViewVisa(visa)}
                          title="Voir le visa"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Voir</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      )}

      {/* Visa Viewer Dialog */}
      <VisaViewDialog 
        visa={selectedVisa} 
        open={viewDialogOpen} 
        onOpenChange={setViewDialogOpen} 
      />
    </div>
  );
}
