
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Visa, Document } from '@/services/types';
import { Eye, Download, FileText, MessageSquare, Calendar, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { fileStorage } from '@/services/storage/fileStorage';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDocumentPreview } from '@/hooks/documentPreview/useDocumentPreview';

interface VisaViewDialogProps {
  visa: Visa | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VisaViewDialog: React.FC<VisaViewDialogProps> = ({ visa, open, onOpenChange }) => {
  const [activeTab, setActiveTab] = useState<string>('details');
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloading, setDownloading] = useState<boolean>(false);
  
  const { 
    fileUrl, 
    fileType, 
    pdfDataUrl, 
    fileError, 
    isFileChecking, 
    isLoadingPdf
  } = useDocumentPreview(
    visa?.attachment_path ? { 
      filePath: visa.attachment_path, 
      bucket: 'visas',
      open: open && activeTab === 'document'
    } : null
  );

  useEffect(() => {
    const fetchDocument = async () => {
      if (!visa?.document_id || !open) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('id', visa.document_id)
          .single();
          
        if (error) {
          console.error('Error fetching document:', error);
          toast.error('Erreur lors du chargement du document');
        } else {
          setDocument(data);
        }
      } catch (error) {
        console.error('Error fetching document:', error);
        toast.error('Erreur lors du chargement du document');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocument();
  }, [visa?.document_id, open]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '—';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
    } catch (error) {
      return '—';
    }
  };

  const getVisaType = (commentaire: string | null | undefined) => {
    if (!commentaire) return 'Inconnu';
    
    if (commentaire.includes('VSO:')) return 'VSO';
    if (commentaire.includes('VAO:')) return 'VAO';
    if (commentaire.toLowerCase().includes('refusé:')) return 'REFUSÉ';
    
    return 'Autre';
  };
  
  const getVisaTypeClass = (type: string) => {
    switch (type) {
      case 'VSO': return 'bg-green-100 text-green-800';
      case 'VAO': return 'bg-amber-100 text-amber-800';
      case 'REFUSÉ': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownloadAttachment = async () => {
    if (!visa?.attachment_path) {
      toast.error('Aucune pièce jointe associée à ce visa');
      return;
    }
    
    setDownloading(true);
    
    try {
      const fileData = await fileStorage.downloadFile('visas', visa.attachment_path);
      
      if (!fileData) {
        throw new Error('Impossible de télécharger la pièce jointe');
      }
      
      // Extract filename from path
      const fileName = visa.attachment_path.split('/').pop() || 'piece-jointe-visa.pdf';
      
      // Create download link
      const url = URL.createObjectURL(fileData);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Pièce jointe téléchargée');
    } catch (error) {
      console.error('Error downloading attachment:', error);
      toast.error("Erreur lors du téléchargement de la pièce jointe");
    } finally {
      setDownloading(false);
    }
  };
  
  if (!visa) return null;
  
  const visaType = getVisaType(visa.commentaire);
  const visaTypeClass = getVisaTypeClass(visaType);
  
  // Clean comment by removing prefix
  const cleanComment = visa.commentaire ? 
    visa.commentaire.includes(':') ? 
      visa.commentaire.split(':').slice(1).join(':').trim() : 
      visa.commentaire : 
    '';
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span>
              Visa {document ? `pour ${document.nom}` : ''} - Version {visa.version}
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">
              Détails du visa
            </TabsTrigger>
            {visa.attachment_path && (
              <TabsTrigger value="document" className="flex-1">
                Pièce jointe
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-lg">Type de visa</h3>
                        <Badge className={`mt-1 ${visaTypeClass}`}>{visaType}</Badge>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-500 flex items-center justify-end gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(visa.date_demande)}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center justify-end gap-1 mt-1">
                          <User className="h-4 w-4" />
                          {visa.demande_par}
                        </p>
                      </div>
                    </div>
                    
                    {cleanComment && (
                      <div className="mt-2">
                        <h3 className="font-medium flex items-center gap-1.5 mb-1">
                          <MessageSquare className="h-4 w-4" />
                          Commentaire
                        </h3>
                        <div className="bg-gray-50 p-3 rounded border mt-1">
                          <p className="text-sm whitespace-pre-wrap">{cleanComment}</p>
                        </div>
                      </div>
                    )}
                    
                    {visa.attachment_path && (
                      <div className="flex items-center justify-between mt-4">
                        <div className="space-y-1">
                          <h3 className="font-medium">Pièce jointe</h3>
                          <p className="text-sm text-gray-500">
                            {visa.attachment_path.split('/').pop() || 'Pièce jointe'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveTab('document')}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Voir
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadAttachment}
                            disabled={downloading}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {document && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-medium">Document associé</h3>
                    <div className="mt-2">
                      <p className="font-medium">{document.nom}</p>
                      <p className="text-sm text-gray-500">Version: {visa.version}</p>
                      <div className="mt-4 flex justify-end">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // This would open a document preview component
                                  // We'll need to implement this in a separate PR
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Voir le document
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Consulter le document associé à ce visa
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          {visa.attachment_path && (
            <TabsContent value="document" className="space-y-4 mt-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-4">Pièce jointe du visa</h3>
                  
                  {isFileChecking || isLoadingPdf ? (
                    <div className="flex flex-col items-center justify-center h-[400px] bg-gray-50 rounded">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      <p className="mt-4 text-gray-500">Chargement de la pièce jointe...</p>
                    </div>
                  ) : fileError ? (
                    <div className="flex flex-col items-center justify-center h-[400px] bg-gray-50 rounded border border-dashed">
                      <p className="text-red-500">{fileError}</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={handleDownloadAttachment}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                    </div>
                  ) : fileType === 'pdf' ? (
                    <>
                      <iframe
                        src={pdfDataUrl || fileUrl || ''}
                        className="w-full h-[500px] border rounded"
                        title="Pièce jointe du visa"
                      />
                      <div className="mt-4 text-center">
                        <Button
                          variant="outline"
                          onClick={handleDownloadAttachment}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                      </div>
                    </>
                  ) : fileType === 'image' ? (
                    <>
                      <img 
                        src={fileUrl || ''} 
                        alt="Pièce jointe" 
                        className="max-w-full mx-auto max-h-[400px] object-contain"
                      />
                      <div className="mt-4 text-center">
                        <Button
                          variant="outline"
                          onClick={handleDownloadAttachment}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] bg-gray-100 rounded">
                      <FileText className="h-16 w-16 text-gray-400 mb-4" />
                      <p className="text-gray-600">Aperçu non disponible</p>
                      <p className="text-gray-500 text-sm mt-2">
                        Ce type de fichier ne peut pas être prévisualisé. Veuillez télécharger le fichier pour le consulter.
                      </p>
                      <Button 
                        variant="outline"
                        onClick={handleDownloadAttachment}
                        className="mt-4"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
