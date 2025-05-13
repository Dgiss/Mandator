
import React from 'react';
import { useVisaManagement } from './useVisaManagement';
import { VisasHeader } from './VisasHeader';
import { VisaFilters } from './VisaFilters';  // Fixed import name to match actual export
import { VisasTable } from './VisasTable';
import { VisasLoading } from './VisasLoading';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
    handleFilter
  } = useVisaManagement(marcheId);

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          Une erreur s'est produite lors du chargement des documents. Veuillez réessayer plus tard.
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
        />
      )}
      
      {/* Dialog components are imported in the visas/index.ts */}
    </div>
  );
};

export default MarcheVisas;
