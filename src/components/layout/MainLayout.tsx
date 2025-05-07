
import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/utils/authUtils';
import { useToast } from '@/hooks/use-toast';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté avec succès",
      variant: "success",
    });
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex justify-end">
            <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center">
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
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
