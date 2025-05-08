
import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type StatItem = {
  title: string;
  value: number;
  icon: React.ReactNode;
};

interface StatsCardsProps {
  stats: StatItem[];
  loading?: boolean;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats, loading = false }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {loading ? (
        // Afficher des squelettes pendant le chargement
        Array(4).fill(0).map((_, i) => (
          <Card key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </div>
          </Card>
        ))
      ) : (
        // Afficher les vraies données
        stats.map((stat, i) => (
          <Card key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div>
                  {stat.icon}
                </div>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default StatsCards;
