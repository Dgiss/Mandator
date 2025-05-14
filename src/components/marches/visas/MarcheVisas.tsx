
import React from 'react';
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
  } = useVisaManagement(marcheId);

  // Utilise notre hook de rôles pour vérifier les permissions
  const { canDiffuse, canVisa } = useUserRole(marcheId);

  // Fonction pour déterminer si le bouton de diffusion doit être affiché
  const canShowDiffuseButton = React.useCallback((document: Document, version: Version | null) => {
    if (!version) return false;
    // MOE voit "Diffuser" uniquement pour documents "En attente de diffusion"
    return canDiffuse(marcheId) && version.statut === 'En attente de diffusion';
  }, [canDiffuse, marcheId]);

  // Fonction pour déterminer si le bouton de visa doit être affiché
  const canShowVisaButton = React.useCallback((document: Document, version: Version | null) => {
    if (!version) return false;
    // Mandataire voit "Viser" uniquement pour documents "En attente de validation"
    return canVisa(marcheId) && version.statut === 'En attente de visa';
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
