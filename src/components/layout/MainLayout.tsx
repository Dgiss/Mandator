
import React, { ReactNode } from 'react';
import Navbar from './Navbar';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Navbar />
      
      {/* Main content area with proper padding to account for the sidebar */}
      <main className="flex-1 md:ml-60">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
