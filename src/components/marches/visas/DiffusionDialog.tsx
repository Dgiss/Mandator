
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export interface DiffusionDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedDocument: any | null;
  selectedVersion: any | null;
  diffusionComment: string;
  setDiffusionComment: React.Dispatch<React.SetStateAction<string>>;
  handleDiffusionSubmit: () => Promise<void>;
  attachmentName: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const DiffusionDialog: React.FC<DiffusionDialogProps> = ({
  open,
  setOpen,
  selectedDocument,
  selectedVersion,
  diffusionComment,
  setDiffusionComment,
  handleDiffusionSubmit,
  attachmentName,
  handleFileChange
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Diffuser le document</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {selectedDocument && (
            <div className="text-sm">
              <p><strong>Document:</strong> {selectedDocument.nom}</p>
              <p><strong>Version:</strong> {selectedVersion?.version || 'N/A'}</p>
              <p><strong>Statut actuel:</strong> {selectedDocument.statut}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="diffusion-comment">Commentaire de diffusion</Label>
            <Textarea
              id="diffusion-comment"
              value={diffusionComment}
              onChange={(e) => setDiffusionComment(e.target.value)}
              placeholder="Ajoutez un commentaire de diffusion..."
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="attachment">Pièce jointe (optionnelle)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="attachment"
                type="file"
                onChange={handleFileChange}
                className="flex-1"
              />
              {attachmentName && (
                <div className="text-sm text-green-600">
                  {attachmentName}
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleDiffusionSubmit}>Diffuser</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
