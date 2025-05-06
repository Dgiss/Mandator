
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Filter 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DiscussionItem {
  id: string;
  marcheId: string;
  marcheTitre: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

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

  // Filtrer les discussions en fonction du terme de recherche
  const filteredDiscussions = discussionsMock.filter(discussion => 
    discussion.marcheTitre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discussion.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDiscussionClick = (marcheId: string) => {
    navigate(`/marches/${marcheId}?tab=qr`);
  };

  return (
    <PageLayout>
      <PageHeader
        title="Questions & Réponses"
        description="Échangez avec vos collaborateurs sur les différents marchés"
      />

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher une discussion..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button variant="outline" className="flex items-center">
          <Filter className="mr-2 h-4 w-4" /> Filtrer
        </Button>
      </div>

      <div className="space-y-3">
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
      </div>
    </PageLayout>
  );
}
