
import React, { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import MainLayout from './MainLayout';

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <MainLayout>
        {children}
      </MainLayout>
    </SidebarProvider>
  );
};

export default PageLayout;
