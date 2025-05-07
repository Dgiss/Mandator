
import React, { ReactNode } from 'react';
import MainLayout from './MainLayout';
import { Card } from '@/components/ui/card';

interface PageLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  title, 
  description, 
  children,
  actions
}) => {
  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">{title}</h1>
            {description && (
              <p className="text-gray-600">{description}</p>
            )}
          </div>
          {actions && (
            <div className="mt-4 md:mt-0">
              {actions}
            </div>
          )}
        </div>
        
        {children}
      </div>
    </MainLayout>
  );
};

export default PageLayout;
