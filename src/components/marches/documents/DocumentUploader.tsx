
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MultiFileUpload } from '@/components/ui/multi-file-upload';
import { fileStorage } from '@/services/storage/fileStorage';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DocumentUploaderProps {
  documentId: string;
  onSuccess?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  documentId,
  onSuccess,
  open,
  onOpenChange
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const { toast } = useToast();
  
  useEffect(() => {
    if (!open) {
      // Reset state when dialog is closed
      setFiles([]);
      setProgress({});
    }
  }, [open]);

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins un fichier à télécharger",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      // Create bucket if it doesn't exist
      await fileStorage.ensureBucketExists('marches', true);
      
      // Process each file
      for (const file of files) {
        // Update progress for this file
        setProgress(prev => ({ ...prev, [file.name]: 10 }));
        
        try {
          // Upload file
          const uploadResult = await fileStorage.uploadFile('marches', documentId, file);
          setProgress(prev => ({ ...prev, [file.name]: 50 }));
          
          if (!uploadResult) {
            throw new Error(`Échec du téléchargement de ${file.name}`);
          }
          
          // Update document in database with file path
          const { error } = await supabase
            .from('documents')
            .update({
              file_path: uploadResult.path,
              taille: `${Math.round(file.size / 1024)} KB`
            })
            .eq('id', documentId);
            
          if (error) {
            throw error;
          }
          
          // Complete progress
          setProgress(prev => ({ ...prev, [file.name]: 100 }));
          successCount++;
        } catch (error) {
          console.error(`Erreur lors du téléchargement de ${file.name}:`, error);
          errorCount++;
          setProgress(prev => ({ ...prev, [file.name]: 0 }));
        }
      }

      // Show success/error message
      if (successCount > 0) {
        toast({
          title: "Succès",
          description: `${successCount} fichier(s) téléchargé(s) avec succès${errorCount > 0 ? ` (${errorCount} échec(s))` : ''}`,
          variant: errorCount > 0 ? "default" : "default",
        });
        
        // Call onSuccess callback
        if (onSuccess) {
          onSuccess();
        }
        
        // Close dialog
        onOpenChange(false);
      } else {
        toast({
          title: "Erreur",
          description: "Tous les téléchargements ont échoué",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement des fichiers:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du téléchargement des fichiers",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Télécharger des fichiers</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <MultiFileUpload
            id="document-files"
            files={files}
            onChange={setFiles}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
            maxSize={50}
            progress={progress}
            label="Fichiers"
            description="Formats acceptés: PDF, Word, Excel, PowerPoint, images"
          />
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpload} disabled={files.length === 0 || uploading}>
              {uploading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background"></span>
                  Téléchargement...
                </>
              ) : (
                "Télécharger"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploader;
