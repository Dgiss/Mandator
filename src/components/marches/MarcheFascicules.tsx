
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, FolderPlus, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/userRole';
import { fetchFasciculesByMarcheId } from '@/services/marches/fetchFasciculesByMarcheId';
import MarcheFasciculeForm from './MarcheFasciculeForm';

interface MarcheFasciculesProps {
  marcheId: string;
}

const MarcheFascicules: React.FC<MarcheFasciculesProps> = ({ marcheId }) => {
  const [fascicules, setFascicules] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [selectedFascicule, setSelectedFascicule] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { canCreateFascicule, isAdmin } = useUserRole(marcheId);

  useEffect(() => {
    loadFascicules();
  }, [marcheId]);

  const loadFascicules = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Chargement des fascicules pour le marché ${marcheId}...`);
      const data = await fetchFasciculesByMarcheId(marcheId);
      console.log(`${data.length} fascicules chargés`);
      setFascicules(data || []);
    } catch (error) {
      console.error('Error fetching fascicules:', error);
      setError("Impossible de charger les fascicules. Veuillez réessayer plus tard.");
      toast({
        title: "Erreur",
        description: "Impossible de charger les fascicules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setSelectedFascicule(null);
    setShowForm(true);
  };

  const handleEditClick = (fascicule: any) => {
    setSelectedFascicule(fascicule);
    setShowForm(true);
  };

  const handleFormClose = (refreshNeeded: boolean = false) => {
    setShowForm(false);
    if (refreshNeeded) {
      loadFascicules();
    }
  };

  const handleRetry = () => {
    loadFascicules();
  };

  // Determine if user can create or modify fascicules
  const userCanCreateOrEdit = isAdmin || canCreateFascicule(marcheId);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Fascicules du marché</h2>
        {userCanCreateOrEdit && (
          <Button 
            variant="default" 
            onClick={handleCreateClick}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Nouveau fascicule
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-48 border border-dashed rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">Erreur de chargement</h3>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={handleRetry}
          >
            Réessayer
          </Button>
        </div>
      ) : fascicules.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border border-dashed rounded-lg p-6 text-center">
          <FolderPlus className="h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">Aucun fascicule</h3>
          <p className="text-sm text-gray-500 mt-1">
            Ce marché ne contient pas encore de fascicules.
          </p>
          {userCanCreateOrEdit && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={handleCreateClick}
            >
              Créer un fascicule
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fascicules.map(fascicule => (
            <Card 
              key={fascicule.id}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => userCanCreateOrEdit && handleEditClick(fascicule)}
            >
              <h3 className="font-medium text-lg">{fascicule.nom}</h3>
              {fascicule.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{fascicule.description}</p>
              )}
              <div className="flex justify-between items-center mt-4">
                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                  {fascicule.nombredocuments || 0} document(s)
                </span>
                <span className="text-xs text-gray-500">
                  Mis à jour: {fascicule.datemaj ? new Date(fascicule.datemaj).toLocaleDateString() : 'Jamais'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <MarcheFasciculeForm
          onClose={handleFormClose}
          marcheId={marcheId}
          fascicule={selectedFascicule}
        />
      )}
    </div>
  );
};

export default MarcheFascicules;
