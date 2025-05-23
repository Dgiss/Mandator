
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { fileStorage } from '@/services/storage/fileStorage.ts';

interface DocumentUploaderProps {
  documentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  documentId,
  open,
  onOpenChange,
  onSuccess
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const resetState = () => {
    setSelectedFile(null);
    setUploading(false);
    setUploadProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Veuillez sélectionner un fichier");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Simuler progression pour l'UI
      for (let i = 0; i <= 50; i += 10) {
        setUploadProgress(i);
        await new Promise(r => setTimeout(r, 100));
      }

      // Récupérer les informations du document
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('marche_id, file_path')
        .eq('id', documentId)
        .single();

      if (docError) {
        throw new Error(`Erreur lors de la récupération des informations du document: ${docError.message}`);
      }

      setUploadProgress(60);

      // Définir le chemin de destination dans le bucket
      const prefix = `documents/${document.marche_id}`;
      
      // Utiliser notre service fileStorage pour l'upload
      console.log(`Uploading file ${selectedFile.name} to prefix ${prefix}`);
      const uploadResult = await fileStorage.uploadFile('marches', prefix, selectedFile);
      
      if (!uploadResult) {
        throw new Error("Échec de l'upload du fichier");
      }

      setUploadProgress(80);

      // Si un ancien fichier existe, nous pourrions le supprimer ici
      // Cela nécessiterait d'implémenter une fonction deleteFile dans fileStorage
      
      // Mettre à jour le document avec le nouveau chemin de fichier
      const { error: updateError } = await supabase
        .from('documents')
        .update({ 
          file_path: uploadResult.path,
          taille: `${(selectedFile.size / 1024).toFixed(1)} KB`,
          dateupload: new Date().toISOString()
        })
        .eq('id', documentId);

      if (updateError) {
        throw new Error(`Erreur lors de la mise à jour du document: ${updateError.message}`);
      }

      setUploadProgress(100);
      
      toast({
        title: "Succès",
        description: "Le fichier a été téléchargé avec succès",
      });

      // Appeler le callback de succès après un court délai pour permettre à l'UI de montrer 100%
      setTimeout(() => {
        if (onSuccess) onSuccess();
        handleClose();
      }, 500);

    } catch (error: any) {
      console.error("Erreur d'upload:", error);
      setError(`Erreur lors de l'upload: ${error.message}`);
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Télécharger un fichier</DialogTitle>
          <DialogDescription>
            Ajoutez ou remplacez le fichier associé à ce document
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {!uploading ? (
            <>
              {selectedFile ? (
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center space-x-2">
                    <div className="flex-shrink-0">
                      <Upload className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez</p>
                      <p className="text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX, etc. (MAX. 10Mo)</p>
                    </div>
                    <input 
                      id="file-upload" 
                      type="file" 
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileChange} 
                    />
                  </label>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="h-2 bg-gray-200 rounded">
                <div 
                  className="h-full bg-blue-600 rounded" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-center text-sm text-gray-500">
                {uploadProgress < 100
                  ? `Téléchargement en cours (${uploadProgress}%)...`
                  : "Téléchargement terminé!"
                }
              </p>
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={uploading}
            >
              Annuler
            </Button>
            <Button 
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="relative"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Téléchargement...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Télécharger
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploader;
