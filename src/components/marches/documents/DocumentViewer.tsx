
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Document as ProjectDocument } from '@/services/types';
import { fileStorage } from '@/services/storage/fileStorage.ts';
import { Download, FileText, ExternalLink, Upload, AlertCircle, Loader2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const { canEdit, isMandataire } = useUserRole(initialDocument?.marche_id || '');
  const [document, setDocument] = useState<ProjectDocument | null>(initialDocument);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isFileChecking, setIsFileChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [fileType, setFileType] = useState<string | null>(null);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const { toast } = useToast();

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
    // Reset PDF data URL when document changes
    setPdfDataUrl(null);
  }, [initialDocument]);
  
  // Effect to fetch the latest document data when needed
  useEffect(() => {
    if (open && document?.id && !updatePending) {
      refreshDocumentData(document.id);
    }
  }, [open, document?.id]);
  
  // Effect to check if the file exists and prepare PDF if needed
  useEffect(() => {
    const checkFileExists = async () => {
      if (open && document?.file_path) {
        setIsFileChecking(true);
        setFileError(null);
        setFileType(null);
        setPdfDataUrl(null);
        
        try {
          const exists = await fileStorage.fileExists('marches', document.file_path);
          
          if (!exists) {
            setFileError("Le fichier associé à ce document n'existe pas ou n'est pas accessible.");
            setIsFileChecking(false);
            return;
          }
          
          // Determine file type from extension more reliably
          const fileExtension = document.file_path.split('.').pop()?.toLowerCase() || '';
          const mimeType = fileStorage.getMimeTypeFromExtension(fileExtension);
          
          console.log(`File exists with extension .${fileExtension} and detected MIME type: ${mimeType}`);
          
          if (mimeType.startsWith('image/')) {
            setFileType('image');
            setIsFileChecking(false);
          } else if (mimeType === 'application/pdf') {
            setFileType('pdf');
            // For PDFs, we'll create a data URL to avoid MIME type issues
            await loadPdfAsDataUrl(document.file_path);
          } else {
            setFileType('other');
            setIsFileChecking(false);
          }
        } catch (error) {
          console.error("Error checking if file exists:", error);
          setFileError("Erreur lors de la vérification du fichier.");
          setIsFileChecking(false);
        }
      }
    };
    
    checkFileExists();
  }, [open, document?.file_path]);
  
  // Function to load PDF as data URL
  const loadPdfAsDataUrl = async (filePath: string) => {
    setIsLoadingPdf(true);
    try {
      // Download the file content as blob
      const fileBlob = await fileStorage.downloadFile('marches', filePath);
      
      if (!fileBlob) {
        throw new Error("Impossible de télécharger le fichier PDF");
      }
      
      // Create a new blob with the correct PDF MIME type
      const pdfBlob = new Blob([fileBlob], { type: 'application/pdf' });
      
      // Convert blob to base64 data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        setPdfDataUrl(base64data);
        setIsLoadingPdf(false);
        setIsFileChecking(false);
      };
      reader.onerror = () => {
        console.error("Error reading file as data URL");
        setFileError("Erreur lors de la lecture du fichier PDF");
        setIsLoadingPdf(false);
        setIsFileChecking(false);
      };
      reader.readAsDataURL(pdfBlob);
    } catch (error) {
      console.error("Error creating PDF data URL:", error);
      setFileError("Erreur lors de la préparation du fichier PDF");
      setIsLoadingPdf(false);
      setIsFileChecking(false);
    }
  };
  
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
    ? fileStorage.getPublicUrl('marches', document.file_path) 
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
    setFileError(null);
    setPdfDataUrl(null); // Reset PDF data URL
    
    // Refresh document data immediately after upload
    if (document?.id) {
      await refreshDocumentData(document.id);
    }
    
    // Then trigger the update callback after a brief delay
    setTimeout(() => {
      handleDocumentUpdate();
    }, 500);
  };

  const handleDownload = async () => {
    if (!document.file_path) {
      toast({
        title: "Erreur",
        description: "Aucun fichier associé à ce document.",
        variant: "destructive",
      });
      return;
    }
    
    setIsDownloading(true);
    
    try {
      // Use our improved download method with proper MIME type handling
      const fileData = await fileStorage.downloadFile('marches', document.file_path);
      
      if (!fileData) {
        throw new Error("Impossible de télécharger le fichier");
      }
      
      // Extract the original filename from the path
      const originalFilename = document.file_path.split('/').pop()?.split('_').slice(1).join('_') || document.nom || "document";
      
      // Get file extension and ensure filename has correct extension
      const fileExtension = document.file_path.split('.').pop()?.toLowerCase() || '';
      const finalFilename = originalFilename.includes(`.${fileExtension}`) 
        ? originalFilename 
        : `${originalFilename}.${fileExtension}`;
      
      // Create a download link using the global window.document
      const url = URL.createObjectURL(fileData);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = finalFilename;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Succès",
        description: `Téléchargement de "${finalFilename}" réussi`,
      });
    } catch (error: any) {
      console.error("Error downloading file:", error);
      toast({
        title: "Erreur",
        description: `Échec du téléchargement: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
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
                {isFileChecking || isLoadingPdf ? (
                  <div className="flex flex-col items-center justify-center h-[70vh] bg-gray-50 rounded">
                    <Loader2 className="h-12 w-12 text-gray-400 animate-spin mb-4" />
                    <p className="text-gray-600">
                      {isLoadingPdf ? "Préparation du fichier PDF..." : "Vérification du fichier..."}
                    </p>
                  </div>
                ) : fileUrl && !fileError ? (
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
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="flex items-center gap-2"
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Téléchargement...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            Télécharger
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {fileError ? (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{fileError}</AlertDescription>
                      </Alert>
                    ) : null}
                    
                    {fileType === 'pdf' ? (
                      <>
                        {pdfDataUrl ? (
                          // Use the data URL for displaying PDF
                          <iframe 
                            src={pdfDataUrl}
                            className="w-full h-[70vh] border rounded"
                            title={document.nom}
                            onError={(e) => {
                              console.error("Error loading PDF in iframe:", e);
                              setFileError("Impossible d'afficher le fichier PDF. Essayez de le télécharger.");
                            }}
                          />
                        ) : (
                          // Fallback to regular iframe with URL
                          <iframe 
                            src={`${fileUrl}#view=FitH`}
                            className="w-full h-[70vh] border rounded"
                            title={document.nom}
                            onError={(e) => {
                              console.error("Error loading PDF in iframe:", e);
                              setFileError("Impossible d'afficher le fichier PDF. Essayez de le télécharger.");
                            }}
                          />
                        )}
                        {/* Fallback if iframe doesn't display correctly */}
                        <p className="text-center text-sm text-gray-500 mt-2">
                          Si le PDF ne s'affiche pas correctement, utilisez les boutons ci-dessus pour l'ouvrir ou le télécharger.
                        </p>
                      </>
                    ) : fileType === 'image' ? (
                      <img 
                        src={fileUrl || ''} 
                        alt={document.nom} 
                        className="max-w-full mx-auto max-h-[70vh] object-contain"
                        onError={() => {
                          console.error("Error loading image");
                          setFileError("Impossible d'afficher l'image. Essayez de la télécharger.");
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[70vh] bg-gray-100 rounded">
                        <FileText className="h-16 w-16 text-gray-400 mb-4" />
                        <p className="text-gray-600">Aperçu non disponible</p>
                        <p className="text-gray-500 text-sm mt-2">Ce type de fichier ne peut pas être prévisualisé. Veuillez télécharger le fichier pour le consulter.</p>
                        <Button 
                          variant="outline"
                          onClick={handleDownload}
                          className="mt-4 flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Télécharger
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded border border-dashed">
                    <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {fileError || "Aucun fichier associé"}
                    </h3>
                    <p className="text-gray-500 text-center mb-4">
                      {fileError 
                        ? "Un problème est survenu avec le fichier associé à ce document."
                        : "Ce document n'a pas de fichier associé. Vous pouvez en télécharger un maintenant."}
                    </p>
                    
                    {isMandataire && (
                      <Button 
                        variant="outline"
                        onClick={() => setIsUploaderOpen(true)}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        {fileError ? "Remplacer le fichier" : "Télécharger un fichier"}
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
          
          {isMandataire && (
            <div className="flex justify-end gap-2 mt-4">
              {(document.file_path || fileError) && (
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

