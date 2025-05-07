
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuth } from '@/utils/authUtils';
import MainLayout from '@/components/layout/MainLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Stats data - would typically come from an API
  const stats = [
    { 
      title: "Marchés en cours",
      value: 12,
      description: "Marchés actifs",
      color: "bg-blue-100 text-blue-800",
      icon: "📄"
    },
    { 
      title: "Projets actifs",
      value: 7,
      description: "En cours de réalisation",
      color: "bg-green-100 text-green-800",
      icon: "🔧"
    },
    { 
      title: "Devis en attente",
      value: 5,
      description: "À analyser",
      color: "bg-amber-100 text-amber-800", 
      icon: "⏳"
    },
    { 
      title: "Marchés terminés",
      value: 23,
      description: "Achevés",
      color: "bg-purple-100 text-purple-800",
      icon: "✓"
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
  const getStatusBadge = (status: string) => {
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
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {stats.map((stat, i) => (
            <Card key={i}>
              <CardHeader className={`${stat.color} rounded-t-lg py-2`}>
                <CardTitle className="text-center text-lg">{stat.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-3xl font-bold text-center">{stat.value}</p>
                <p className="text-sm text-muted-foreground text-center mt-2">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Projets récents</CardTitle>
            </CardHeader>
            <CardContent>
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
              
              <div className="mt-4 text-right">
                <Button variant="link" onClick={() => navigate('/marches')} className="px-0">
                  Voir tous les projets <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
