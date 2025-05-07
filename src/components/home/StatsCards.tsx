
import React from 'react';
import { Card } from '@/components/ui/card';

type StatItem = {
  title: string;
  value: number;
  icon: React.ReactNode;
};

interface StatsCardsProps {
  stats: StatItem[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, i) => (
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
      ))}
    </div>
  );
};

export default StatsCards;
