
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
import { Folder, FileText, Plus, MoreHorizontal, Edit, Eye, Download } from 'lucide-react';
import MarcheFasciculeForm from './MarcheFasciculeForm';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Fascicule } from '@/services/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MarcheFasciculesProps {
  marcheId: string;
}

interface Document {
  id: string;
  nom: string;
  type: string;
  statut: string;
  dateUpload?: string;
  taille?: string;
  file_path?: string;
}

export default function MarcheFascicules({ marcheId }: MarcheFasciculesProps) {
  const [fascicules, setFascicules] = useState<Fascicule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFascicule, setEditingFascicule] = useState<Fascicule | null>(null);
  const [selectedFascicule, setSelectedFascicule] = useState<Fascicule | null>(null);
  const [fasciculeDocuments, setFasciculeDocuments] = useState<Document[]>([]);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
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
        nombredocuments: fascicule.nombredocuments || 0,
        datemaj: fascicule.datemaj || new Date().toLocaleDateString('fr-FR'),
        progression: fascicule.progression || 0,
        description: fascicule.description,
        marche_id: fascicule.marche_id
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

  // Fetch documents for a specific fascicule
  const fetchFasciculeDocuments = async (fasciculeId: string) => {
    setLoadingDocuments(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('fascicule_id', fasciculeId);
      
      if (error) throw error;
      
      setFasciculeDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents for fascicule:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les documents du fascicule",
        variant: "destructive",
      });
      setFasciculeDocuments([]);
    } finally {
      setLoadingDocuments(false);
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

  const handleViewDocuments = (fascicule: Fascicule) => {
    setSelectedFascicule(fascicule);
    fetchFasciculeDocuments(fascicule.id);
    setDocumentDialogOpen(true);
  };

  // Download document from Supabase storage
  const handleDownloadDocument = async (document: Document) => {
    try {
      if (!document.file_path) {
        toast({
          title: "Erreur",
          description: "Le chemin du fichier est introuvable",
          variant: "destructive",
        });
        return;
      }
      
      // Get download URL
      const { data, error } = await supabase.storage
        .from('fascicule-attachments')
        .download(document.file_path);
      
      if (error) {
        throw error;
      }
      
      // Create a download link using the browser's document object
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = document.nom;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Téléchargement réussi",
        description: `Le fichier ${document.nom} a été téléchargé`,
        variant: "success",
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le document",
        variant: "destructive",
      });
    }
  };

  // Get the document icon based on its type
  const getDocumentIcon = (type: string) => {
    const fileType = type?.toLowerCase();
    
    if (fileType?.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (fileType?.includes('word') || fileType?.includes('doc')) return <FileText className="h-5 w-5 text-blue-500" />;
    if (fileType?.includes('excel') || fileType?.includes('sheet') || fileType?.includes('xls')) return <FileText className="h-5 w-5 text-green-500" />;
    if (fileType?.includes('image') || fileType?.includes('png') || fileType?.includes('jpg') || fileType?.includes('jpeg')) return <FileText className="h-5 w-5 text-purple-500" />;
    
    return <FileText className="h-5 w-5 text-gray-500" />;
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
                <TableHead className="w-[150px]">Actions</TableHead>
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
                        <span>{fascicule.nombredocuments}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{fascicule.datemaj}</TableCell>
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
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleViewDocuments(fascicule)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Voir les documents</span>
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

      {/* Document viewer dialog */}
      <Dialog open={documentDialogOpen} onOpenChange={setDocumentDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {selectedFascicule && (
                <div className="flex items-center">
                  <Folder className="h-5 w-5 mr-2 text-btp-blue" />
                  Documents du fascicule: {selectedFascicule.nom}
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            {loadingDocuments ? (
              <div className="text-center py-8">
                Chargement des documents...
              </div>
            ) : fasciculeDocuments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead className="hidden md:table-cell">Taille</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fasciculeDocuments.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell>
                        <div className="flex items-center">
                          {getDocumentIcon(document.type)}
                          <span className="ml-2">{document.nom}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{document.type}</TableCell>
                      <TableCell className="hidden md:table-cell">{document.taille}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                          {document.statut}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleDownloadDocument(document)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 border border-dashed rounded-md">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">
                  Aucun document attaché à ce fascicule
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
