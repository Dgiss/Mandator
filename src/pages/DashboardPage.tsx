
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, FileText, LayoutDashboard, FileEdit, Database, FileCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Simuler des données pour le tableau de bord
  const stats = [
    { title: "Marchés en cours", value: "12", icon: FileText, color: "bg-blue-100 text-blue-600" },
    { title: "Projets actifs", value: "7", icon: LayoutDashboard, color: "bg-green-100 text-green-600" },
    { title: "Devis en attente", value: "5", icon: FileEdit, color: "bg-amber-100 text-amber-600" },
    { title: "Marchés terminés", value: "23", icon: FileCheck, color: "bg-purple-100 text-purple-600" }
  ];

  const recentProjects = [
    { id: 1, name: "Rénovation Mairie", client: "Ville de Lyon", status: "En cours", date: "2023-05-15" },
    { id: 2, name: "Construction école", client: "Département du Rhône", status: "En attente", date: "2023-06-20" },
    { id: 3, name: "Réfection voirie", client: "Métropole de Lyon", status: "En cours", date: "2023-04-10" }
  ];

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        title: "Session expirée",
        description: "Veuillez vous reconnecter",
        variant: "destructive"
      });
      navigate('/login');
      return false;
    }
    return true;
  };

  React.useEffect(() => {
    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté avec succès",
      variant: "success"
    });
    navigate('/login');
  };

  const goToMarketCreation = () => {
    if (checkAuth()) {
      navigate('/marches/creation');
    }
  };

  const handleIntegrationSupabase = () => {
    toast({
      title: "Intégration Supabase",
      description: "Fonctionnalité en cours de développement",
      variant: "default"
    });
  };

  return (
    <PageLayout>
      <PageHeader
        title="Tableau de bord"
        description="Bienvenue sur votre espace de gestion des marchés publics"
      >
        <Button variant="outline" onClick={handleLogout}>
          Déconnexion
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-full ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-xl">Projets récents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="border rounded-md p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{project.name}</h3>
                    <p className="text-sm text-gray-500">Client: {project.client}</p>
                    <div className="flex items-center mt-1">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 
                        ${project.status === 'En cours' ? 'bg-green-500' : 
                          project.status === 'En attente' ? 'bg-amber-500' : 'bg-gray-500'}`}
                      />
                      <span className="text-sm">{project.status}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/marches/${project.id}`)}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-xl">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="btpPrimary" className="w-full justify-start" onClick={goToMarketCreation}>
              <FileText className="mr-2 h-4 w-4" /> Créer un nouveau marché
            </Button>
            <Button variant="btpOutline" className="w-full justify-start" onClick={() => navigate('/marches/creation/fascicule')}>
              <FileEdit className="mr-2 h-4 w-4" /> Créer un nouveau fascicule
            </Button>
            <Button variant="btpSecondary" className="w-full justify-start" onClick={handleIntegrationSupabase}>
              <Database className="mr-2 h-4 w-4" /> Intégration Supabase
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
