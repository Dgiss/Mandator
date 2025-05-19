
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { CalendarIcon, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Document } from '@/services/types';
import { visasService } from '@/services/visasService';

interface MarcheDiffusionDialogProps {
  document: Document;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDiffusionComplete: () => void;
}

export default function MarcheDiffusionDialog({
  document,
  open,
  onOpenChange,
  onDiffusionComplete
}: MarcheDiffusionDialogProps) {
  const [comment, setComment] = useState<string>('');
  const [echeance, setEcheance] = useState<Date | undefined>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // +7 jours par défaut
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 1. Mettre à jour le statut du document
      const { error: docError } = await supabase
        .from('documents')
        .update({ 
          statut: 'En attente de visa',
          date_diffusion: new Date().toISOString()
        })
        .eq('id', document.id);
      
      if (docError) throw docError;

      // 2. Créer une entrée de visa pour ce document
      const { data: { user } } = await supabase.auth.getUser();
      const demandePar = user ? user.email || 'Système' : 'Système';
      
      // Utiliser le service de visa pour créer une entrée de visa
      await visasService.createVisaForDiffusion(
        document.id,
        document.marche_id,
        document.version,
        demandePar,
        echeance ? echeance.toISOString() : undefined
      );

      // Mettre à jour la version également si elle existe
      if (document.id) {
        const { error: versionError } = await supabase
          .from('versions')
          .update({ statut: 'En attente de visa' })
          .eq('document_id', document.id)
          .eq('version', document.version);
        
        if (versionError) {
          console.error("Erreur lors de la mise à jour de la version:", versionError);
        }
      }

      toast({
        title: "Document diffusé",
        description: "Le document a été diffusé avec succès pour validation"
      });
      
      onDiffusionComplete();
    } catch (error) {
      console.error('Erreur lors de la diffusion:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la diffusion du document",
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
          <DialogTitle>Diffuser le document</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div>
            <h4 className="font-medium mb-1">Document</h4>
            <p className="text-sm text-gray-700">{document.nom}</p>
          </div>

          <div>
            <h4 className="font-medium mb-1">Commentaire (facultatif)</h4>
            <Textarea
              placeholder="Ajouter un commentaire pour le mandataire qui visera ce document..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div>
            <h4 className="font-medium mb-1">Échéance</h4>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !echeance && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {echeance ? format(echeance, "PPP", { locale: fr }) : "Sélectionner une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={echeance}
                  onSelect={setEcheance}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Diffusion en cours...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Diffuser pour visa
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
