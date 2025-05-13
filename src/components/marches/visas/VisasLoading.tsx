
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader } from 'lucide-react';

export const VisasLoading = () => {
  return (
    <div>
      {/* Header loading skeleton */}
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Filter loading skeleton */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
        <Skeleton className="h-10 w-48" />
      </div>
      
      {/* Table loading skeleton */}
      <Card>
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <div className="flex items-center text-muted-foreground">
              <Loader className="h-5 w-5 animate-spin mr-2" />
              <span>Chargement des visas...</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
