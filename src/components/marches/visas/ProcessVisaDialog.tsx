
import React, { useState } from 'react';
import { FileCheck, FileX, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Document, Version, Visa } from './types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface ProcessVisaDialogProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  selectedDocument: Document | null;
  selectedVersion: Version | null;
  selectedVisa: Visa | null;
  onProcessVisa: (type: 'VSO' | 'VAO' | 'Refusé', comment: string) => Promise<void>;
}

export const ProcessVisaDialog = ({
  open,
  setOpen,
  selectedDocument,
  selectedVersion,
  selectedVisa,
  onProcessVisa
}: ProcessVisaDialogProps) => {
  const [visaType, setVisaType] = useState<'VSO' | 'VAO' | 'Refusé'>('VSO');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onProcessVisa(visaType, comment);
      setOpen(false);
    } catch (error) {
      console.error('Error processing visa:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setVisaType('VSO');
      setComment('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Viser le document</DialogTitle>
          <DialogDescription>
            {selectedDocument && selectedVersion && (
              <span>Document: {selectedDocument.nom} - Version {selectedVersion.version}</span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <RadioGroup
            value={visaType}
            onValueChange={(val) => setVisaType(val as 'VSO' | 'VAO' | 'Refusé')}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="VSO" id="visa-vso" />
              <Label htmlFor="visa-vso" className="flex items-center cursor-pointer">
                <FileCheck className="h-4 w-4 mr-2 text-green-600" />
                <span className="font-medium">Visa Sans Observation (VSO)</span>
                <span className="ml-2 text-xs text-gray-500">→ Document marqué "BPE"</span>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="VAO" id="visa-vao" />
              <Label htmlFor="visa-vao" className="flex items-center cursor-pointer">
                <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
                <span className="font-medium">Visa Avec Observation (VAO)</span>
                <span className="ml-2 text-xs text-gray-500">→ Crée version {selectedVersion?.version && getNextVersionLetter(selectedVersion.version)}</span>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Refusé" id="visa-refuse" />
              <Label htmlFor="visa-refuse" className="flex items-center cursor-pointer">
                <FileX className="h-4 w-4 mr-2 text-red-600" />
                <span className="font-medium">Refusé</span>
                <span className="ml-2 text-xs text-gray-500">→ Crée version {selectedVersion?.version && getNextVersionLetter(selectedVersion.version)}</span>
              </Label>
            </div>
          </RadioGroup>
          
          <div className="mt-4 space-y-2">
            <Label htmlFor="visa-comment">Commentaire</Label>
            <Textarea
              id="visa-comment"
              placeholder="Ajoutez vos observations..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className={visaType === 'VSO' ? 'opacity-70' : ''}
              required={visaType !== 'VSO'}
            />
            {(visaType === 'VAO' || visaType === 'Refusé') && comment.length < 10 && (
              <p className="text-sm text-red-500">
                Un commentaire détaillé est requis pour cette option (minimum 10 caractères).
              </p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            <X className="mr-2 h-4 w-4" />
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="btpPrimary"
            className="flex items-center"
            disabled={isSubmitting || ((visaType === 'VAO' || visaType === 'Refusé') && comment.length < 10)}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Traitement...' : 'Viser le document'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Fonction pour obtenir la lettre suivante
function getNextVersionLetter(currentVersion: string): string {
  const currentLetter = currentVersion.charAt(0);
  const nextLetterCode = currentLetter.charCodeAt(0) + 1;
  return String.fromCharCode(nextLetterCode);
}
