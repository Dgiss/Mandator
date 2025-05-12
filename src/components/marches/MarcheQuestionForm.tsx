
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription,
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Paperclip, X, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { questionsService } from '@/services/questionsService';

interface MarcheQuestionFormProps {
  marcheId: string;
  onSubmit: (data: { 
    content: string, 
    documentId?: string, 
    fasciculeId?: string,
    attachment?: File
  }) => void;
  onCancel: () => void;
}

const questionSchema = z.object({
  content: z.string().min(10, { message: 'La question doit comporter au moins 10 caractères' }),
  documentId: z.string().optional(),
  fasciculeId: z.string().optional(),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

const MarcheQuestionForm: React.FC<MarcheQuestionFormProps> = ({ marcheId, onSubmit, onCancel }) => {
  const [attachment, setAttachment] = useState<File | null>(null);
  const [documents, setDocuments] = useState<{id: string; nom: string}[]>([]);
  const [fascicules, setFascicules] = useState<{id: string; nom: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      content: '',
      documentId: undefined,
      fasciculeId: undefined,
    }
  });

  // Fetch documents and fascicules from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch documents
        const { data: documentsData, error: documentsError } = await supabase
          .from('documents')
          .select('id, nom')
          .eq('marche_id', marcheId);
        
        if (!documentsError && documentsData) {
          setDocuments(documentsData);
        } else {
          console.error('Error fetching documents:', documentsError);
        }
        
        // Fetch fascicules
        const { data: fasciculesData, error: fasciculesError } = await supabase
          .from('fascicules')
          .select('id, nom')
          .eq('marche_id', marcheId);
        
        if (!fasciculesError && fasciculesData) {
          setFascicules(fasciculesData);
        } else {
          console.error('Error fetching fascicules:', fasciculesError);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les documents et fascicules",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [marcheId, toast]);

  const handleSubmit = async (values: QuestionFormValues) => {
    if (isSubmitting) return; // Prevent double submission
    
    try {
      setIsSubmitting(true); // Set submitting state to true
      
      // Créer la question en utilisant le service
      await questionsService.addQuestion({
        content: values.content,
        marche_id: marcheId,
        document_id: values.documentId || null,
        fascicule_id: values.fasciculeId || null,
      }, attachment || undefined);
      
      // Appeler le callback onSubmit
      onSubmit({
        content: values.content,
        documentId: values.documentId,
        fasciculeId: values.fasciculeId,
        attachment: attachment || undefined
      });
      
      toast({
        title: "Question envoyée",
        description: "Votre question a été envoyée avec succès",
        variant: "success",
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la question:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'envoi de la question",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false); // Reset submitting state regardless of outcome
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "La taille du fichier ne doit pas dépasser 10 Mo",
          variant: "destructive",
        });
        return;
      }
      setAttachment(file);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  // Check if form is currently submitting
  const isFormSubmitting = isLoading || isSubmitting || form.formState.isSubmitting;

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question*</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Posez votre question..." 
                      className="min-h-[100px]" 
                      {...field}
                      disabled={isFormSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Soyez précis et détaillé pour obtenir une réponse pertinente
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="documentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document associé (optionnel)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={isFormSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Associer à un document" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="placeholder" disabled>Sélectionner un document</SelectItem>
                        {documents.map(doc => (
                          <SelectItem key={doc.id} value={doc.id}>
                            {doc.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Vous pouvez référencer un document existant
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fasciculeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fascicule associé (optionnel)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={isFormSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Associer à un fascicule" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="placeholder" disabled>Sélectionner un fascicule</SelectItem>
                        {fascicules.map(fascicule => (
                          <SelectItem key={fascicule.id} value={fascicule.id}>
                            {fascicule.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Vous pouvez référencer un fascicule existant
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div>
              <FormLabel>Pièce jointe (optionnel)</FormLabel>
              <div className="mt-1">
                {attachment ? (
                  <div className="flex items-center p-2 bg-gray-50 border rounded gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium flex-grow truncate">
                      {attachment.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={removeAttachment}
                      disabled={isFormSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <label 
                      htmlFor="file-attachment" 
                      className={`flex items-center px-3 py-2 border border-gray-300 rounded text-sm font-medium ${
                        isFormSubmitting ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
                      }`}
                    >
                      <Paperclip className="mr-2 h-4 w-4" />
                      Joindre un fichier
                    </label>
                    <input
                      id="file-attachment"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                      disabled={isFormSubmitting}
                    />
                    <span className="ml-2 text-xs text-gray-500">
                      Max 10MB (PDF, DOC, XLS, JPG)
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel} 
                disabled={isFormSubmitting}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isFormSubmitting}
              >
                {isFormSubmitting ? 'Envoi en cours...' : 'Envoyer la question'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default MarcheQuestionForm;
