
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuth } from '@/utils/authUtils';
import MainLayout from '@/components/layout/MainLayout';
import Dashboard from '@/components/Dashboard';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, FileText, LayoutDashboard, FileEdit, Database, FileCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Stats data - would typically come from an API
  const stats = [
    { 
      title: "Marchés",
      value: 12,
      description: "Marchés actifs",
      color: "bg-blue-100 text-blue-800",
    },
    { 
      title: "Fascicules",
      value: 37,
      description: "Documents enregistrés",
      color: "bg-green-100 text-green-800",
    },
    { 
      title: "Documents",
      value: 149,
      description: "Fichiers stockés",
      color: "bg-purple-100 text-purple-800", 
    },
    { 
      title: "Situations",
      value: 8,
      description: "En attente de validation",
      color: "bg-amber-100 text-amber-800",
    },
  ];

  // Recent activity data - would typically come from an API
  const recentActivity = [
    { id: 1, action: "Marché créé", description: "Construction bureaux administratifs", date: "Aujourd'hui, 14:32" },
    { id: 2, action: "Document ajouté", description: "Rapport technique fondations", date: "Hier, 09:15" },
    { id: 3, action: "Situation validée", description: "Situation n°4 - Projet Hôpital", date: "18/08, 16:45" },
    { id: 4, action: "Fascicule modifié", description: "CCTP Lot Plomberie", date: "16/08, 11:20" },
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

  // Handlers for various actions
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
  
  const goToForms = () => {
    if (checkAuth()) {
      navigate('/formulaires');
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <PageHeader 
          title="Tableau de bord" 
          description="Bienvenue sur la plateforme de gestion des marchés"
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Activité Récente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="flex justify-between items-start pb-3 border-b last:border-0">
                      <div>
                        <h4 className="font-medium">{activity.action}</h4>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {activity.date}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-right">
                  <Button variant="link" onClick={() => navigate('/activite')} className="px-0">
                    Voir toute l'activité <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="btpPrimary" className="w-full justify-start" onClick={goToMarketCreation}>
                <FileText className="mr-2 h-4 w-4" /> Créer un nouveau marché
              </Button>
              <Button variant="btpSecondary" className="w-full justify-start" onClick={goToForms}>
                <FileEdit className="mr-2 h-4 w-4" /> Gérer les formulaires
              </Button>
              <Button variant="btpOutline" className="w-full justify-start" onClick={handleIntegrationSupabase}>
                <Database className="mr-2 h-4 w-4" /> Intégration Supabase
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
