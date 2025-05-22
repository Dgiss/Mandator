
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Document as ProjectDocument } from '@/services/types';
import { getPublicUrl } from '@/services/storageService';
import { Download, FileText, ExternalLink, Upload, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserRole } from '@/hooks/userRole';
import DocumentDetails from './DocumentDetails';
import DocumentActivities from './DocumentActivities';
import DocumentVersions from './DocumentVersions';
import DocumentUploader from './DocumentUploader';
import ModifyDocumentButton from './ModifyDocumentButton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';

interface DocumentViewerProps {
  document: ProjectDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDocumentUpdated?: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document: initialDocument,
  open,
  onOpenChange,
  onDocumentUpdated
}) => {
  const [activeTab, setActiveTab] = useState('apercu');
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const { canEdit } = useUserRole(initialDocument?.marche_id || '');
  const [document, setDocument] = useState<ProjectDocument | null>(initialDocument);

  // To prevent infinite loop, use a flag to track if an update has been made
  const [updatePending, setUpdatePending] = useState(false);
  
  // Format date for display - add here since DocumentDetails expects it
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return '—';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      return '—';
    }
  };
  
  // Effect to update the document state when the initialDocument prop changes
  useEffect(() => {
    setDocument(initialDocument);
  }, [initialDocument]);
  
  // Effect to fetch the latest document data when needed
  useEffect(() => {
    if (open && document?.id && !updatePending) {
      refreshDocumentData(document.id);
    }
  }, [open, document?.id]);
  
  // Function to refresh document data
  const refreshDocumentData = async (documentId: string) => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();
      
      if (error) throw error;
      if (data) {
        console.log('Refreshed document data:', data);
        setDocument(data as ProjectDocument);
      }
    } catch (error) {
      console.error('Error fetching document details:', error);
    }
  };
  
  if (!document) return null;
  
  const fileUrl = document.file_path 
    ? getPublicUrl('marches', document.file_path) 
    : null;
  
  const handleDocumentUpdate = () => {
    // Set the flag to prevent multiple updates
    if (!updatePending && onDocumentUpdated) {
      setUpdatePending(true);
      
      // Refresh document data first
      if (document?.id) {
        refreshDocumentData(document.id);
      }
      
      // Add a delay to prevent cascading updates
      setTimeout(() => {
        onDocumentUpdated();
        // Reset the flag after a delay to allow future updates
        setTimeout(() => {
          setUpdatePending(false);
        }, 1000);
      }, 500);
    }
  };

  const handleUploadSuccess = async () => {
    setIsUploaderOpen(false);
    
    // Refresh document data immediately after upload
    if (document?.id) {
      await refreshDocumentData(document.id);
    }
    
    // Then trigger the update callback after a brief delay
    setTimeout(() => {
      handleDocumentUpdate();
    }, 500);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span>{document.nom}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="apercu" className="flex-1">Aperçu</TabsTrigger>
                <TabsTrigger value="details" className="flex-1">Détails</TabsTrigger>
                <TabsTrigger value="versions" className="flex-1">Versions</TabsTrigger>
                <TabsTrigger value="activites" className="flex-1">Activités</TabsTrigger>
              </TabsList>
              
              <TabsContent value="apercu" className="mt-4">
                {fileUrl ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <Button 
                        variant="outline"
                        onClick={() => window.open(fileUrl, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Ouvrir dans un nouvel onglet
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={() => {
                          const link = window.document.createElement('a');
                          link.href = fileUrl;
                          link.setAttribute('download', document.nom);
                          window.document.body.appendChild(link);
                          link.click();
                          window.document.body.removeChild(link);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Télécharger
                      </Button>
                    </div>
                    
                    {document.file_path && document.file_path.toLowerCase().endsWith('.pdf') ? (
                      <iframe 
                        src={`${fileUrl}#view=FitH`} 
                        className="w-full h-[70vh] border rounded"
                        title={document.nom}
                      />
                    ) : document.file_path && /\.(jpe?g|png|gif|bmp)$/i.test(document.file_path) ? (
                      <img 
                        src={fileUrl || ''} 
                        alt={document.nom} 
                        className="max-w-full mx-auto max-h-[70vh] object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[70vh] bg-gray-100 rounded">
                        <FileText className="h-16 w-16 text-gray-400 mb-4" />
                        <p className="text-gray-600">Aperçu non disponible</p>
                        <p className="text-gray-500 text-sm mt-2">Téléchargez le fichier pour le visualiser</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded border border-dashed">
                    <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun fichier associé</h3>
                    <p className="text-gray-500 text-center mb-4">
                      Ce document n'a pas de fichier associé. Vous pouvez en télécharger un maintenant.
                    </p>
                    
                    {canEdit && (
                      <Button 
                        variant="outline"
                        onClick={() => setIsUploaderOpen(true)}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Télécharger un fichier
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="details" className="mt-4">
                <DocumentDetails 
                  document={document}
                  formatDate={formatDate}
                  onDocumentUpdated={handleDocumentUpdate}
                />
              </TabsContent>
              
              <TabsContent value="versions" className="mt-4">
                <DocumentVersions 
                  document={document}
                  onVersionAdded={handleDocumentUpdate}
                />
              </TabsContent>
              
              <TabsContent value="activites" className="mt-4">
                <DocumentActivities document={document} />
              </TabsContent>
            </Tabs>
          </div>
          
          {canEdit && (
            <div className="flex justify-end gap-2 mt-4">
              {document.file_path && (
                <Button 
                  variant="outline"
                  onClick={() => setIsUploaderOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Remplacer le fichier
                </Button>
              )}
              
              <ModifyDocumentButton 
                document={document}
                onDocumentUpdated={handleDocumentUpdate}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {document && (
        <DocumentUploader
          documentId={document.id}
          open={isUploaderOpen}
          onOpenChange={setIsUploaderOpen}
          onSuccess={handleUploadSuccess}
        />
      )}
    </>
  );
};

export default DocumentViewer;
