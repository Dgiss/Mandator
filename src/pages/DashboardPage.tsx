
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuth } from '@/utils/authUtils';
import MainLayout from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  LayoutDashboard, 
  FileEdit,
  ArrowRight,
  ChevronRight,
  Settings,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
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

  // Return the status badge element based on status
  const getStatusBadge = (status) => {
    if (status === "En cours") {
      return <span className="inline-flex items-center">
        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
        <span className="text-sm text-gray-600">{status}</span>
      </span>;
    } else if (status === "En attente") {
      return <span className="inline-flex items-center">
        <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
        <span className="text-sm text-gray-600">{status}</span>
      </span>;
    } else {
      return <span className="inline-flex items-center">
        <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
        <span className="text-sm text-gray-600">{status}</span>
      </span>;
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Tableau de bord</h1>
          <p className="text-gray-600">Bienvenue sur votre espace de gestion des marchés publics</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <Card key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <div>
                    {stat.icon}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {/* Main Content - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Projects Column */}
          <div className="lg:col-span-2">
            <Card className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Projets récents</h2>
                <div className="space-y-4">
                  {recentProjects.map(project => (
                    <div key={project.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                      <div className="p-4 flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-800">{project.name}</h4>
                          <p className="text-sm text-gray-600">Client: {project.client}</p>
                        </div>
                        <div className="flex items-center">
                          {getStatusBadge(project.status)}
                          <button 
                            onClick={() => navigate(`/marches/${project.id}`)}
                            className="ml-4 p-1 text-gray-400 hover:text-gray-600 rounded"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
          
          {/* Actions Column */}
          <div>
            <Card className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Actions rapides</h2>
                <div className="space-y-3">
                  <Button 
                    variant="default" 
                    className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                    onClick={() => ensureAuth() && navigate('/marches/creation')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Créer un nouveau marché
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => ensureAuth() && navigate('/formulaires')}
                  >
                    <FileEdit className="mr-2 h-4 w-4" />
                    Gérer les formulaires
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => ensureAuth() && navigate('/clients')}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Gérer les clients
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
