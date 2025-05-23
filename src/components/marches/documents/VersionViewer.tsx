
import React, { useState, useEffect } from 'react';
import { Document, Version } from '@/services/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText, ExternalLink, AlertCircle, Loader2, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { fileStorage } from '@/services/storage/fileStorage.ts';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VersionViewerProps {
  version: Version | null;
  document: Document;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isMandataire: boolean;
}

const VersionViewer: React.FC<VersionViewerProps> = ({
  version,
  document,
  open,
  onOpenChange,
  isMandataire
}) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isFileChecking, setIsFileChecking] = useState(false);
  const [fileType, setFileType] = useState<string | null>(null);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  // Format date for display
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return '—';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      return '—';
    }
  };

  // Effect to check file existence and prepare for display
  useEffect(() => {
    const checkFileExists = async () => {
      if (!open || !version?.file_path) return;

      setIsFileChecking(true);
      setFileError(null);
      setFileType(null);
      setPdfDataUrl(null);
      
      try {
        // Check if file exists
        const exists = await fileStorage.fileExists('marches', version.file_path);
        
        if (!exists) {
          setFileError("Le fichier associé à cette version n'existe pas ou n'est pas accessible.");
          setIsFileChecking(false);
          return;
        }
        
        // Get public URL
        const url = fileStorage.getPublicUrl('marches', version.file_path);
        setFileUrl(url);
        
        // Determine file type from extension
        const fileExtension = version.file_path.split('.').pop()?.toLowerCase() || '';
        const mimeType = fileStorage.getMimeTypeFromExtension(fileExtension);
        
        if (mimeType.startsWith('image/')) {
          setFileType('image');
        } else if (mimeType === 'application/pdf') {
          setFileType('pdf');
          // For PDFs, create a data URL to avoid MIME type issues
          await loadPdfAsDataUrl(version.file_path);
        } else {
          setFileType('other');
        }
      } catch (error) {
        console.error("Error checking if file exists:", error);
        setFileError("Erreur lors de la vérification du fichier.");
      } finally {
        setIsFileChecking(false);
      }
    };
    
    checkFileExists();
  }, [open, version?.file_path]);

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
      };
      reader.onerror = () => {
        console.error("Error reading file as data URL");
        setFileError("Erreur lors de la lecture du fichier PDF");
        setIsLoadingPdf(false);
      };
      reader.readAsDataURL(pdfBlob);
    } catch (error) {
      console.error("Error creating PDF data URL:", error);
      setFileError("Erreur lors de la préparation du fichier PDF");
      setIsLoadingPdf(false);
    }
  };

  // Function to download the version file
  const handleDownload = async () => {
    if (!version || !version.file_path) {
      toast({
        title: "Erreur",
        description: "Aucun fichier associé à cette version.",
        variant: "destructive",
      });
      return;
    }
    
    setIsDownloading(true);
    
    try {
      // Use our improved download method with proper MIME type handling
      const fileData = await fileStorage.downloadFile('marches', version.file_path);
      
      if (!fileData) {
        throw new Error("Impossible de télécharger le fichier");
      }
      
      // Extract the original filename from the path
      const originalFilename = version.file_path.split('/').pop()?.split('_').slice(1).join('_') || `version_${version.version}.pdf`;
      
      // Get file extension and ensure filename has correct extension
      const fileExtension = version.file_path.split('.').pop()?.toLowerCase() || '';
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

  // Get status badge class
  const getStatusBadgeClass = (status: string | undefined) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status) {
      case 'BPE':
      case 'Approuvé':
        return 'bg-green-100 text-green-800';
      case 'En attente de validation':
      case 'En attente de visa':
        return 'bg-amber-100 text-amber-800';
      case 'En attente de diffusion':
        return 'bg-blue-100 text-blue-800';
      case 'À remettre à jour':
        return 'bg-purple-100 text-purple-800';
      case 'Rejeté':
      case 'Refusé':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!version) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span>Version {version.version} - {document.nom}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Version comment if available - Highlighted section */}
          {version.commentaire && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Commentaire
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{version.commentaire}</p>
              </CardContent>
            </Card>
          )}

          {/* Version details */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Informations de la version</h3>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Version</TableCell>
                  <TableCell>{version.version}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Statut</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeClass(version.statut)}>
                      {version.statut || 'Non défini'}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Créé par</TableCell>
                  <TableCell>{version.cree_par}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Date de création</TableCell>
                  <TableCell>{formatDate(version.date_creation)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Taille</TableCell>
                  <TableCell>{version.taille || '—'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Document preview */}
          <div className="space-y-3">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h3 className="text-lg font-medium">Aperçu du document</h3>
              
              <div className="flex gap-2">
                {fileUrl && !fileError && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline"
                          onClick={() => window.open(fileUrl, '_blank')}
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span className="hidden sm:inline">Ouvrir</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Ouvrir dans un nouvel onglet
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline"
                        onClick={handleDownload}
                        disabled={isDownloading || !version.file_path}
                        className="flex items-center gap-2"
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span className="hidden sm:inline">Téléchargement...</span>
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">Télécharger</span>
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Télécharger le fichier
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Document preview content */}
            {isFileChecking || isLoadingPdf ? (
              <div className="flex flex-col items-center justify-center h-[400px] bg-gray-50 rounded">
                <Loader2 className="h-12 w-12 text-gray-400 animate-spin mb-4" />
                <p className="text-gray-600">
                  {isLoadingPdf ? "Préparation du fichier PDF..." : "Vérification du fichier..."}
                </p>
              </div>
            ) : fileUrl && !fileError ? (
              <>
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
                        className="w-full h-[400px] border rounded"
                        title={`Version ${version.version} - ${document.nom}`}
                        onError={() => {
                          console.error("Error loading PDF in iframe");
                          setFileError("Impossible d'afficher le fichier PDF. Essayez de le télécharger.");
                        }}
                      />
                    ) : (
                      // Fallback to regular iframe with URL
                      <iframe 
                        src={`${fileUrl}#view=FitH`}
                        className="w-full h-[400px] border rounded"
                        title={`Version ${version.version} - ${document.nom}`}
                        onError={() => {
                          console.error("Error loading PDF in iframe");
                          setFileError("Impossible d'afficher le fichier PDF. Essayez de le télécharger.");
                        }}
                      />
                    )}
                    <p className="text-center text-sm text-gray-500 mt-2">
                      Si le PDF ne s'affiche pas correctement, utilisez les boutons ci-dessus pour l'ouvrir ou le télécharger.
                    </p>
                  </>
                ) : fileType === 'image' ? (
                  <img 
                    src={fileUrl || ''} 
                    alt={`Version ${version.version} - ${document.nom}`} 
                    className="max-w-full mx-auto max-h-[400px] object-contain"
                    onError={() => {
                      console.error("Error loading image");
                      setFileError("Impossible d'afficher l'image. Essayez de la télécharger.");
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] bg-gray-100 rounded">
                    <FileText className="h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-gray-600">Aperçu non disponible</p>
                    <p className="text-gray-500 text-sm mt-2">Ce type de fichier ne peut pas être prévisualisé. Veuillez télécharger le fichier pour le consulter.</p>
                    <Button 
                      variant="outline"
                      onClick={handleDownload}
                      className="mt-4"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 h-[400px] bg-gray-50 rounded border border-dashed">
                <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {fileError || "Aucun fichier associé"}
                </h3>
                <p className="text-gray-500 text-center mb-4">
                  {fileError 
                    ? "Un problème est survenu avec le fichier associé à cette version."
                    : "Cette version n'a pas de fichier associé."}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VersionViewer;
