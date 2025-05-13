
import React from 'react';
import { Check, X, CheckCircle, ClipboardCheck, Upload } from 'lucide-react';
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
import { Document, Version } from './types';

interface VisaDialogProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  selectedDocument: Document | null;
  selectedVersion: Version | null;
  visaType: 'VSO' | 'VAO' | 'Refusé';
  setVisaType: (value: 'VSO' | 'VAO' | 'Refusé') => void;
  visaComment: string;
  setVisaComment: (value: string) => void;
  attachmentName: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleVisaSubmit: () => void;
}

export const VisaDialog = ({
  open,
  setOpen,
  selectedDocument,
  selectedVersion,
  visaType,
  setVisaType,
  visaComment,
  setVisaComment,
  attachmentName,
  handleFileChange,
  handleVisaSubmit
}: VisaDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ajouter un visa</AlertDialogTitle>
          <AlertDialogDescription>
            Document: {selectedDocument?.nom} - Version {selectedVersion?.version}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <RadioGroup
            value={visaType}
            onValueChange={(val) => setVisaType(val as 'VSO' | 'VAO' | 'Refusé')}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="VSO" id="visa-vso" />
              <Label htmlFor="visa-vso" className="flex items-center cursor-pointer">
                <Check className="h-4 w-4 mr-2 text-green-600" />
                <span className="font-medium">Visa Sans Observation (VSO)</span>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="VAO" id="visa-vao" />
              <Label htmlFor="visa-vao" className="flex items-center cursor-pointer">
                <ClipboardCheck className="h-4 w-4 mr-2 text-amber-600" />
                <span className="font-medium">Visa Avec Observation (VAO)</span>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Refusé" id="visa-refuse" />
              <Label htmlFor="visa-refuse" className="flex items-center cursor-pointer">
                <X className="h-4 w-4 mr-2 text-red-600" />
                <span className="font-medium">Refusé</span>
              </Label>
            </div>
          </RadioGroup>
          
          <div className="mt-4 space-y-2">
            <Label htmlFor="visa-comment">Commentaire</Label>
            <Textarea
              id="visa-comment"
              placeholder="Ajoutez vos observations..."
              value={visaComment}
              onChange={(e) => setVisaComment(e.target.value)}
              className={visaType === 'VSO' ? 'opacity-70' : ''}
            />
          </div>
          
          <div className="mt-4 space-y-2">
            <Label>Pièce jointe</Label>
            <div className="border border-dashed border-gray-300 rounded-md p-4">
              <label htmlFor="visa-attachment" className="flex flex-col items-center justify-center h-20 cursor-pointer">
                <Upload className="h-6 w-6 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">
                  {attachmentName ? attachmentName : "Joindre un fichier"}
                </span>
                <input
                  id="visa-attachment"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel className="flex items-center">
            <X className="mr-2 h-4 w-4" />
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleVisaSubmit}
            className="flex items-center"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Soumettre le visa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
