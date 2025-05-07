import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Folder, FileText, Plus, MoreHorizontal, Edit, Eye } from 'lucide-react';
import MarcheFasciculeForm from './MarcheFasciculeForm';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface MarcheFasciculesProps {
  marcheId: string;
}

interface Fascicule {
  id: string;
  nom: string;
  nombreDocuments: number;
  dateMaj: string;
  progression: number;
  description?: string;
}

export default function MarcheFascicules({ marcheId }: MarcheFasciculesProps) {
  const [fascicules, setFascicules] = useState<Fascicule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFascicule, setEditingFascicule] = useState<Fascicule | null>(null);
  const { toast } = useToast();

  // Fetch fascicules from Supabase
  const fetchFascicules = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fascicules')
        .select('*')
        .eq('marche_id', marcheId);
      
      if (error) throw error;
      
      const formattedData = data.map(fascicule => ({
        id: fascicule.id,
        nom: fascicule.nom,
        nombreDocuments: fascicule.nombreDocuments || 0,
        dateMaj: fascicule.dateMaj || new Date().toLocaleDateString('fr-FR'),
        progression: fascicule.progression || 0,
        description: fascicule.description
      }));
      
      setFascicules(formattedData);
    } catch (error) {
      console.error('Error fetching fascicules:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer la liste des fascicules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load fascicules on component mount
  useEffect(() => {
    fetchFascicules();
  }, [marcheId]);

  const handleEditFascicule = (fascicule: Fascicule) => {
    setEditingFascicule(fascicule);
  };

  const handleFasciculeCreated = () => {
    fetchFascicules();
  };

  return (
    <div className="pt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Fascicules</h2>
        <MarcheFasciculeForm 
          marcheId={marcheId} 
          onFasciculeCreated={handleFasciculeCreated}
          editingFascicule={editingFascicule}
          setEditingFascicule={setEditingFascicule}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead className="hidden md:table-cell">Documents</TableHead>
                <TableHead className="hidden md:table-cell">Dernière maj.</TableHead>
                <TableHead>Progression</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Chargement des fascicules...
                  </TableCell>
                </TableRow>
              ) : fascicules.length > 0 ? (
                fascicules.map((fascicule) => (
                  <TableRow key={fascicule.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Folder className="h-5 w-5 mr-2 text-btp-blue" />
                        <span className="font-medium">{fascicule.nom}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1 text-gray-400" />
                        <span>{fascicule.nombreDocuments}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{fascicule.dateMaj}</TableCell>
                    <TableCell>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{fascicule.progression}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${fascicule.progression}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditFascicule(fascicule)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Modifier</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Voir</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Aucun fascicule trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
