
import React from 'react';
import { Card } from '@/components/ui/card';

interface FasciculeProgress {
  nom: string;
  progression: number;
}

interface FasciculeProgressCardProps {
  fasciculeProgress: FasciculeProgress[];
  onViewAllClick: (e: React.MouseEvent) => void;
}

const FasciculeProgressCard: React.FC<FasciculeProgressCardProps> = ({ fasciculeProgress, onViewAllClick }) => {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Avancement Fascicules</h3>
        <a href="#" 
           onClick={onViewAllClick} 
           className="text-btp-blue text-sm hover:underline">
          Voir tout
        </a>
      </div>
      
      <div className="space-y-4">
        {fasciculeProgress.length > 0 ? (
          fasciculeProgress.map((fascicule, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-1">
                <span>{fascicule.nom}</span>
                <span>{fascicule.progression}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${fascicule.progression}%` }}
                ></div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center py-4 text-gray-500">
            Aucun fascicule trouvé
          </p>
        )}
      </div>
    </Card>
  );
};

export default FasciculeProgressCard;
