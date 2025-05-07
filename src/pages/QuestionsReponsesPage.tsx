
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
  ChevronRight 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

// Données fictives pour les marchés
const marketsMock: MarketItem[] = [
  {
    id: "m1",
    title: "Aménagement Place République",
    client: "Ville de Lyon",
    unreadCount: 2,
    lastMessageDate: "Aujourd'hui"
  },
  {
    id: "m2",
    title: "Construction Centre Culturel",
    client: "Métropole de Marseille",
    unreadCount: 3,
    lastMessageDate: "Hier"
  },
  {
    id: "m3",
    title: "Rénovation Lycée Technique",
    client: "Région Auvergne-Rhône-Alpes",
    unreadCount: 0,
    lastMessageDate: "22/03"
  },
  {
    id: "m4",
    title: "Extension Réseau Eau Potable",
    client: "Syndicat des Eaux",
    unreadCount: 5,
    lastMessageDate: "21/03"
  },
  {
    id: "m5",
    title: "Réfection Voirie Quartier Est",
    client: "Métropole de Lyon",
    unreadCount: 1,
    lastMessageDate: "20/03"
  }
];

// Données fictives pour les discussions
const discussionsMock: DiscussionItem[] = [
  {
    id: "d1",
    marcheId: "m1",
    marcheTitre: "Aménagement Place République",
    lastMessage: "Parfait, nous serons présents pour réceptionner la livraison avant 17h. Merci pour votre réactivité.",
    lastMessageTime: "10:40",
    unreadCount: 0
  },
  {
    id: "d2",
    marcheId: "m2",
    marcheTitre: "Construction Centre Culturel",
    lastMessage: "Pouvez-vous me confirmer les délais de livraison des matériaux pour le lot menuiserie ?",
    lastMessageTime: "Hier",
    unreadCount: 2
  },
  {
    id: "d3",
    marcheId: "m3",
    marcheTitre: "Rénovation Lycée Technique",
    lastMessage: "Les plans modifiés ont été envoyés à l'architecte pour validation.",
    lastMessageTime: "22/03",
    unreadCount: 0
  },
  {
    id: "d4",
    marcheId: "m4",
    marcheTitre: "Extension Réseau Eau Potable",
    lastMessage: "Suite à l'inspection, nous avons détecté une fuite sur le tronçon nord. Pouvez-vous intervenir ?",
    lastMessageTime: "21/03",
    unreadCount: 3
  },
  {
    id: "d5",
    marcheId: "m5",
    marcheTitre: "Réfection Voirie Quartier Est",
    lastMessage: "Le planning des travaux a été mis à jour pour tenir compte des conditions météorologiques.",
    lastMessageTime: "20/03",
    unreadCount: 1
  }
];

export default function QuestionsReponsesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('marches');

  // Filtrer les discussions en fonction du terme de recherche
  const filteredMarkets = marketsMock.filter(market => 
    market.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    market.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDiscussions = discussionsMock.filter(discussion => 
    discussion.marcheTitre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discussion.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMarketClick = (marcheId: string) => {
    navigate(`/marches/${marcheId}?tab=qr`);
  };

  const handleDiscussionClick = (marcheId: string) => {
    navigate(`/marches/${marcheId}?tab=qr`);
  };

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
          {filteredMarkets.length > 0 ? (
            filteredMarkets.map((market) => (
              <Card 
                key={market.id} 
                className={`hover:bg-gray-50 transition-colors cursor-pointer ${market.unreadCount > 0 ? 'border-l-4 border-l-blue-500' : ''}`}
                onClick={() => handleMarketClick(market.id)}
              >
                <CardContent className="p-4 flex">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4">
                    <FileText className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-medium truncate">
                        {market.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {market.lastMessageDate}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className="text-gray-600 text-sm truncate mr-4">
                        {market.client}
                      </p>
                      
                      <div className="flex items-center">
                        {market.unreadCount > 0 && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0 mr-2">
                            {market.unreadCount}
                          </span>
                        )}
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-10">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <h3 className="font-medium text-lg">Aucun marché trouvé</h3>
              <p className="text-gray-500">Essayez de modifier votre recherche</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="discussions" className="space-y-3">
          {filteredDiscussions.length > 0 ? (
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
