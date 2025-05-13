
import React from 'react';
import { Upload, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Document, Version } from './types';

interface DiffusionDialogProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  selectedDocument: Document | null;
  selectedVersion: Version | null;
  diffusionComment: string;
  setDiffusionComment: (value: string) => void;
  attachmentName: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDiffusionSubmit: () => void;
}

export const DiffusionDialog = ({
  open,
  setOpen,
  selectedDocument,
  selectedVersion,
  diffusionComment,
  setDiffusionComment,
  attachmentName,
  handleFileChange,
  handleDiffusionSubmit
}: DiffusionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Diffuser le document</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              Vous êtes sur le point de diffuser {selectedDocument?.nom} version {selectedVersion?.version}
            </p>
          </div>
          
          {/* Zone de dépôt de fichiers */}
          <div className="space-y-2">
            <Label>Fichiers à diffuser</Label>
            <div className="border border-dashed border-gray-300 rounded-md p-4">
              <label htmlFor="diffusion-files" className="flex flex-col items-center justify-center h-24 cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">
                  {attachmentName ? attachmentName : "Cliquez ou glissez-déposez des fichiers ici"}
                </span>
                <span className="text-xs text-gray-400 mt-1">PDF, DOCX, DWG, max 20MB</span>
                <input
                  id="diffusion-files"
                  type="file"
                  accept=".pdf,.docx,.doc,.dwg"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
          
          {/* Commentaire */}
          <div className="space-y-2">
            <Label htmlFor="diffusion-comment">Commentaire</Label>
            <Textarea
              id="diffusion-comment"
              placeholder="Ajoutez un commentaire pour les validateurs..."
              value={diffusionComment}
              onChange={(e) => setDiffusionComment(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="flex items-center"
          >
            <X className="mr-2 h-4 w-4" />
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleDiffusionSubmit}
            className="flex items-center"
          >
            <Send className="mr-2 h-4 w-4" />
            Diffuser
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
