
import React, { useState } from 'react';
import { FileCheck, FileX, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
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
  onProcessVisa: (type: 'VSO' | 'VAO' | 'Refusé', comment: string) => void;
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

  const handleSubmit = () => {
    onProcessVisa(visaType, comment);
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
          <DialogTitle>Traiter le visa</DialogTitle>
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
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="VAO" id="visa-vao" />
              <Label htmlFor="visa-vao" className="flex items-center cursor-pointer">
                <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
                <span className="font-medium">Visa Avec Observation (VAO)</span>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Refusé" id="visa-refuse" />
              <Label htmlFor="visa-refuse" className="flex items-center cursor-pointer">
                <FileX className="h-4 w-4 mr-2 text-red-600" />
                <span className="font-medium">Refusé</span>
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
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline" 
            onClick={() => setOpen(false)}
          >
            <X className="mr-2 h-4 w-4" />
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="btpPrimary"
            className="flex items-center"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Soumettre le visa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
