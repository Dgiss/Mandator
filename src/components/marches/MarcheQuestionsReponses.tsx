
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Send, FileText, Paperclip, ChevronDown, Image } from 'lucide-react';

interface MarcheQuestionsReponsesProps {
  marcheId: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'marche';
  timestamp: string;
  attachment?: {
    type: 'document' | 'image';
    name: string;
    url: string;
  };
}

// Données fictives pour les messages
const initialMessages: Message[] = [
  {
    id: "m1",
    content: "Bonjour, j'ai une question concernant le plan de coffrage du niveau R+1. Est-ce que les dimensions des poutres ont été validées par le bureau d'études ?",
    sender: 'user',
    timestamp: '10:15'
  },
  {
    id: "m2",
    content: "Bonjour, oui les dimensions ont bien été validées par le BET structure le 15/03/2024. Vous pouvez vous référer au document joint pour les détails.",
    sender: 'marche',
    timestamp: '10:22',
    attachment: {
      type: 'document',
      name: 'Validation_BET_Structure.pdf',
      url: '#'
    }
  },
  {
    id: "m3",
    content: "Merci pour cette information. Concernant les délais de livraison du béton, pouvons-nous confirmer la date du 28/03/2024 ?",
    sender: 'user',
    timestamp: '10:30'
  },
  {
    id: "m4",
    content: "La date du 28/03/2024 est bien confirmée pour la livraison du béton. Nous vous rappelons que le chantier sera fermé après 17h ce jour-là.",
    sender: 'marche',
    timestamp: '10:35'
  },
  {
    id: "m5",
    content: "Voici une photo du site actuel pour information:",
    sender: 'marche',
    timestamp: '10:36',
    attachment: {
      type: 'image',
      name: 'Site_Actuel.jpg',
      url: '/placeholder.svg'
    }
  },
  {
    id: "m6",
    content: "Parfait, nous serons présents pour réceptionner la livraison avant 17h. Merci pour votre réactivité.",
    sender: 'user',
    timestamp: '10:40'
  }
];

export default function MarcheQuestionsReponses({ marcheId }: MarcheQuestionsReponsesProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fonction pour faire défiler vers le bas à chaque nouveau message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg: Message = {
        id: `m${messages.length + 1}`,
        content: newMessage.trim(),
        sender: 'user',
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages([...messages, newMsg]);
      setNewMessage('');
      
      // Simuler une réponse du marché après un délai
      setTimeout(() => {
        const response: Message = {
          id: `m${messages.length + 2}`,
          content: "Merci pour votre message. Nous allons l'examiner et revenir vers vous rapidement.",
          sender: 'marche',
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages(prev => [...prev, response]);
      }, 1500);
    }
  };

  return (
    <div className="pt-6 h-[calc(100vh-270px)] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Questions & Réponses</h2>
      </div>

      <Card className="flex-grow flex flex-col h-full">
        <CardContent className="p-0 flex flex-col h-full">
          {/* En-tête du chat */}
          <div className="bg-btp-blue text-white p-4 rounded-t-lg flex items-center">
            <div className="w-10 h-10 bg-white text-btp-blue rounded-full flex items-center justify-center mr-3">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">Aménagement Place République</h3>
              <p className="text-xs opacity-80">Créé le 20/02/2024</p>
            </div>
          </div>

          {/* Zone de messages */}
          <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-white border rounded-bl-none'
                    }`}
                  >
                    <p>{message.content}</p>
                    
                    {message.attachment && (
                      <div className="mt-2">
                        {message.attachment.type === 'document' ? (
                          <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
                            <FileText className="h-5 w-5 text-blue-500" />
                            <span className="text-sm font-medium">{message.attachment.name}</span>
                          </div>
                        ) : (
                          <div className="mt-2">
                            <img 
                              src={message.attachment.url} 
                              alt={message.attachment.name}
                              className="rounded max-h-40 object-cover" 
                            />
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                      {message.timestamp}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Zone de saisie */}
          <div className="p-3 border-t bg-white flex items-end gap-2">
            <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0 flex-shrink-0">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0 flex-shrink-0">
              <Image className="h-5 w-5" />
            </Button>
            <Textarea
              placeholder="Écrivez votre message..."
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
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
