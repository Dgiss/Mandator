
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Marche } from '@/services/types';
import { fetchMarches } from '@/services/marchesService';
import MarchesList from '@/components/marches/MarchesList';
import MarchesFilters from '@/components/marches/MarchesFilters';

export default function MarchesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // État local
  const [searchTerm, setSearchTerm] = useState('');
  const [marches, setMarches] = useState<Marche[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Chargement des marchés depuis Supabase
  useEffect(() => {
    let isMounted = true;
    
    const loadMarches = async () => {
      if (!isMounted) return;
      
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMarches();
        
        if (!isMounted) return;
        
        console.log("Marchés chargés:", data);
        setMarches(data);
        setTotalCount(data.length);
      } catch (error) {
        if (!isMounted) return;
        
        console.error('Erreur lors du chargement des marchés:', error);
        setError("Impossible de récupérer la liste des marchés. Veuillez réessayer ultérieurement.");
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
  }, [toast]);

  // Mémoisation de la liste filtrée
  const filteredMarches = useMemo(() => {
    return marches.filter(marche => 
      marche.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (marche.client && marche.client.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [marches, searchTerm]);

  // Gestionnaires d'événements
  const handleMarcheClick = useCallback((marcheId: string) => {
    navigate(`/marches/${marcheId}`);
  }, [navigate]);

  const handleCreateMarche = useCallback(() => {
    navigate('/marches/creation');
  }, [navigate]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // Actions pour la page
  const pageActions = (
    <Button 
      variant="btpPrimary" 
      onClick={handleCreateMarche} 
      className="flex items-center"
    >
      <Plus className="mr-2 h-4 w-4" /> Nouveau marché
    </Button>
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
    </PageLayout>
  );
}
