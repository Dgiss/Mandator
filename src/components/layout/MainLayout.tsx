
import React, { ReactNode } from 'react';
import Navbar from './Navbar';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-slate-100 py-4 border-t">
        <div className="container mx-auto text-center text-sm text-slate-500">
          © {new Date().getFullYear()} - Plateforme de Gestion des Marchés Publics
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
