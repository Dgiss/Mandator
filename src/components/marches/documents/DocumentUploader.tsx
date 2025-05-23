
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MultiFileUpload } from '@/components/ui/multi-file-upload';
import { fileStorage } from '@/services/storage/fileStorage.ts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (!open) {
      // Reset state when dialog is closed
      setFiles([]);
      setProgress({});
      setError(null);
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
    setError(null);
    let successCount = 0;
    let errorCount = 0;

    try {
      // Create bucket if it doesn't exist
      const bucketExists = await fileStorage.ensureBucketExists('marches', true);
      if (!bucketExists) {
        throw new Error("Impossible de créer ou d'accéder au bucket 'marches'");
      }
      
      console.log('Bucket marches existe déjà ou a été créé - continuons.');
      
      // Process each file
      for (const file of files) {
        // Update progress for this file
        setProgress(prev => ({ ...prev, [file.name]: 10 }));
        
        try {
          // Upload file using our improved service
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
          
          console.log('Document mis à jour avec le fichier:', uploadResult.path);
          
          // Complete progress
          setProgress(prev => ({ ...prev, [file.name]: 100 }));
          successCount++;
        } catch (error: any) {
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
        });
        
        // Close dialog first
        onOpenChange(false);
        
        // Call onSuccess callback with a sufficient delay to ensure the document is updated in the database
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 1000);
        }
      } else {
        setError("Tous les téléchargements ont échoué. Vérifiez votre connexion et les permissions de stockage.");
        toast({
          title: "Erreur",
          description: "Tous les téléchargements ont échoué",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Erreur lors du téléchargement des fichiers:", error);
      setError(`Une erreur s'est produite: ${error.message}`);
      toast({
        title: "Erreur",
        description: `Une erreur s'est produite lors du téléchargement des fichiers: ${error.message}`,
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
          <DialogDescription>
            Sélectionnez un fichier pour l'associer à ce document.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
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
