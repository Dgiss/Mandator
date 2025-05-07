
import React from 'react';
import Navbar from '../layout/Navbar';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function MainLayout({ children, className }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className={cn("flex-1", className)}>
        {children}
      </main>
      
      <footer className="border-t py-4 bg-gray-50">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} MarchésPublicsBTP. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
