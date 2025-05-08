
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuth } from '@/utils/authUtils';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Import les services
import { fetchMarcheStats, fetchRecentMarches, MarcheStats } from '@/services/statsService';
import { Marche } from '@/services/types';

// Import the components
import StatsCards from '@/components/home/StatsCards';
import RecentProjects from '@/components/home/RecentProjects';
import QuickActions from '@/components/home/QuickActions';

export default function HomePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // États pour stocker les données
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MarcheStats>({
    enCours: 0,
    projetsActifs: 0,
    devisEnAttente: 0,
    termines: 0
  });
  const [recentProjects, setRecentProjects] = useState<Marche[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Charger les données au chargement de la page
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Charger les statistiques
        const statsData = await fetchMarcheStats();
        if (statsData) {
          setStats(statsData);
        } else {
          console.warn("Données de statistiques invalides");
          // Stats par défaut déjà définies dans le state initial
        }
        
        // Charger les marchés récents
        const recentMarchesData = await fetchRecentMarches(3);
        if (Array.isArray(recentMarchesData)) {
          setRecentProjects(recentMarchesData);
        } else {
          console.warn("Données de marchés récents invalides");
          setRecentProjects([]);
        }
        
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Impossible de charger les données");
        // S'assurer que les données par défaut sont définies
        setStats({
          enCours: 0,
          projetsActifs: 0,
          devisEnAttente: 0,
          termines: 0
        });
        setRecentProjects([]);
        
        toast({
          title: "Erreur",
          description: "Impossible de charger les données",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [toast]);

  // Convertir les données des marchés récents pour le format attendu par RecentProjects
  // avec gestion des valeurs null/undefined
  const formattedRecentProjects = recentProjects && Array.isArray(recentProjects) 
    ? recentProjects.map(marche => ({
        id: marche?.id || '',
        name: marche?.titre || 'Sans titre',
        client: marche?.client || 'Non spécifié',
        status: marche?.statut || 'Non défini'
      }))
    : [];

  // Stats pour les cartes
  const statsCards = [
    { 
      title: "Marchés en cours",
      value: stats ? stats.enCours : 0,
      icon: <FileText className="h-6 w-6 text-btp-blue bg-blue-100 p-1 rounded-full" />
    },
    { 
      title: "Projets actifs",
      value: stats ? stats.projetsActifs : 0,
      icon: <FileText className="h-6 w-6 text-btp-blue bg-blue-100 p-1 rounded-full" />
    },
    { 
      title: "Devis en attente",
      value: stats ? stats.devisEnAttente : 0,
      icon: <FileText className="h-6 w-6 text-btp-blue bg-blue-100 p-1 rounded-full" />
    },
    { 
      title: "Marchés terminés",
      value: stats ? stats.termines : 0,
      icon: <FileText className="h-6 w-6 text-btp-blue bg-blue-100 p-1 rounded-full" />
    },
  ];

  // Function to handle navigation
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // Actions for the page
  const pageActions = (
    <Button 
      variant="btpPrimary" 
      onClick={() => handleNavigation('/marches/creation')}
    >
      <FileText className="mr-2 h-4 w-4" />
      Nouveau marché
    </Button>
  );

  return (
    <PageLayout 
      title="Tableau de bord" 
      description="Bienvenue sur votre espace de gestion des marchés publics" 
      actions={pageActions}
    >
      {/* Stats Cards */}
      <StatsCards stats={statsCards} loading={loading} />
      
      {/* Main Content - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects Column */}
        <div className="lg:col-span-2">
          <RecentProjects projects={formattedRecentProjects} loading={loading} />
        </div>
        
        {/* Actions Column */}
        <div>
          <QuickActions />
        </div>
      </div>
    </PageLayout>
  );
}
