
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  RadioGroup,
  RadioGroupItem
} from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Check, X } from 'lucide-react';
import { versionsService } from '@/services/versionsService';
import { Version } from '@/services/types';
import { useQueryClient } from '@tanstack/react-query';

interface MarcheVisaDialogProps {
  version: Version;
  onVisaComplete?: () => void;
  userRole: string;
}

const MarcheVisaDialog: React.FC<MarcheVisaDialogProps> = ({ 
  version, 
  onVisaComplete,
  userRole
}) => {
  const [open, setOpen] = useState(false);
  const [decision, setDecision] = useState<'approuve' | 'rejete'>('approuve');
  const [commentaire, setCommentaire] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Role check - only MOE can process visa
  const canProcessVisa = userRole === 'MOE' && version.statut === 'En attente de visa';

  const handleVisa = async () => {
    if (!canProcessVisa) {
      toast({
        title: "Accès non autorisé",
        description: "Seul le MOE peut traiter les visas.",
        variant: "destructive",
      });
      return;
    }

    if (commentaire.trim() === '') {
      toast({
        title: "Commentaire requis",
        description: "Veuillez ajouter un commentaire pour justifier votre décision.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await versionsService.processVisa(
        version.id || '', 
        decision, 
        commentaire
      );

      if (result.success) {
        toast({
          title: decision === 'approuve' ? "Document approuvé" : "Document rejeté",
          description: decision === 'approuve' 
            ? "Le document a été approuvé avec succès." 
            : "Le document a été rejeté. Une nouvelle version a été créée automatiquement.",
          variant: "success",
        });
        setOpen(false);
        
        // Invalidate queries to refresh the data
        queryClient.invalidateQueries({ queryKey: ['versions', version.marche_id] });
        queryClient.invalidateQueries({ queryKey: ['documents', version.marche_id] });
        
        if (onVisaComplete) {
          onVisaComplete();
        }
      } else {
        throw new Error("Échec du traitement du visa");
      }
    } catch (error) {
      console.error("Erreur lors du traitement du visa:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du traitement du visa.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
          disabled={!canProcessVisa}
        >
          <Check className="h-4 w-4 mr-2" /> Traiter le visa
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Traiter le visa du document</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="text-sm text-gray-600">
            <p>Vous traitez la demande de visa pour la version {version.version} du document.
            Votre décision déterminera si le document est approuvé ou s'il doit être révisé.</p>
          </div>
          
          <RadioGroup 
            value={decision} 
            onValueChange={(value: 'approuve' | 'rejete') => setDecision(value)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2 border p-3 rounded-md bg-green-50 border-green-200">
              <RadioGroupItem value="approuve" id="approuve" />
              <Label htmlFor="approuve" className="font-medium text-green-700">Approuver le document</Label>
            </div>

            <div className="flex items-center space-x-2 border p-3 rounded-md bg-red-50 border-red-200">
              <RadioGroupItem value="rejete" id="rejete" />
              <Label htmlFor="rejete" className="font-medium text-red-700">Rejeter le document</Label>
            </div>
          </RadioGroup>
          
          <div>
            <label htmlFor="commentaire" className="text-sm font-medium mb-2 block">
              Commentaire de décision <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="commentaire"
              placeholder="Veuillez justifier votre décision..."
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              rows={4}
              required
              className={commentaire.trim() === '' ? 'border-red-300' : ''}
            />
            {commentaire.trim() === '' && (
              <p className="text-xs text-red-500 mt-1">
                Le commentaire est obligatoire pour justifier votre décision
              </p>
            )}
          </div>

          <div className="rounded-md bg-blue-50 p-3">
            <p className="text-sm text-blue-700">
              {decision === 'approuve' 
                ? "En approuvant ce document, vous confirmez qu'il répond à toutes les exigences et qu'il peut être utilisé dans le cadre du projet."
                : "En rejetant ce document, une nouvelle version sera automatiquement créée pour permettre les corrections nécessaires."}
            </p>
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
            onClick={handleVisa} 
            disabled={isSubmitting || commentaire.trim() === ''}
            className={decision === 'approuve' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
          >
            {isSubmitting 
              ? "Traitement en cours..." 
              : decision === 'approuve' 
                ? "Approuver" 
                : "Rejeter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MarcheVisaDialog;
