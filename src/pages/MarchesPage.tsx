
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Marche } from '@/services/types';
import { fetchMarches } from '@/services/marches';
import MarchesList from '@/components/marches/MarchesList';
import MarchesFilters from '@/components/marches/MarchesFilters';
import MarketCreationModal from '@/components/marches/MarketCreationModal';

export default function MarchesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { canCreateMarche } = useUserRole();
  
  // État local
  const [searchTerm, setSearchTerm] = useState('');
  const [marches, setMarches] = useState<Marche[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fonction pour charger les marchés
  const loadMarches = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Chargement des marchés...");
      const data = await fetchMarches();
      
      // Vérifier que data est un tableau valide
      if (!data || !Array.isArray(data)) {
        console.warn("Les données reçues ne sont pas un tableau valide:", data);
        setMarches([]);
        setTotalCount(0);
        setError("Format de données invalide");
        return;
      }
      
      console.log("Marchés chargés avec succès:", data.length, "marchés");
      setMarches(data);
      setTotalCount(data.length);
      
      // Si aucun marché n'est trouvé mais pas d'erreur, afficher un toast informatif
      if (data.length === 0) {
        toast({
          title: "Information",
          description: "Aucun marché trouvé. Vous pouvez en créer un nouveau.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des marchés:', error);
      setError("Impossible de récupérer la liste des marchés. Veuillez réessayer ultérieurement.");
      // S'assurer que marches est un tableau vide en cas d'erreur
      setMarches([]);
      setTotalCount(0);
      
      toast({
        title: "Erreur",
        description: "Impossible de récupérer la liste des marchés",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  // Rafraîchir manuellement la liste
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadMarches();
  }, [loadMarches]);

  // Chargement initial des marchés
  useEffect(() => {
    console.log("useEffect de MarchesPage déclenché");
    let isMounted = true;
    
    const initialLoad = async () => {
      if (!isMounted) return;
      await loadMarches();
    };

    initialLoad();
    
    return () => {
      isMounted = false;
    };
  }, [loadMarches]);

  // Mémoisation de la liste filtrée avec gestion des valeurs null/undefined
  const filteredMarches = useMemo(() => {
    if (!marches || !Array.isArray(marches)) return [];
    
    return marches.filter(marche => {
      const titre = (marche.titre || '').toLowerCase();
      const client = (marche.client || '').toLowerCase();
      const term = searchTerm.toLowerCase();
      
      return titre.includes(term) || client.includes(term);
    });
  }, [marches, searchTerm]);

  // Gestionnaires d'événements
  const handleMarcheClick = useCallback((marcheId: string) => {
    if (!marcheId) {
      console.warn("ID de marché invalide:", marcheId);
      return;
    }
    console.log("Navigation vers le marché:", marcheId);
    navigate(`/marches/${marcheId}`);
  }, [navigate]);

  const handleCreateMarche = useCallback(() => {
    setIsCreationModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsCreationModalOpen(false);
    // Raffraîchir la liste des marchés après la création
    loadMarches();
  }, [loadMarches]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // Actions pour la page
  const pageActions = (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="flex items-center"
      >
        <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        Actualiser
      </Button>
      
      {canCreateMarche && (
        <Button 
          variant="btpPrimary" 
          onClick={handleCreateMarche} 
          className="flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" /> Nouveau marché
        </Button>
      )}
    </div>
  );

  return (
    <PageLayout 
      title="Gestion des Marchés" 
      description={`Consultez et gérez l'ensemble de vos marchés publics (${totalCount} marchés au total)`}
      actions={pageActions}
    >
      <MarchesFilters 
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />
      
      <MarchesList 
        marches={filteredMarches}
        loading={loading}
        error={error}
        onMarcheClick={handleMarcheClick}
      />
      
      <MarketCreationModal 
        isOpen={isCreationModalOpen}
        onClose={handleCloseModal}
      />
    </PageLayout>
  );
}
