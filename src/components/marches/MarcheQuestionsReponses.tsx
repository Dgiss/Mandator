
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Send, FileText, Paperclip, Image, MessageSquare, 
  Plus, Download, ChevronDown, RefreshCw, X, UserCircle 
} from 'lucide-react';
import MarcheQuestionForm from './MarcheQuestionForm';
import { useToast } from '@/hooks/use-toast';
import { questionsService, Question, Reponse } from '@/services/questionsService';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MarcheQuestionsReponsesProps {
  marcheId: string;
}

const MarcheQuestionsReponses = ({ marcheId }: MarcheQuestionsReponsesProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fonction pour faire défiler vers le bas à chaque nouveau message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Récupérer les questions depuis Supabase
  const { data: questions, isLoading, isError, refetch } = useQuery({
    queryKey: ['questions', marcheId],
    queryFn: () => questionsService.getQuestionsByMarcheId(marcheId),
    staleTime: 30000, // 30 seconds
  });

  // Récupérer les détails du marché
  const { data: marche } = useQuery({
    queryKey: ['marche', marcheId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marches')
        .select('*')
        .eq('id', marcheId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Mutation pour ajouter une réponse
  const addReponseMutation = useMutation({
    mutationFn: async ({ content, questionId }: { content: string, questionId: string }) => {
      if (!questionId) throw new Error("ID de question manquant");
      return questionsService.addReponse({
        question_id: questionId,
        content
      }, attachment || undefined);
    },
    onSuccess: () => {
      // Réinitialiser le champ de message et l'attachement
      setNewMessage('');
      setAttachment(null);
      // Rafraîchir les questions
      queryClient.invalidateQueries({ queryKey: ['questions', marcheId] });
      toast({
        title: "Réponse ajoutée",
        description: "Votre réponse a bien été envoyée",
      });
    },
    onError: (error) => {
      console.error('Erreur lors de l\'ajout de la réponse:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'envoi de la réponse",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    scrollToBottom();
  }, [questions, activeQuestionId]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && activeQuestionId) {
      try {
        await addReponseMutation.mutateAsync({
          content: newMessage.trim(),
          questionId: activeQuestionId
        });
      } catch (error) {
        // Erreur gérée dans la mutation
      }
    } else if (!activeQuestionId) {
      toast({
        title: "Aucune question sélectionnée",
        description: "Veuillez sélectionner une question pour répondre",
        variant: "destructive",
      });
    }
  };

  const handleNewQuestion = async (questionData: { 
    content: string, 
    documentId?: string, 
    fasciculeId?: string,
    attachment?: File
  }) => {
    try {
      const newQuestion = await questionsService.addQuestion({
        content: questionData.content,
        marche_id: marcheId,
        document_id: questionData.documentId || null,
        fascicule_id: questionData.fasciculeId || null
      }, questionData.attachment);
      
      setShowQuestionForm(false);
      
      // Rafraîchir les questions et sélectionner la nouvelle question
      await refetch();
      setActiveQuestionId(newQuestion.id);
      
      toast({
        title: "Question envoyée",
        description: "Votre question a été enregistrée avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la question:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'envoi de la question",
        variant: "destructive",
      });
    }
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Valider la taille du fichier (max 10MB)
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

  const handleDownloadAttachment = async (attachmentPath: string, bucket: 'questions' | 'reponses', fileName: string) => {
    try {
      // Get public URL
      const url = await questionsService.getPublicUrl(bucket, attachmentPath);
      
      // Create a link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'attachment';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erreur lors du téléchargement du fichier:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le fichier",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Si c'est aujourd'hui, montrer seulement l'heure
    if (date.toDateString() === now.toDateString()) {
      return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Si c'est hier, montrer "Hier à hh:mm"
    if (date.toDateString() === yesterday.toDateString()) {
      return `Hier à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Sinon, montrer la date complète
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'En attente': return 'bg-amber-500 text-white';
      case 'En cours': return 'bg-blue-500 text-white';
      case 'Répondu': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return '?';
    return `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase();
  };

  // Filtrer la question active et ses réponses
  const activeQuestion = activeQuestionId 
    ? questions?.find(q => q.id === activeQuestionId) 
    : questions?.[0];

  return (
    <div className="pt-6 h-[calc(100vh-270px)] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Questions & Réponses</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button 
            className="flex items-center" 
            onClick={() => setShowQuestionForm(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle question
          </Button>
        </div>
      </div>

      {showQuestionForm && (
        <MarcheQuestionForm 
          marcheId={marcheId}
          onSubmit={handleNewQuestion}
          onCancel={() => setShowQuestionForm(false)}
        />
      )}

      {isLoading ? (
        <div className="flex-grow flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-btp-blue" />
          <span className="ml-2">Chargement des questions...</span>
        </div>
      ) : isError ? (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-red-500">Erreur lors du chargement des questions. Veuillez réessayer.</p>
        </div>
      ) : questions && questions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          {/* Liste des questions à gauche */}
          <div className="col-span-1 border rounded-lg overflow-hidden">
            <div className="bg-btp-blue text-white p-3">
              <h3 className="font-semibold">Questions ({questions.length})</h3>
              <p className="text-xs opacity-80">{marche?.titre || 'Marché'}</p>
            </div>
            <div className="overflow-y-auto h-[calc(100%-56px)]">
              {questions.map((question) => (
                <div 
                  key={question.id} 
                  className={`border-b p-3 cursor-pointer hover:bg-gray-50 ${activeQuestionId === question.id ? 'bg-blue-50' : ''}`}
                  onClick={() => setActiveQuestionId(question.id || null)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback>{getInitials(question.profiles?.prenom, question.profiles?.nom)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {question.profiles?.prenom || ''} {question.profiles?.nom || 'Utilisateur'}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(question.date_creation)}</p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(question.statut)}`}>
                      {question.statut}
                    </Badge>
                  </div>
                  <p className="text-sm truncate">{question.content}</p>
                  <div className="flex gap-1 mt-1">
                    {question.document_id && (
                      <Badge variant="outline" className="text-xs">Document</Badge>
                    )}
                    {question.fascicule_id && (
                      <Badge variant="outline" className="text-xs">Fascicule</Badge>
                    )}
                    {question.attachment_path && (
                      <Badge variant="outline" className="text-xs">Pièce jointe</Badge>
                    )}
                    {question.reponses && question.reponses.length > 0 && (
                      <Badge variant="outline" className="text-xs bg-gray-100">{question.reponses.length} réponse(s)</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Zone de discussion à droite */}
          <div className="col-span-2 border rounded-lg flex flex-col overflow-hidden">
            {activeQuestion ? (
              <>
                {/* En-tête de la question active */}
                <div className="bg-btp-blue text-white p-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">{activeQuestion.documents?.nom || activeQuestion.fascicules?.nom || 'Discussion'}</h3>
                    <Badge className={`${getStatusColor(activeQuestion.statut)}`}>
                      {activeQuestion.statut}
                    </Badge>
                  </div>
                  <p className="text-xs opacity-80">
                    Créée par {activeQuestion.profiles?.prenom || ''} {activeQuestion.profiles?.nom || 'Utilisateur'} le {formatDate(activeQuestion.date_creation)}
                  </p>
                </div>

                {/* Zone de messages */}
                <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
                  <div className="space-y-6">
                    {/* La question initiale */}
                    <div className="flex flex-col">
                      <div className="flex items-start mb-2">
                        <Avatar className="h-8 w-8 mr-2">
                          {activeQuestion.profiles?.prenom && activeQuestion.profiles?.nom ? (
                            <AvatarFallback>
                              {getInitials(activeQuestion.profiles.prenom, activeQuestion.profiles.nom)}
                            </AvatarFallback>
                          ) : (
                            <AvatarFallback>
                              <UserCircle className="h-6 w-6" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {activeQuestion.profiles?.prenom || ''} {activeQuestion.profiles?.nom || 'Utilisateur'}
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(activeQuestion.date_creation)}</p>
                        </div>
                      </div>
                      
                      <div className="bg-white border rounded-lg p-4 ml-10">
                        <div className="mb-3">
                          {activeQuestion.content}
                        </div>
                        
                        {/* Afficher les références aux documents/fascicules */}
                        {(activeQuestion.document_id || activeQuestion.fascicule_id) && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            {activeQuestion.document_id && activeQuestion.documents && (
                              <div className="flex items-center mb-1">
                                <FileText className="h-4 w-4 text-blue-500 mr-1" />
                                <span className="text-sm text-gray-700">
                                  Document: {activeQuestion.documents.nom}
                                </span>
                              </div>
                            )}
                            
                            {activeQuestion.fascicule_id && activeQuestion.fascicules && (
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 text-green-500 mr-1" />
                                <span className="text-sm text-gray-700">
                                  Fascicule: {activeQuestion.fascicules.nom}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Pièce jointe */}
                        {activeQuestion.attachment_path && (
                          <div className="mt-3 pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                              <FileText className="h-5 w-5 text-blue-500" />
                              <span className="text-sm font-medium flex-grow truncate">
                                {activeQuestion.attachment_path.split('/').pop()}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleDownloadAttachment(
                                  activeQuestion.attachment_path!, 
                                  'questions', 
                                  activeQuestion.attachment_path!.split('/').pop() || 'attachment'
                                )}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Les réponses */}
                    {activeQuestion.reponses && activeQuestion.reponses.map((reponse) => (
                      <div key={reponse.id} className="flex flex-col">
                        <div className="flex items-start mb-2">
                          <Avatar className="h-8 w-8 mr-2">
                            {reponse.profiles?.prenom && reponse.profiles?.nom ? (
                              <AvatarFallback>
                                {getInitials(reponse.profiles.prenom, reponse.profiles.nom)}
                              </AvatarFallback>
                            ) : (
                              <AvatarFallback>
                                <UserCircle className="h-6 w-6" />
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <div className="flex items-center">
                              <p className="font-medium">
                                {reponse.profiles?.prenom || ''} {reponse.profiles?.nom || 'Utilisateur'}
                              </p>
                              {reponse.profiles?.entreprise && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {reponse.profiles.entreprise}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{formatDate(reponse.date_creation)}</p>
                          </div>
                        </div>
                        
                        <div className="bg-white border rounded-lg p-4 ml-10">
                          <div className="mb-3">
                            {reponse.content}
                          </div>
                          
                          {/* Pièce jointe de la réponse */}
                          {reponse.attachment_path && (
                            <div className="mt-3 pt-2 border-t border-gray-100">
                              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                <FileText className="h-5 w-5 text-blue-500" />
                                <span className="text-sm font-medium flex-grow truncate">
                                  {reponse.attachment_path.split('/').pop()}
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleDownloadAttachment(
                                    reponse.attachment_path!, 
                                    'reponses', 
                                    reponse.attachment_path!.split('/').pop() || 'attachment'
                                  )}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Zone de saisie */}
                <div className="p-3 border-t bg-white">
                  {attachment && (
                    <div className="flex items-center gap-2 p-2 mb-2 bg-gray-50 border rounded">
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
                  )}
                  <div className="flex items-end gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="rounded-full h-10 w-10 p-0 flex-shrink-0"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Paperclip className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Joindre un fichier</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleAttachmentChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    />
                    
                    <Textarea
                      placeholder="Écrivez votre réponse..."
                      className="resize-none min-h-[40px] max-h-[120px]"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    
                    <Button 
                      onClick={handleSendMessage} 
                      className="rounded-full h-10 w-10 p-0"
                      disabled={addReponseMutation.isPending || !newMessage.trim()}
                    >
                      {addReponseMutation.isPending ? (
                        <RefreshCw className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mb-3" />
                <h3 className="text-xl font-semibold mb-2">Aucune question sélectionnée</h3>
                <p className="text-gray-500 mb-4">
                  {questions && questions.length > 0 
                    ? "Sélectionnez une question dans la liste pour afficher la conversation" 
                    : "Aucune question n'a été posée pour ce marché"}
                </p>
                <Button 
                  onClick={() => setShowQuestionForm(true)}
                  className="flex items-center"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Poser une question
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-grow border rounded-lg flex flex-col items-center justify-center p-8 text-center">
          <MessageSquare className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-3">Aucune question pour ce marché</h3>
          <p className="text-gray-500 max-w-md mb-6">
            Posez une question à propos de ce marché pour commencer une conversation avec les autres intervenants.
          </p>
          <Button 
            size="lg"
            onClick={() => setShowQuestionForm(true)}
            className="flex items-center"
          >
            <Plus className="mr-2 h-5 w-5" />
            Poser votre première question
          </Button>
        </div>
      )}
    </div>
  );
};

export default MarcheQuestionsReponses;
