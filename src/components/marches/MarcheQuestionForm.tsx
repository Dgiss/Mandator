
import React, { useState } from 'react';
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

const documents = [
  { id: "d1", name: "Plan Structure v2" },
  { id: "d2", name: "CCTP GC v1.1" },
  { id: "d3", name: "Plan Coffrage R+1 v3" },
  { id: "d4", name: "Note de Calcul Fondations" },
  { id: "d5", name: "Détails Façade Ouest" },
];

const fascicules = [
  { id: "f1", name: "Lot 1 - Génie Civil" },
  { id: "f2", name: "Lot 2 - Turbines" },
  { id: "f3", name: "Lot 3 - Électricité" },
  { id: "f4", name: "Lot 4 - Plomberie" },
  { id: "f5", name: "Lot 5 - Aménagements extérieurs" },
];

const questionSchema = z.object({
  content: z.string().min(10, { message: 'La question doit comporter au moins 10 caractères' }),
  documentId: z.string().optional(),
  fasciculeId: z.string().optional(),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

const MarcheQuestionForm: React.FC<MarcheQuestionFormProps> = ({ marcheId, onSubmit, onCancel }) => {
  const [attachment, setAttachment] = useState<File | null>(null);
  const { toast } = useToast();

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      content: '',
      documentId: '',
      fasciculeId: '',
    }
  });

  const handleSubmit = async (values: QuestionFormValues) => {
    try {
      onSubmit({
        content: values.content,
        documentId: values.documentId || undefined,
        fasciculeId: values.fasciculeId || undefined,
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
                      value={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Associer à un document" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Aucun document</SelectItem>
                        {documents.map(doc => (
                          <SelectItem key={doc.id} value={doc.id}>
                            {doc.name}
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
                      value={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Associer à un fascicule" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Aucun fascicule</SelectItem>
                        {fascicules.map(fascicule => (
                          <SelectItem key={fascicule.id} value={fascicule.id}>
                            {fascicule.name}
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
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <label htmlFor="file-attachment" className="flex items-center px-3 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                      <Paperclip className="mr-2 h-4 w-4" />
                      Joindre un fichier
                    </label>
                    <input
                      id="file-attachment"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    />
                    <span className="ml-2 text-xs text-gray-500">
                      Max 10MB (PDF, DOC, XLS, JPG)
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onCancel}>
                Annuler
              </Button>
              <Button type="submit">
                Envoyer la question
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default MarcheQuestionForm;
