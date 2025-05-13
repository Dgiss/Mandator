
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const VisasLoading: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Skeleton className="h-5 w-1/3" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 border rounded-md">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-40" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
};
