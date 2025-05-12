
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

type Message = {
  id: string;
  content: string;
  role: 'assistant' | 'user';
  timestamp: Date;
};

type AIAssistantDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const SUGGESTED_QUESTIONS = [
  "Combien de visas sont en attente ?",
  "Combien de documents ne sont pas encore diffusés ?",
  "Combien de versions ont été rejetées ?",
  "Peux-tu me faire un résumé du marché actuel ?",
];

const AIAssistantDialog: React.FC<AIAssistantDialogProps> = ({ open, onOpenChange }) => {
  const { message: initialMessage, clearMessage, loading, setLoading } = useAIAssistant();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      content: "Bonjour, je suis votre assistant IA. Comment puis-je vous aider aujourd'hui ?",
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const location = useLocation();

  // Extract marché ID from URL if present
  const getCurrentMarcheId = () => {
    const path = location.pathname;
    const match = path.match(/\/marches\/([^\/]+)/);
    return match ? match[1] : null;
  };

  // Set initial message if provided
  useEffect(() => {
    if (initialMessage && open) {
      setInput(initialMessage);
      clearMessage();
    }
  }, [initialMessage, open, clearMessage]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    setLoading(true);
    // Hide suggestions while loading
    setShowSuggestions(false);
    
    try {
      // Get the current marché ID if available
      const marcheId = getCurrentMarcheId();
      
      const response = await supabase.functions.invoke('ai-assistant', {
        body: {
          query: input,
          marcheId: marcheId
        },
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      const result = response.data;
      
      const newAssistantMessage: Message = {
        id: Date.now().toString(),
        content: result.response || "Désolé, je n'ai pas pu traiter votre demande.",
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, newAssistantMessage]);
      // Show suggestions again after response
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Erreur",
        description: "Impossible de communiquer avec l'assistant IA.",
        variant: "destructive",
      });
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "Désolé, une erreur s'est produite lors du traitement de votre demande.",
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      // Show suggestions again after error
      setShowSuggestions(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  // Utilise une div au lieu de Dialog pour un affichage flottant
  return open ? (
    <div className={cn(
      "fixed bottom-20 right-6 z-40",
      "bg-white rounded-lg shadow-xl border",
      "w-[350px] h-[500px] md:w-[420px]",
      "flex flex-col",
      "animate-scale-in"
    )}>
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-btp-blue" />
          <h3 className="text-sm font-medium">Assistant IA</h3>
        </div>
        <button 
          onClick={() => onOpenChange(false)} 
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="flex-1 overflow-hidden flex flex-col">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'assistant' ? 'justify-start' : 'justify-end'
                }`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg ${
                    message.role === 'assistant'
                      ? 'bg-gray-100 text-foreground'
                      : 'bg-btp-blue text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {message.role === 'assistant' ? (
                      <Bot className="h-3 w-3" />
                    ) : (
                      <User className="h-3 w-3" />
                    )}
                    <span className="text-xs opacity-70">
                      {message.role === 'assistant' ? 'Assistant' : 'Vous'}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] px-3 py-2 rounded-lg bg-gray-100">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs">L'assistant réfléchit...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {showSuggestions && (
          <div className="p-4 border-t">
            <h4 className="text-xs font-medium mb-2">Questions suggérées :</h4>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleSuggestedQuestion(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question..."
              className="flex-1"
              disabled={loading}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!input.trim() || loading}
              className="bg-btp-blue hover:bg-btp-navy"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  ) : null;
};

export default AIAssistantDialog;
