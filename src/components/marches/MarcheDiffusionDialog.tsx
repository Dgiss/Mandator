
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useDropzone } from 'react-dropzone';
import { FileText, Send, Upload, X } from 'lucide-react';
import { versionsService } from '@/services/versionsService';
import { Version } from '@/services/types';
import { useQueryClient } from '@tanstack/react-query';
import { useUserRole } from '@/hooks/useUserRole';

interface MarcheDiffusionDialogProps {
  version: Version;
  onDiffusionComplete?: () => void;
  userRole?: string;
}

const MarcheDiffusionDialog: React.FC<MarcheDiffusionDialogProps> = ({ 
  version, 
  onDiffusionComplete,
}) => {
  const [open, setOpen] = useState(false);
  const [commentaire, setCommentaire] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Utiliser notre nouveau hook pour la gestion des rôles
  const { canDiffuse } = useUserRole();

  // Role check - only MANDATAIRE can diffuse
  const canDiffuseThis = canDiffuse && version.statut === 'En attente de diffusion';

  // React-dropzone setup
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
      }
    },
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 10485760, // 10MB
  });

  const handleDiffuse = async () => {
    if (!canDiffuseThis) {
      toast({
        title: "Accès non autorisé",
        description: "Seul le MANDATAIRE peut diffuser les documents.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Appeler le service de diffusion qui créera également un visa
      const result = await versionsService.diffuseVersion(
        version.id || '', 
        commentaire, 
        selectedFile || undefined
      );

      if (result.success) {
        toast({
          title: "Document diffusé",
          description: "Le document a été diffusé avec succès et est maintenant en attente de visa.",
          variant: "success",
        });
        setOpen(false);
        
        // Invalidate queries to refresh the data
        queryClient.invalidateQueries({ queryKey: ['versions', version.marche_id] });
        queryClient.invalidateQueries({ queryKey: ['documents', version.marche_id] });
        queryClient.invalidateQueries({ queryKey: ['visas', version.marche_id] });
        
        if (onDiffusionComplete) {
          onDiffusionComplete();
        }
      } else {
        throw new Error("Échec de la diffusion");
      }
    } catch (error) {
      console.error("Erreur lors de la diffusion:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la diffusion du document.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove selected file
  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
          disabled={!canDiffuseThis}
        >
          <Send className="h-4 w-4 mr-2" /> Diffuser
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Diffuser le document</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="text-sm text-gray-600">
            <p>Vous êtes sur le point de diffuser la version {version.version} du document pour visa. 
            Une fois diffusé, le document passera en statut "En attente de visa" et un visa sera automatiquement créé.</p>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Document final (facultatif)</label>
            {selectedFile ? (
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm truncate">{selectedFile.name}</span>
                  <span className="text-xs text-gray-500 ml-2">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div {...getRootProps()} className="flex items-center justify-center w-full">
                <div className={`flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer ${isDragActive ? 'bg-gray-100' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-gray-500" />
                    <p className="mb-1 text-sm text-gray-500">
                      <span className="font-semibold">Cliquez ou glissez-déposez</span>
                    </p>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX (MAX. 10Mo)</p>
                  </div>
                  <input {...getInputProps()} />
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Si vous ne téléversez pas de nouveau document, la version actuelle sera utilisée.
            </p>
          </div>
          
          <div>
            <label htmlFor="commentaire" className="text-sm font-medium mb-2 block">
              Commentaire de diffusion
            </label>
            <Textarea
              id="commentaire"
              placeholder="Ajoutez un commentaire sur cette diffusion..."
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleDiffuse} 
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? "Diffusion en cours..." : "Diffuser le document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MarcheDiffusionDialog;
