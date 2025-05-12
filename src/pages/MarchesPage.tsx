
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Marche } from '@/services/types';
import { fetchMarches } from '@/services/marchesService';
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

  // Chargement des marchés depuis Supabase
  useEffect(() => {
    console.log("useEffect de MarchesPage déclenché");
    let isMounted = true;
    
    const loadMarches = async () => {
      if (!isMounted) return;
      
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMarches();
        
        if (!isMounted) return;
        
        // Vérifier que data est un tableau valide
        if (!data || !Array.isArray(data)) {
          console.warn("Les données reçues ne sont pas un tableau valide:", data);
          setMarches([]);
          setTotalCount(0);
          setError("Format de données invalide");
          return;
        }
        
        console.log("Marchés chargés:", data);
        setMarches(data);
        setTotalCount(data.length);
      } catch (error) {
        if (!isMounted) return;
        
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
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadMarches();
    
    return () => {
      isMounted = false;
    };
  }, []); // Dépendances vides pour n'exécuter qu'au montage

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
    navigate(`/marches/${marcheId}`);
  }, [navigate]);

  const handleCreateMarche = useCallback(() => {
    setIsCreationModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsCreationModalOpen(false);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // Actions pour la page
  const pageActions = canCreateMarche ? (
    <Button 
      variant="btpPrimary" 
      onClick={handleCreateMarche} 
      className="flex items-center"
    >
      <Plus className="mr-2 h-4 w-4" /> Nouveau marché
    </Button>
  ) : null;

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
