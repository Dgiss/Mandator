
import React, { useMemo, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useVisaManagement } from './useVisaManagement';
import { VisasHeader } from './VisasHeader';
import { VisaFilters } from './VisaFilters';
import { VisasTable } from './VisasTable';
import { VisasLoading } from './VisasLoading';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DiffusionDialog } from './DiffusionDialog';
import { VisaDialog } from './VisaDialog';
import { Document, Version } from './types';
import { useUserRole } from '@/hooks/useUserRole';

export interface MarcheVisasProps {
  marcheId: string;
}

const MarcheVisas: React.FC<MarcheVisasProps> = ({ marcheId }) => {
  // Référence pour éviter les rendus en cascade
  const componentMountedRef = useRef(true);
  const previousMarcheIdRef = useRef<string | null>(null);
  
  // Reset state when switching between markets
  useEffect(() => {
    // Si le marcheId change, nous devons réinitialiser l'état
    if (previousMarcheIdRef.current && previousMarcheIdRef.current !== marcheId) {
      console.log(`Market ID changed from ${previousMarcheIdRef.current} to ${marcheId}`);
    }
    
    previousMarcheIdRef.current = marcheId;
    
    return () => {
      // Ce nettoyage est important pour éviter les fuites mémoire
      componentMountedRef.current = false;
    };
  }, [marcheId]);

  // Utiliser notre hook de rôle avec un paramètre stable 
  const stableMarcheId = useMemo(() => marcheId, [marcheId]);
  const { canDiffuse, canVisa } = useUserRole(stableMarcheId);

  const {
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
  } = useVisaManagement(stableMarcheId);

  // Mémoriser les fonctions de vérification des boutons pour éviter des recalculs inutiles
  const canShowDiffuseButton = useMemo(() => {
    return (document: Document, version: Version | null) => {
      if (!version) return false;
      return canDiffuse(marcheId) && version.statut === 'En attente de diffusion';
    };
  }, [canDiffuse, marcheId]);

  const canShowVisaButton = useMemo(() => {
    return (document: Document, version: Version | null) => {
      if (!version) return false;
      return canVisa(marcheId) && version.statut === 'En attente de visa';
    };
  }, [canVisa, marcheId]);

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>Une erreur s'est produite lors du chargement des documents. Veuillez réessayer plus tard.</p>
          <button 
            onClick={retryLoading} 
            className="underline text-sm self-start hover:text-blue-600"
          >
            Réessayer
          </button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <VisasHeader onDiffusionOpen={handleDiffusionDialogOpen} />
      <VisaFilters 
        options={filterOptions} 
        onFilterChange={handleFilter} 
      />
      
      {loading ? (
        <VisasLoading />
      ) : (
        <VisasTable 
          documents={filteredDocuments}
          onDocumentSelect={handleDocumentSelect}
          onVisaOpen={handleVisaDialogOpen}
          loadingStates={loadingStates}
          canShowDiffuseButton={canShowDiffuseButton}
          canShowVisaButton={canShowVisaButton}
          openDiffusionDialog={handleDiffusionDialogOpen}
          openVisaDialog={handleVisaDialogOpen}
        />
      )}
      
      {/* Dialog components */}
      {selectedDocument && (
        <>
          <DiffusionDialog
            open={diffusionDialogOpen}
            setOpen={handleDiffusionDialogClose}
            selectedDocument={selectedDocument}
            selectedVersion={selectedVersion}
            diffusionComment={diffusionComment}
            setDiffusionComment={setDiffusionComment}
            attachmentName={attachmentName}
            handleFileChange={handleFileChange}
            handleDiffusionSubmit={handleDiffusionSubmit}
          />
          
          <VisaDialog
            open={visaDialogOpen}
            setOpen={handleVisaDialogClose}
            selectedDocument={selectedDocument}
            selectedVersion={selectedVersion}
            visaType={visaSelectedDestinaire as 'VSO' | 'VAO' | 'Refusé'}
            setVisaType={setVisaSelectedDestinaire}
            visaComment={visaComment}
            setVisaComment={setVisaComment}
            attachmentName={attachmentName}
            handleFileChange={handleFileChange}
            handleVisaSubmit={handleVisaSubmit}
          />
        </>
      )}
    </div>
  );
};

export default MarcheVisas;
