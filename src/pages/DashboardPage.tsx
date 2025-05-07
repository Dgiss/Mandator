
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuth } from '@/utils/authUtils';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Import the components
import StatsCards from '@/components/home/StatsCards';
import RecentProjects from '@/components/home/RecentProjects';
import QuickActions from '@/components/home/QuickActions';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Stats data matching the image
  const stats = [
    { 
      title: "Marchés en cours",
      value: 12,
      icon: <FileText className="h-6 w-6 text-btp-blue bg-blue-100 p-1 rounded-full" />
    },
    { 
      title: "Projets actifs",
      value: 7,
      icon: <FileText className="h-6 w-6 text-green-600 bg-green-100 p-1 rounded-full" />
    },
    { 
      title: "Devis en attente",
      value: 5,
      icon: <FileText className="h-6 w-6 text-amber-600 bg-amber-100 p-1 rounded-full" />
    },
    { 
      title: "Marchés terminés",
      value: 23,
      icon: <FileText className="h-6 w-6 text-purple-600 bg-purple-100 p-1 rounded-full" />
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

  // Actions for the page
  const pageActions = (
    <Button 
      variant="btpPrimary" 
      onClick={() => ensureAuth() && navigate('/marches/creation')}
    >
      <FileText className="mr-2 h-4 w-4" />
      Nouveau marché
    </Button>
  );

  return (
    <PageLayout 
      title="Tableau de bord" 
      description="Vue d'ensemble de vos marchés et projets" 
      actions={pageActions}
    >
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
    </PageLayout>
  );
}
