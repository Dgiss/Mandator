
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
import { 
  Folder, 
  FileText, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Download,
  Trash2,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import MarcheFasciculeForm from './MarcheFasciculeForm';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Fascicule, Document } from '@/services/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getPublicUrl, deleteFile } from '@/services/storageService';

interface MarcheFasciculesProps {
  marcheId: string;
}

export default function MarcheFascicules({ marcheId }: MarcheFasciculesProps) {
  const [fascicules, setFascicules] = useState<Fascicule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFascicule, setEditingFascicule] = useState<Fascicule | null>(null);
  const [selectedFascicule, setSelectedFascicule] = useState<Fascicule | null>(null);
  const [fasciculeDocuments, setFasciculeDocuments] = useState<Document[]>([]);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fasciculeToDelete, setFasciculeToDelete] = useState<Fascicule | null>(null);
  const [deletingFascicule, setDeletingFascicule] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();

  // First determine the user's role to optimize queries
  useEffect(() => {
    const getUserRole = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) {
          console.error('No authenticated user found');
          return;
        }
        
        // Direct query to get user role from profiles
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role_global')
          .eq('id', userData.user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          return;
        }
        
        setUserRole(profileData?.role_global || null);
        console.log('User role determined:', profileData?.role_global);
      } catch (error) {
        console.error('Error determining user role:', error);
      }
    };
    
    getUserRole();
  }, []);

  // Fetch fascicules from Supabase with admin bypass
  useEffect(() => {
    if (!marcheId || !userRole) return;
    
    const fetchFascicules = async () => {
      setLoading(true);
      try {
        console.log(`Fetching fascicules for marché ${marcheId} as ${userRole}`);
        
        // ADMIN bypass for direct query
        if (userRole === 'ADMIN') {
          console.log('Admin user - using direct query');
          const { data: fasciculesData, error } = await supabase
            .from('fascicules')
            .select('*')
            .eq('marche_id', marcheId);
            
          if (error) throw error;
          
          // Format data
          const formattedData = (fasciculesData || []).map(fascicule => ({
            id: fascicule.id,
            nom: fascicule.nom,
            nombredocuments: fascicule.nombredocuments || 0,
            datemaj: fascicule.datemaj || new Date().toLocaleDateString('fr-FR'),
            progression: fascicule.progression || 0,
            description: fascicule.description,
            marche_id: fascicule.marche_id
          }));
          
          setFascicules(formattedData);
          console.log('Fetched fascicules:', formattedData.length);
          return;
        }
        
        // For non-admin users, verify access using direct query
        console.log('Standard user - checking access before fetching');
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) {
          throw new Error('User not authenticated');
        }
        
        // First check if user is creator of the marché
        const { data: marcheData, error: marcheError } = await supabase
          .from('marches')
          .select('user_id')
          .eq('id', marcheId)
          .single();
          
        if (!marcheError && marcheData && marcheData.user_id === userData.user.id) {
          console.log('User is creator of the marché, fetching fascicules');
          const { data: fasciculesData, error } = await supabase
            .from('fascicules')
            .select('*')
            .eq('marche_id', marcheId);
            
          if (error) throw error;
          
          const formattedData = (fasciculesData || []).map(fascicule => ({
            id: fascicule.id,
            nom: fascicule.nom,
            nombredocuments: fascicule.nombredocuments || 0,
            datemaj: fascicule.datemaj || new Date().toLocaleDateString('fr-FR'),
            progression: fascicule.progression || 0,
            description: fascicule.description,
            marche_id: fascicule.marche_id
          }));
          
          setFascicules(formattedData);
          console.log('Fetched fascicules as creator:', formattedData.length);
          return;
        }
        
        // Check if user has explicit rights to the marché
        const { data: droitData, error: droitError } = await supabase
          .from('droits_marche')
          .select('id')
          .eq('user_id', userData.user.id)
          .eq('marche_id', marcheId)
          .maybeSingle();
          
        if (droitError) {
          console.error('Error checking user rights:', droitError);
        }
        
        if (droitData) {
          // User has explicit rights, fetch fascicules
          console.log('User has explicit rights, fetching fascicules');
          const { data: fasciculesData, error } = await supabase
            .from('fascicules')
            .select('*')
            .eq('marche_id', marcheId);
            
          if (error) throw error;
          
          const formattedData = (fasciculesData || []).map(fascicule => ({
            id: fascicule.id,
            nom: fascicule.nom,
            nombredocuments: fascicule.nombredocuments || 0,
            datemaj: fascicule.datemaj || new Date().toLocaleDateString('fr-FR'),
            progression: fascicule.progression || 0,
            description: fascicule.description,
            marche_id: fascicule.marche_id
          }));
          
          setFascicules(formattedData);
          console.log('Fetched fascicules with explicit rights:', formattedData.length);
          return;
        }
        
        // If we get here, user doesn't have access
        console.warn('User has no access to this marché');
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les droits nécessaires pour accéder à ce marché",
          variant: "destructive",
        });
        setFascicules([]);
        
      } catch (error) {
        console.error('Error fetching fascicules:', error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer la liste des fascicules",
          variant: "destructive",
        });
        setFascicules([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFascicules();
  }, [marcheId, userRole, toast]);

  // Fetch documents for a specific fascicule - with admin bypass
  const fetchFasciculeDocuments = async (fasciculeId: string) => {
    setLoadingDocuments(true);
    try {
      console.log(`Fetching documents for fascicule ${fasciculeId} as ${userRole}`);
      
      // Direct query for all users since we've already verified access to the marché
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('fascicule_id', fasciculeId);
      
      if (error) throw error;
      
      setFasciculeDocuments(data || []);
      console.log('Fetched documents:', data?.length || 0);
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

  const handleEditFascicule = (fascicule: Fascicule) => {
    setEditingFascicule(fascicule);
  };

  const handleFasciculeCreated = () => {
    // Reload fascicules data after creation
    if (marcheId && userRole) {
      setLoading(true);
      
      const reloadFascicules = async () => {
        try {
          let queryBuilder = supabase
            .from('fascicules')
            .select('*')
            .eq('marche_id', marcheId);
            
          const { data, error } = await queryBuilder;
          
          if (error) throw error;
          
          const formattedData = (data || []).map(fascicule => ({
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
          console.error('Error reloading fascicules:', error);
          toast({
            title: "Erreur",
            description: "Impossible de rafraîchir la liste des fascicules",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };
      
      reloadFascicules();
    }
  };

  const handleViewDocuments = (fascicule: Fascicule) => {
    setSelectedFascicule(fascicule);
    fetchFasciculeDocuments(fascicule.id);
    setDocumentDialogOpen(true);
  };

  // Preview document in a dialog
  const handlePreviewDocument = (document: Document) => {
    setSelectedDocument(document);
    
    // Get public URL from storage
    if (document.file_path) {
      const url = getPublicUrl('fascicule-attachments', document.file_path);
      setDocumentUrl(url);
      setPreviewDialogOpen(true);
    } else {
      toast({
        title: "Erreur",
        description: "Ce document n'a pas de fichier associé",
        variant: "destructive",
      });
    }
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
      
      // Create a download link using the window.document object for better browser compatibility
      const url = URL.createObjectURL(data);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.nom;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Téléchargement réussi",
        description: `Le fichier ${document.nom} a été téléchargé`,
        variant: "default",
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

  // Open confirmation dialog before deleting a fascicule
  const confirmDeleteFascicule = (fascicule: Fascicule) => {
    setFasciculeToDelete(fascicule);
    setDeleteDialogOpen(true);
  };

  // Delete a fascicule and its documents
  const handleDeleteFascicule = async () => {
    if (!fasciculeToDelete) return;
    
    setDeletingFascicule(true);
    try {
      // 1. Get all documents for this fascicule
      const { data: documents, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .eq('fascicule_id', fasciculeToDelete.id);
      
      if (docsError) throw docsError;
      
      // 2. Delete all document files from storage
      for (const doc of documents || []) {
        if (doc.file_path) {
          await deleteFile('fascicule-attachments', doc.file_path);
        }
      }
      
      // 3. Delete all documents from database
      if (documents && documents.length > 0) {
        const { error: deleteDocsError } = await supabase
          .from('documents')
          .delete()
          .eq('fascicule_id', fasciculeToDelete.id);
        
        if (deleteDocsError) throw deleteDocsError;
      }
      
      // 4. Delete the fascicule
      const { error: deleteFasciculeError } = await supabase
        .from('fascicules')
        .delete()
        .eq('id', fasciculeToDelete.id);
      
      if (deleteFasciculeError) throw deleteFasciculeError;
      
      // 5. Update UI
      setFascicules(fascicules.filter(f => f.id !== fasciculeToDelete.id));
      setDeleteDialogOpen(false);
      setFasciculeToDelete(null);
      
      toast({
        title: "Fascicule supprimé",
        description: `Le fascicule "${fasciculeToDelete.nom}" et ses documents associés ont été supprimés avec succès`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error deleting fascicule:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le fascicule",
        variant: "destructive",
      });
    } finally {
      setDeletingFascicule(false);
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

  // Check if document type can be previewed in browser
  const canPreviewInBrowser = (document: Document) => {
    const type = document.type?.toLowerCase();
    return type?.includes('image') || 
           type?.includes('png') || 
           type?.includes('jpg') || 
           type?.includes('jpeg') || 
           type?.includes('pdf');
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
                <TableHead className="w-[180px]">Actions</TableHead>
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
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Modifier</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleViewDocuments(fascicule)}
                          title="Voir les documents"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Voir les documents</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => confirmDeleteFascicule(fascicule)}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Supprimer</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                        >
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
                    <TableHead className="w-[120px]">Actions</TableHead>
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
                        <div className="flex space-x-1">
                          {canPreviewInBrowser(document) && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => handlePreviewDocument(document)}
                              title="Prévisualiser"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Prévisualiser</span>
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleDownloadDocument(document)}
                            title="Télécharger"
                          >
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Télécharger</span>
                          </Button>
                        </div>
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

      {/* Document preview dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="sm:max-w-[800px] sm:max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedDocument && (
                <div className="flex items-center">
                  {getDocumentIcon(selectedDocument.type)}
                  <span className="ml-2">{selectedDocument.nom}</span>
                </div>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedDocument?.description || "Aucune description disponible."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-grow overflow-auto mt-4 border rounded-md bg-gray-50 min-h-[400px] flex flex-col items-center justify-center">
            {documentUrl ? (
              selectedDocument?.type?.toLowerCase().includes('pdf') ? (
                <div className="w-full h-full min-h-[400px]">
                  <iframe 
                    src={`${documentUrl}#toolbar=0`} 
                    className="w-full h-[500px] border-none" 
                    title={selectedDocument.nom}
                  />
                </div>
              ) : selectedDocument?.type?.toLowerCase().includes('image') || 
                 selectedDocument?.type?.toLowerCase().includes('png') || 
                 selectedDocument?.type?.toLowerCase().includes('jpg') || 
                 selectedDocument?.type?.toLowerCase().includes('jpeg') ? (
                <img 
                  src={documentUrl} 
                  alt={selectedDocument.nom}
                  className="max-w-full max-h-[500px] object-contain" 
                />
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
                  <p>Ce type de fichier ne peut pas être prévisualisé dans le navigateur.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => selectedDocument && handleDownloadDocument(selectedDocument)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger le fichier
                  </Button>
                </div>
              )
            ) : (
              <div className="text-center">
                <p>Impossible de charger l'aperçu du document.</p>
              </div>
            )}
          </div>
          
          <DialogFooter className="mt-4">
            <a 
              href={documentUrl || '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`inline-flex items-center ${!documentUrl ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Ouvrir dans un nouvel onglet
              </Button>
            </a>
            <Button 
              onClick={() => selectedDocument && handleDownloadDocument(selectedDocument)} 
              disabled={!selectedDocument}
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation alert dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              {fasciculeToDelete && (
                <>
                  Êtes-vous sûr de vouloir supprimer le fascicule "{fasciculeToDelete.nom}" ?
                  <br />
                  Cette action est irréversible et supprimera également tous les documents associés.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingFascicule}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteFascicule();
              }}
              disabled={deletingFascicule}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deletingFascicule ? "Suppression en cours..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
