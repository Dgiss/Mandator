
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  MessageSquare, 
  FileText, 
  Clock, 
  Filter,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { questionsService } from '@/services/questionsService';

interface MarketItem {
  id: string;
  title: string;
  client: string;
  unreadCount: number;
  lastMessageDate: string;
}

interface DiscussionItem {
  id: string;
  marcheId: string;
  marcheTitre: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export default function QuestionsReponsesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('marches');

  // Récupérer les marchés depuis Supabase
  const { data: marches, isLoading: marchesLoading } = useQuery({
    queryKey: ['marches-for-questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marches')
        .select(`
          id, 
          titre, 
          client, 
          datecreation,
          questions(id, date_creation, statut)
        `)
        .order('datecreation', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Récupérer toutes les questions avec réponses
  const { data: discussions, isLoading: discussionsLoading } = useQuery({
    queryKey: ['discussions'],
    queryFn: async () => {
      const { data: marchesData, error: marchesError } = await supabase
        .from('marches')
        .select('id, titre')
        .order('datecreation', { ascending: false });

      if (marchesError) throw marchesError;

      // Pour chaque marché, récupérer les questions et réponses
      const marchesWithDiscussions = await Promise.all(
        marchesData.map(async (marche) => {
          const questions = await questionsService.getQuestionsByMarcheId(marche.id);
          return {
            id: marche.id,
            titre: marche.titre,
            questions
          };
        })
      );

      // Transformer les données pour l'affichage
      const allDiscussions: any[] = [];
      marchesWithDiscussions.forEach(marche => {
        marche.questions.forEach((question: any) => {
          const totalResponses = question.reponses?.length || 0;
          const lastResponse = totalResponses > 0 
            ? question.reponses[totalResponses - 1] 
            : null;

          allDiscussions.push({
            id: question.id,
            marcheId: marche.id,
            marcheTitre: marche.titre,
            questionContent: question.content,
            lastMessage: lastResponse ? lastResponse.content : question.content,
            lastMessageTime: formatDate(lastResponse ? lastResponse.date_creation : question.date_creation),
            unreadCount: question.statut === 'En attente' ? 1 : 0,
            statut: question.statut
          });
        });
      });

      // Trier par date de dernier message
      allDiscussions.sort((a, b) => {
        const dateA = lastResponseDate(a);
        const dateB = lastResponseDate(b);
        return dateB.getTime() - dateA.getTime();
      });

      return allDiscussions;
    }
  });

  // Filtrer les marchés en fonction du terme de recherche
  const filteredMarkets = marches ? marches.filter(market => 
    market.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (market.client && market.client.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  // Filtrer les discussions en fonction du terme de recherche
  const filteredDiscussions = discussions ? discussions.filter(discussion => 
    discussion.marcheTitre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discussion.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discussion.questionContent.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const handleMarketClick = (marcheId: string) => {
    navigate(`/marches/${marcheId}?tab=qr`);
  };

  const handleDiscussionClick = (marcheId: string) => {
    navigate(`/marches/${marcheId}?tab=qr`);
  };

  // Formater la date pour l'affichage
  function formatDate(dateString: string | null | undefined) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Si c'est aujourd'hui, montrer "Aujourd'hui"
    if (date.toDateString() === now.toDateString()) {
      return "Aujourd'hui";
    }
    
    // Si c'est hier, montrer "Hier"
    if (date.toDateString() === yesterday.toDateString()) {
      return "Hier";
    }
    
    // Sinon, montrer la date au format JJ/MM
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit'
    });
  }

  // Obtenir la date de dernière réponse pour le tri
  function lastResponseDate(discussion: any) {
    return new Date(discussion.lastMessageDate || discussion.date_creation || new Date());
  }
  
  // Compter le nombre de questions non répondues par marché
  function countUnreadByMarche(marcheId: string) {
    const questions = marches?.find(m => m.id === marcheId)?.questions;
    if (!questions) return 0;
    
    return questions.filter((q: any) => q.statut === 'En attente').length;
  }

  return (
    <PageLayout>
      <PageHeader
        title="Questions & Réponses"
        description="Consultez et gérez les conversations liées à vos marchés"
      />

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un marché ou une conversation..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button variant="outline" className="flex items-center">
          <Filter className="mr-2 h-4 w-4" /> Filtrer
        </Button>
      </div>

      <Tabs defaultValue="marches" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="marches">Par marchés</TabsTrigger>
          <TabsTrigger value="discussions">Discussions récentes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="marches" className="space-y-3">
          {marchesLoading ? (
            <div className="flex items-center justify-center py-10">
              <RefreshCw className="h-8 w-8 animate-spin text-btp-blue mr-3" />
              <span>Chargement des marchés...</span>
            </div>
          ) : filteredMarkets.length > 0 ? (
            filteredMarkets.map((market) => {
              const unreadCount = countUnreadByMarche(market.id);
              const lastQuestion = market.questions && market.questions.length > 0 
                ? market.questions[0]
                : null;
              
              return (
                <Card 
                  key={market.id} 
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${unreadCount > 0 ? 'border-l-4 border-l-blue-500' : ''}`}
                  onClick={() => handleMarketClick(market.id)}
                >
                  <CardContent className="p-4 flex">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4">
                      <FileText className="h-6 w-6" />
                    </div>
                    
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-medium truncate">
                          {market.titre}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {formatDate(lastQuestion?.date_creation || market.datecreation)}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <p className="text-gray-600 text-sm truncate mr-4">
                          {market.client || 'Sans client'}
                        </p>
                        
                        <div className="flex items-center">
                          {unreadCount > 0 && (
                            <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0 mr-2">
                              {unreadCount}
                            </span>
                          )}
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-10">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <h3 className="font-medium text-lg">Aucun marché trouvé</h3>
              <p className="text-gray-500">Essayez de modifier votre recherche</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="discussions" className="space-y-3">
          {discussionsLoading ? (
            <div className="flex items-center justify-center py-10">
              <RefreshCw className="h-8 w-8 animate-spin text-btp-blue mr-3" />
              <span>Chargement des discussions...</span>
            </div>
          ) : filteredDiscussions.length > 0 ? (
            filteredDiscussions.map((discussion) => (
              <Card 
                key={discussion.id} 
                className={`hover:bg-gray-50 transition-colors cursor-pointer ${discussion.unreadCount > 0 ? 'border-l-4 border-l-blue-500' : ''}`}
                onClick={() => handleDiscussionClick(discussion.marcheId)}
              >
                <CardContent className="p-4 flex">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-medium truncate">
                        <FileText className="h-4 w-4 inline mr-1 text-gray-500" />
                        {discussion.marcheTitre}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {discussion.lastMessageTime}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className="text-gray-600 text-sm truncate mr-4">
                        {discussion.lastMessage}
                      </p>
                      {discussion.unreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                          {discussion.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-10">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <h3 className="font-medium text-lg">Aucune discussion trouvée</h3>
              <p className="text-gray-500">Essayez de modifier votre recherche</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
