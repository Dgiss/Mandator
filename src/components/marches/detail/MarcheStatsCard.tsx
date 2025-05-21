
import React from 'react';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface DocumentStats {
  total: number;
  approuves: number;
  enAttente: number;
}

interface MarcheStatsCardProps {
  documentStats: DocumentStats;
}

const MarcheStatsCard: React.FC<MarcheStatsCardProps> = ({ documentStats }) => {
  // Get ID of current marché from URL
  const getMarcheIdFromUrl = () => {
    const urlParts = window.location.pathname.split('/');
    return urlParts[urlParts.length - 1];
  };
  
  const marcheId = getMarcheIdFromUrl();

  // Query for open questions count
  const { data: questionsOuvertes = 0 } = useQuery({
    queryKey: ['questions-ouvertes-count', marcheId],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from('questions')
          .select('*', { count: 'exact', head: true })
          .eq('marche_id', marcheId)
          .eq('statut', 'En attente');
          
        if (error) {
          console.error("Erreur lors du comptage des questions ouvertes:", error);
          return 0;
        }
        
        return count || 0;
      } catch (err) {
        console.error("Exception lors du comptage des questions:", err);
        return 0;
      }
    },
    enabled: !!marcheId,
  });

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Chiffres Clés</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-4 rounded-md text-center">
          <span className="block text-3xl font-bold text-gray-800">{documentStats.total}</span>
          <span className="text-sm text-gray-500">Documents Total</span>
        </div>
        <div className="bg-gray-50 p-4 rounded-md text-center">
          <span className="block text-3xl font-bold text-green-500">{documentStats.approuves}</span>
          <span className="text-sm text-gray-500">Documents Approuvés</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-md text-center">
          <span className="block text-3xl font-bold text-blue-500">{documentStats.enAttente}</span>
          <span className="text-sm text-gray-500">Documents en Attente</span>
        </div>
        <div className="bg-gray-50 p-4 rounded-md text-center">
          <span className="block text-3xl font-bold text-gray-800">{questionsOuvertes}</span>
          <span className="text-sm text-gray-500">Questions Ouvertes</span>
        </div>
      </div>
    </Card>
  );
};

export default MarcheStatsCard;
