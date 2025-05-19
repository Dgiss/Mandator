
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Document } from '@/services/types';
import { visasService } from '@/services/visasService';

interface MarcheVisaDialogProps {
  document: Document;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVisaComplete: () => void;
}

export default function MarcheVisaDialog({
  document,
  open,
  onOpenChange,
  onVisaComplete
}: MarcheVisaDialogProps) {
  const [visaType, setVisaType] = useState<string>('VSO');
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 1. Récupérer le visa correspondant à ce document
      const { data: visas, error: visaError } = await supabase
        .from('visas')
        .select('id')
        .eq('document_id', document.id)
        .eq('version', document.version)
        .eq('statut', 'En attente');
      
      if (visaError) throw visaError;
      
      if (!visas || visas.length === 0) {
        throw new Error("Aucune demande de visa trouvée pour ce document");
      }
      
      const visaId = visas[0].id;
      
      // 2. Déterminer l'action selon le type de visa
      let decision: 'approuve' | 'rejete' = 'approuve';
      let typePrefix = '';
      
      if (visaType === 'VSO') {
        decision = 'approuve';
        typePrefix = 'VSO: ';
      } else if (visaType === 'VAO') {
        decision = 'approuve'; // Avec VAO, on approuve mais on demande des modifications
        typePrefix = 'VAO: ';
      } else if (visaType === 'REFUSE') {
        decision = 'rejete';
        typePrefix = 'REFUSÉ: ';
      }
      
      // 3. Traiter le visa avec notre service
      const finalComment = `${typePrefix}${comment}`;
      await visasService.processVisa(visaId, document.id, decision, finalComment);

      // 4. Informer l'utilisateur
      toast({
        title: `Document ${visaType === 'REFUSE' ? 'refusé' : 'visé'}`,
        description: visaType === 'VAO' 
          ? "Le document a été visé avec observations. Une nouvelle version a été créée."
          : visaType === 'VSO'
            ? "Le document a été visé sans observation et marqué comme BPE."
            : "Le document a été refusé."
      });
      
      onVisaComplete();
    } catch (error) {
      console.error('Erreur lors du traitement du visa:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du traitement du visa",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Viser le document</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div>
            <h4 className="font-medium mb-1">Document</h4>
            <p className="text-sm text-gray-700">{document.nom}</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium mb-1">Type de visa</h4>
            <RadioGroup value={visaType} onValueChange={setVisaType} className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="VSO" id="vso" />
                <Label htmlFor="vso" className="font-medium text-green-700">VSO - Visa Sans Observation</Label>
              </div>
              <p className="text-xs text-gray-500 ml-6 -mt-2">
                Le document est approuvé en l'état. Il sera marqué comme BPE.
              </p>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="VAO" id="vao" />
                <Label htmlFor="vao" className="font-medium text-yellow-700">VAO - Visa Avec Observation</Label>
              </div>
              <p className="text-xs text-gray-500 ml-6 -mt-2">
                Le document est approuvé mais nécessite des modifications. Une nouvelle version sera créée automatiquement.
              </p>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="REFUSE" id="refuse" />
                <Label htmlFor="refuse" className="font-medium text-red-700">Refusé</Label>
              </div>
              <p className="text-xs text-gray-500 ml-6 -mt-2">
                Le document est refusé et doit être revu. Le demandeur devra créer une nouvelle version.
              </p>
            </RadioGroup>
          </div>

          <div>
            <h4 className="font-medium mb-1">Commentaire</h4>
            <Textarea
              placeholder={visaType === 'VAO' || visaType === 'REFUSE' ? 
                "Précisez les raisons du visa avec observation ou du refus..." : 
                "Commentaire facultatif pour le visa sans observation..."}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
              required={visaType === 'VAO' || visaType === 'REFUSE'}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || ((visaType === 'VAO' || visaType === 'REFUSE') && !comment.trim())}
            variant={visaType === 'REFUSE' ? "destructive" : "default"}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement en cours...
              </>
            ) : visaType === 'REFUSE' ? (
              <>
                <X className="mr-2 h-4 w-4" />
                Refuser le document
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                {visaType === 'VAO' ? 'Viser avec observations' : 'Viser sans observation'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
