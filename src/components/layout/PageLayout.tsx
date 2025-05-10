
import React, { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import MainLayout from './MainLayout';
import PageHeader from './PageHeader';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  title,
  description,
  actions
}) => {
  return (
    <SidebarProvider defaultOpen={true} 
      style={{ 
        "--sidebar-width": "280px", 
        "--sidebar-width-icon": "64px" 
      } as React.CSSProperties}>
      <MainLayout>
        {title && (
          <div className="px-6 py-4 bg-white border-b">
            <PageHeader 
              title={title} 
              description={description}
            >
              {actions}
            </PageHeader>
          </div>
        )}
        <div className={title ? "px-6 py-6" : "p-6"}>
          {children}
        </div>
      </MainLayout>
    </SidebarProvider>
  );
};

export default PageLayout;
