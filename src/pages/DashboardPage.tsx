
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuth, logout } from '@/utils/authUtils';
import MainLayout from '@/components/layout/MainLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, FileText, Settings, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Stats data
  const stats = [
    { 
      title: "Marchés en cours",
      value: 12,
      icon: <FileText className="h-6 w-6 text-blue-500" />
    },
    { 
      title: "Projets actifs",
      value: 7,
      icon: <Settings className="h-6 w-6 text-green-500" />
    },
    { 
      title: "Devis en attente",
      value: 5,
      icon: <FileText className="h-6 w-6 text-amber-500" />
    },
    { 
      title: "Marchés terminés",
      value: 23,
      icon: <FileText className="h-6 w-6 text-purple-500" />
    },
  ];

  // Recent projects data
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
      return <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>;
    } else if (status === "En attente") {
      return <span className="inline-block w-3 h-3 bg-amber-500 rounded-full mr-2"></span>;
    } else {
      return <span className="inline-block w-3 h-3 bg-gray-500 rounded-full mr-2"></span>;
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <PageHeader 
          title="Tableau de bord" 
          description="Bienvenue sur votre espace de gestion des marchés publics"
        />
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <Card key={i} className="border">
              <CardContent className="flex items-center p-6">
                <div className="mr-4">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Main Content - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Projects Column */}
          <div className="lg:col-span-2">
            <Card className="border h-full">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Projets récents</h2>
                <div className="space-y-4">
                  {recentProjects.map(project => (
                    <div key={project.id} className="flex justify-between items-center p-4 border rounded-md hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/marches/${project.id}`)}>
                      <div>
                        <h4 className="font-medium text-lg">{project.name}</h4>
                        <p className="text-sm text-muted-foreground">Client: {project.client}</p>
                      </div>
                      <div className="flex items-center">
                        <div className="flex items-center mr-4">
                          {getStatusBadge(project.status)}
                          <span className="text-sm">{project.status}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Actions Column */}
          <div>
            <Card className="border h-full">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
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
                    className="w-full justify-start"
                    onClick={() => ensureAuth() && navigate('/formulaires')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Gérer les formulaires
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => ensureAuth() && navigate('/clients')}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Gérer les clients
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
