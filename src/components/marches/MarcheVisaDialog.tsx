
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, X, PaperclipIcon, FileText, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Document } from '@/services/types';
import { visasService } from '@/services/visasService';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DocumentViewer from './documents/DocumentViewer';
import { useUserRole } from '@/hooks/userRole';

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
  const [attachment, setAttachment] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<string>('visa');
  const [showDocumentViewer, setShowDocumentViewer] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Get the role information for this document's marché
  const { isMandataire } = useUserRole(document.marche_id);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

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
      
      // 2. Gérer l'upload du fichier si présent
      let attachmentPath = null;
      
      if (attachment) {
        const fileName = `${Date.now()}_${attachment.name}`;
        const filePath = `visas/${document.marche_id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('visas')
          .upload(filePath, attachment);
          
        if (uploadError) {
          console.error('Erreur lors du téléchargement du fichier:', uploadError);
        } else {
          attachmentPath = filePath;
        }
      }
      
      // 3. Déterminer l'action selon le type de visa
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
      
      // 4. Traiter le visa avec notre service
      const finalComment = `${typePrefix}${comment}`;
      await visasService.processVisa(visaId, document.id, decision, finalComment, attachmentPath);

      // 5. Informer l'utilisateur
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
      setAttachment(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {document.nom}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="visa" className="flex-1">Traitement du visa</TabsTrigger>
              <TabsTrigger value="document" className="flex-1">Consulter le document</TabsTrigger>
            </TabsList>
            
            <TabsContent value="visa" className="py-4 space-y-4">
              <div>
                <h4 className="font-medium mb-1">Document</h4>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">{document.nom}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowDocumentViewer(true)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    Voir en plein écran
                  </Button>
                </div>
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
              
              <div>
                <h4 className="font-medium mb-1">Pièce jointe (facultative)</h4>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  {attachment && (
                    <div className="text-sm text-green-600">
                      {attachment.name}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Vous pouvez joindre un fichier pour accompagner votre visa (annotations, remarques, etc.)
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="document" className="py-4 space-y-4">
              <div className="flex justify-center items-center h-[40vh]">
                <Button onClick={() => setShowDocumentViewer(true)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Voir le document en plein écran
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
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
      
      {/* Document viewer for full-screen viewing */}
      <DocumentViewer
        document={document}
        open={showDocumentViewer}
        onOpenChange={setShowDocumentViewer}
        onDocumentUpdated={() => {}}
        isMandataire={isMandataire()}
      />
    </>
  );
}
