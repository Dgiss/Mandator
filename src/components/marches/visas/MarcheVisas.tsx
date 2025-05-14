
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertCircle } from '@/components/ui/alert';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Refresh } from 'lucide-react';
import { useVisaManagement } from './useVisaManagement';
import { VisasHeader } from './VisasHeader';
import { VisaFilters } from './VisaFilters';
import { VisasLoading } from './VisasLoading';
import { VisasTable } from './VisasTable';
import { DiffusionDialog } from './DiffusionDialog';
import { VisaDialog } from './VisaDialog';
import { ProcessVisaDialog } from './ProcessVisaDialog';
import { useUserRole } from '@/hooks/userRole';

interface MarcheVisasProps {
  marcheId: string;
}

export default function MarcheVisas({ marcheId }: MarcheVisasProps) {
  const { role, loading: roleLoading, canDiffuse, canVisa } = useUserRole();
  const {
    documents,
    filteredDocuments,
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
    retryLoading
  } = useVisaManagement(marcheId);

  if (loading || roleLoading) {
    return <VisasLoading />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Une erreur est survenue lors du chargement des documents. Veuillez réessayer.
          <Button onClick={retryLoading} variant="outline" className="ml-2">
            <Refresh className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Helper functions to determine which buttons to show based on status and user role
  const canShowDiffuseButton = (doc, version) => {
    return canDiffuse(marcheId) && doc.statut === 'En attente de diffusion';
  };

  const canShowVisaButton = (doc, version) => {
    return canDiffuse(marcheId) && doc.statut === 'En attente de visa';
  };

  const canShowProcessVisaButton = (doc, version) => {
    return canVisa(marcheId) && doc.statut === 'En attente de visa';
  };

  return (
    <div className="space-y-6">
      <VisasHeader />

      <Card>
        <CardContent className="p-5">
          <VisaFilters 
            filterOptions={filterOptions}
            handleFilter={handleFilter}
          />

          <div className="mt-6">
            <VisasTable 
              documents={filteredDocuments}
              onDocumentSelect={handleDocumentSelect}
              loadingStates={loadingStates}
              canShowDiffuseButton={canShowDiffuseButton}
              canShowVisaButton={canShowVisaButton}
              canShowProcessVisaButton={canShowProcessVisaButton}
              openDiffusionDialog={handleDiffusionDialogOpen}
              openVisaDialog={handleVisaDialogOpen}
              openProcessVisaDialog={handleProcessVisaDialogOpen}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dialog components */}
      <DiffusionDialog 
        open={diffusionDialogOpen}
        setOpen={handleDiffusionDialogClose}
        selectedDocument={selectedDocument}
        selectedVersion={selectedVersion}
        diffusionComment={diffusionComment}
        setDiffusionComment={setDiffusionComment}
        handleDiffusionSubmit={handleDiffusionSubmit}
      />

      <VisaDialog 
        open={visaDialogOpen}
        setOpen={handleVisaDialogClose}
        selectedDocument={selectedDocument}
        selectedVersion={selectedVersion}
        visaType="VSO"
        setVisaType={() => {}}
        visaComment={visaComment}
        setVisaComment={setVisaComment}
        attachmentName={attachmentName}
        handleFileChange={handleFileChange}
        handleVisaSubmit={handleVisaSubmit}
      />

      <ProcessVisaDialog 
        open={processVisaDialogOpen}
        setOpen={handleProcessVisaDialogClose}
        selectedDocument={selectedDocument}
        selectedVersion={selectedVersion}
        selectedVisa={selectedVisa}
        onProcessVisa={handleProcessVisaSubmit}
      />
    </div>
  );
}
