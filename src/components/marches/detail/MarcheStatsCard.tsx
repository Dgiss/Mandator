
import React from 'react';
import { Card } from '@/components/ui/card';

interface DocumentStats {
  total: number;
  approuves: number;
  enAttente: number;
}

interface MarcheStatsCardProps {
  documentStats: DocumentStats;
}

const MarcheStatsCard: React.FC<MarcheStatsCardProps> = ({ documentStats }) => {
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
          <span className="text-sm text-gray-500">Visas en Attente</span>
        </div>
        <div className="bg-gray-50 p-4 rounded-md text-center">
          <span className="block text-3xl font-bold text-gray-800">0</span>
          <span className="text-sm text-gray-500">Questions Ouvertes</span>
        </div>
      </div>
    </Card>
  );
};

export default MarcheStatsCard;
