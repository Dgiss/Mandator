
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuth } from '@/utils/authUtils';
import MainLayout from '@/components/layout/MainLayout';
import { useToast } from '@/hooks/use-toast';
import { FileText, LayoutDashboard, FileEdit, FileText as FileTextIcon } from 'lucide-react';

// Import the newly created components
import StatsCards from '@/components/home/StatsCards';
import RecentProjects from '@/components/home/RecentProjects';
import QuickActions from '@/components/home/QuickActions';

export default function HomePage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Stats data matching the image
  const stats = [
    { 
      title: "Marchés en cours",
      value: 12,
      icon: <FileText className="h-6 w-6 text-blue-600 bg-blue-100 p-1 rounded-full" />
    },
    { 
      title: "Projets actifs",
      value: 7,
      icon: <LayoutDashboard className="h-6 w-6 text-green-600 bg-green-100 p-1 rounded-full" />
    },
    { 
      title: "Devis en attente",
      value: 5,
      icon: <FileEdit className="h-6 w-6 text-amber-600 bg-amber-100 p-1 rounded-full" />
    },
    { 
      title: "Marchés terminés",
      value: 23,
      icon: <FileTextIcon className="h-6 w-6 text-purple-600 bg-purple-100 p-1 rounded-full" />
    },
  ];

  // Recent projects data matching the image
  const recentProjects = [
    { 
      id: 1, 
      name: "Rénovation Mairie", 
      client: "Ville de Lyon", 
      status: "En cours" 
    },
    { 
      id: 2, 
      name: "Construction école", 
      client: "Département du Rhône", 
      status: "En attente" 
    },
    { 
      id: 3, 
      name: "Réfection voirie", 
      client: "Métropole de Lyon", 
      status: "En cours" 
    },
  ];

  // Function to check authentication and redirect to login if not authenticated
  const ensureAuth = () => {
    if (!checkAuth()) {
      toast({
        title: "Authentification requise",
        description: "Veuillez vous connecter pour accéder à cette fonctionnalité",
        variant: "destructive",
      });
      navigate('/login');
      return false;
    }
    return true;
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Tableau de bord</h1>
          <p className="text-gray-600">Bienvenue sur votre espace de gestion des marchés publics</p>
        </div>
        
        {/* Stats Cards */}
        <StatsCards stats={stats} />
        
        {/* Main Content - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Projects Column */}
          <div className="lg:col-span-2">
            <RecentProjects projects={recentProjects} />
          </div>
          
          {/* Actions Column */}
          <div>
            <QuickActions ensureAuth={ensureAuth} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
