
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Marche, Visa } from '@/services/types';
import { fetchMarcheById } from '@/services/marchesService';
import { visasService } from '@/services/visasService';
import { versionsService } from '@/services/versionsService';
import { useToast } from '@/hooks/use-toast';

export interface DocumentStats {
  total: number;
  approuves: number;
  enAttente: number;
}

export interface FasciculeProgress {
  nom: string;
  progression: number;
}

interface UseMarcheDetailReturn {
  marche: Marche | null;
  loading: boolean;
  visasEnAttente: Visa[];
  documentStats: DocumentStats;
  fasciculeProgress: FasciculeProgress[];
  documentsRecents: any[];
  getStatusColor: (statut: string) => string;
  formatDate: (dateString: string | null) => string;
}

export const useMarcheDetail = (id: string | undefined): UseMarcheDetailReturn => {
  const { toast } = useToast();
  const [marche, setMarche] = useState<Marche | null>(null);
  const [loading, setLoading] = useState(true);
  const [visasEnAttente, setVisasEnAttente] = useState<Visa[]>([]);
  const [documentStats, setDocumentStats] = useState<DocumentStats>({
    total: 0,
    approuves: 0,
    enAttente: 0
  });
  const [fasciculeProgress, setFasciculeProgress] = useState<FasciculeProgress[]>([]);
  const [documentsRecents, setDocumentsRecents] = useState<any[]>([]);

  // Clé de mémorisation pour éviter des appels inutiles
  const memoKey = useMemo(() => id || 'undefined', [id]);

  useEffect(() => {
    console.log("useEffect de useMarcheDetail déclenché avec id:", id);
    if (!id) return;
    
    let isMounted = true;
    
    const loadMarcheData = async () => {
      if (!isMounted) return;
      
      setLoading(true);
      try {
        console.log("Chargement des données du marché:", id);
        const marcheData = await fetchMarcheById(id);
        
        if (!isMounted) return;
        setMarche(marcheData);

        // Récupérer les visas en attente pour ce marché
        const visasData = await visasService.getVisasByMarcheId(id);
        if (!isMounted) return;
        
        const filteredVisas = visasData && Array.isArray(visasData) 
          ? visasData.filter((visa: any) => visa.statut === 'En attente')
          : [];
        setVisasEnAttente(filteredVisas.slice(0, 3)); // Limiter à 3 pour l'affichage

        // Calculer les statistiques des documents
        setDocumentStats({
          total: Array.isArray(visasData) ? visasData.length : 0,
          approuves: Array.isArray(visasData) ? visasData.filter((visa: any) => visa.statut === 'Approuvé').length : 0,
          enAttente: filteredVisas.length
        });

        // Récupérer les données de progression des fascicules
        const fascicules = [
          { nom: "Lot 1 - Génie Civil", progression: 75 },
          { nom: "Lot 2 - Turbines", progression: 40 }
        ];
        if (!isMounted) return;
        setFasciculeProgress(fascicules);

        // Récupérer les documents récents
        const versionsData = await versionsService.getVersionsByMarcheId(id);
        if (!isMounted) return;
        
        const validVersionsData = Array.isArray(versionsData) ? versionsData : [];
        setDocumentsRecents(validVersionsData.slice(0, 3)); // Limiter à 3 pour l'affichage
      } catch (error) {
        if (!isMounted) return;
        
        console.error("Erreur lors du chargement des données du marché:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du marché",
          variant: "destructive",
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadMarcheData();
    
    return () => {
      console.log("Nettoyage de l'effet useMarcheDetail");
      isMounted = false;
    };
  }, [memoKey, toast]); // Utiliser memoKey comme dépendance et inclure toast

  // Fonction pour obtenir la couleur de statut
  const getStatusColor = useCallback((statut: string) => {
    switch(statut) {
      case 'En cours': return 'bg-btp-blue text-white';
      case 'Terminé': return 'bg-green-500 text-white';
      case 'En attente': return 'bg-amber-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  }, []);

  // Fonction de formatage de date
  const formatDate = useCallback((dateString: string | null) => {
    if (!dateString) return 'Non spécifiée';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error, dateString);
      return dateString;
    }
  }, []);

  return {
    marche,
    loading,
    visasEnAttente,
    documentStats,
    fasciculeProgress,
    documentsRecents,
    getStatusColor,
    formatDate
  };
};
