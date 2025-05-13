
import React from 'react';
import { Card } from '@/components/ui/card';
import { useUserRole } from '@/hooks/userRole';
import { VisasHeader } from './VisasHeader';
import { VisaFilters } from './VisaFilters';
import { VisasTable } from './VisasTable';
import { VisasLoading } from './VisasLoading';
import { DiffusionDialog } from './DiffusionDialog';
import { VisaDialog } from './VisaDialog';
import { useVisaManagement } from './useVisaManagement';
import { MarcheVisasProps } from './types';

export default function MarcheVisas({ marcheId }: MarcheVisasProps) {
  // Use our useUserRole hook for role-based permissions
  const { 
    role, 
    isAdmin,
    isMOE,
    isMandataire
  } = useUserRole(marcheId);
  
  // Use our custom hook for visa management
  const {
    documents,
    visas,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    loading,
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
    canShowDiffuseButton: baseCanShowDiffuseButton,
    canShowVisaButton: baseCanShowVisaButton,
    openDiffusionDialog,
    openVisaDialog,
    handleDiffusionSubmit,
    handleVisaSubmit,
    handleFileChange
  } = useVisaManagement(marcheId);

  // Wrapper functions to incorporate user role permissions
  const canShowDiffuseButton = (document, version) => {
    return (isMOE || isAdmin) && baseCanShowDiffuseButton(document, version);
  };

  const canShowVisaButton = (document, version) => {
    return (isMandataire || isAdmin) && baseCanShowVisaButton(document, version);
  };

  // If data is loading, show the loading state
  if (loading) {
    return <VisasLoading />;
  }

  return (
    <div className="pt-6">
      <VisasHeader 
        showNewVisaButton={isMOE || isAdmin}
        marcheId={marcheId}
        onVisaCreated={handleVisaCreated}
      />

      <VisaFilters
        visas={visas}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <Card>
        <VisasTable
          documents={documents}
          canShowDiffuseButton={canShowDiffuseButton}
          canShowVisaButton={canShowVisaButton}
          openDiffusionDialog={openDiffusionDialog}
          openVisaDialog={openVisaDialog}
        />
      </Card>

      {/* Modal de diffusion pour le MOE */}
      <DiffusionDialog
        open={diffusionDialogOpen}
        setOpen={setDiffusionDialogOpen}
        selectedDocument={selectedDocument}
        selectedVersion={selectedVersion}
        diffusionComment={diffusionComment}
        setDiffusionComment={setDiffusionComment}
        attachmentName={attachmentName}
        handleFileChange={handleFileChange}
        handleDiffusionSubmit={handleDiffusionSubmit}
      />

      {/* Modal de visa pour le Mandataire */}
      <VisaDialog
        open={visaDialogOpen}
        setOpen={setVisaDialogOpen}
        selectedDocument={selectedDocument}
        selectedVersion={selectedVersion}
        visaType={visaType}
        setVisaType={setVisaType}
        visaComment={visaComment}
        setVisaComment={setVisaComment}
        attachmentName={attachmentName}
        handleFileChange={handleFileChange}
        handleVisaSubmit={handleVisaSubmit}
      />
    </div>
  );
}
