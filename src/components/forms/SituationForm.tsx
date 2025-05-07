
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Save, PlusCircle, Trash2, Calculator, FileSpreadsheet, Info } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface LigneSituation {
  id: string;
  article: string;
  designation: string;
  unite: string;
  quantite: number;
  prixUnitaire: number;
  montantHT: number;
  realise: number;
  precedent: number;
  cumul: number;
  reste: number;
}

const SituationForm = () => {
  const [situationData, setSituationData] = useState({
    reference: '',
    marche: '',
    numero: '1',
    titre: '',
    dateSituation: undefined as Date | undefined,
    dateValidation: undefined as Date | undefined,
    dateEcheance: undefined as Date | undefined,
    montantHT: 0,
    montantTTC: 0,
    tva: 20,
    retenue: 5,
    commentaires: '',
    facture: '',
    status: 'brouillon',
    isAcompte: false,
    estSolde: false
  });
  
  const [lignes, setLignes] = useState<LigneSituation[]>([]);
  
  // Mock data for select fields
  const marches = [
    { id: 'marche-001', titre: 'Marché de rénovation du pont de Grande-Terre' },
    { id: 'marche-002', titre: 'Construction école Marie-Galante' },
    { id: 'marche-003', titre: 'Aménagement place de la Victoire' }
  ];
  
  const articles = [
    { id: 'art-001', code: 'A001', designation: 'Terrassement' },
    { id: 'art-002', code: 'A002', designation: 'Fondations' },
    { id: 'art-003', code: 'A003', designation: 'Gros œuvre' },
    { id: 'art-004', code: 'A004', designation: 'Menuiseries' },
    { id: 'art-005', code: 'A005', designation: 'Plomberie' },
    { id: 'art-006', code: 'A006', designation: 'Électricité' }
  ];
  
  const unites = ['m', 'm²', 'm³', 'u', 'kg', 'tonne', 'forfait', 'jour'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFonctuateData({ ...situationData, [name]: value });
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFonctuateData({ ...situationData, [name]: value });
  };

  const handleCheckboxChange = (name: string) => (checked: boolean) => {
    setFonctuateData({ ...situationData, [name]: checked });
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numberValue = value === '' ? 0 : parseFloat(value);
    setFonctuateData({ ...situationData, [name]: numberValue });
  };

  const handleDateChange = (name: string) => (date: Date | undefined) => {
    setFonctuateData({ ...situationData, [name]: date });
  };

  // Fonction pour recalculer les montants et l'état financier
  const recalculerMontants = () => {
    // Calcul du montant HT total à partir des lignes
    const totalHT = lignes.reduce((total, ligne) => total + ligne.montantHT, 0);
    
    // Calcul du montant TTC
    const calculTVA = totalHT * (situationData.tva / 100);
    const totalTTC = totalHT + calculTVA;
    
    setFonctuateData({
      ...situationData,
      montantHT: parseFloat(totalHT.toFixed(2)),
      montantTTC: parseFloat(totalTTC.toFixed(2))
    });
  };
  
  // Fonction pour mettre à jour une valeur de ligne
  const handleLigneChange = (id: string, field: keyof LigneSituation, value: any) => {
    setLignes(prevLignes => {
      return prevLignes.map(ligne => {
        if (ligne.id === id) {
          const updatedLigne = { ...ligne, [field]: value };
          
          // Recalculs automatiques
          if (field === 'quantite' || field === 'prixUnitaire') {
            updatedLigne.montantHT = parseFloat((updatedLigne.quantite * updatedLigne.prixUnitaire).toFixed(2));
          }
          
          if (field === 'realise' || field === 'precedent') {
            updatedLigne.cumul = parseFloat((updatedLigne.precedent + updatedLigne.realise).toFixed(2));
            updatedLigne.reste = parseFloat((updatedLigne.quantite - updatedLigne.cumul).toFixed(2));
          }
          
          return updatedLigne;
        }
        return ligne;
      });
    });
    
    // Recalcul des montants totaux
    setTimeout(recalculerMontants, 100);
  };
  
  // Fonction pour ajouter une nouvelle ligne
  const ajouterLigne = () => {
    const newLigne: LigneSituation = {
      id: `ligne-${Date.now()}`,
      article: '',
      designation: '',
      unite: 'u',
      quantite: 0,
      prixUnitaire: 0,
      montantHT: 0,
      realise: 0,
      precedent: 0,
      cumul: 0,
      reste: 0
    };
    
    setLignes([...lignes, newLigne]);
  };
  
  // Fonction pour supprimer une ligne
  const supprimerLigne = (id: string) => {
    setLignes(lignes.filter(ligne => ligne.id !== id));
    
    // Recalcul des montants totaux
    setTimeout(recalculerMontants, 100);
  };
  
  // Fonction pour sélectionner un article
  const handleSelectArticle = (id: string, articleId: string) => {
    const article = articles.find(art => art.id === articleId);
    
    if (article) {
      setLignes(prevLignes => {
        return prevLignes.map(ligne => {
          if (ligne.id === id) {
            return {
              ...ligne,
              article: articleId,
              designation: article.designation
            };
          }
          return ligne;
        });
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation simple
    if (!situationData.reference || !situationData.marche || !situationData.dateSituation) {
      toast.error("Formulaire incomplet", {
        description: "Veuillez remplir tous les champs obligatoires"
      });
      return;
    }
    
    if (lignes.length === 0) {
      toast.warning("Aucune ligne de situation", {
        description: "Veuillez ajouter au moins une ligne à cette situation"
      });
      return;
    }
    
    // Simulation de l'envoi des données
    console.log('Situation soumise :', { ...situationData, lignes });
    toast.success("Situation enregistrée", {
      description: `La situation n°${situationData.numero} a été enregistrée avec succès.`
    });
  };

  // Fonction pour définir l'état des données de la situation
  const setFonctuateData = (newData: typeof situationData) => {
    setSituationData(newData);
  };

  // Fonction pour générer la facture
  const genererFacture = () => {
    if (!situationData.reference || !situationData.marche) {
      toast.error("Informations manquantes", {
        description: "Veuillez compléter les informations de la situation avant de générer une facture"
      });
      return;
    }
    
    toast.success("Facture générée", {
      description: `La facture pour la situation n°${situationData.numero} a été générée avec succès.`
    });
    
    // Générer un numéro de facture et le stocker
    const numeroFacture = `F-${Date.now().toString().substring(6)}`;
    setFonctuateData({
      ...situationData,
      facture: numeroFacture,
      status: 'facture'
    });
  };
  
  // Fonction pour exporter au format Excel
  const exporterExcel = () => {
    toast.info("Export en cours", {
      description: "Préparation du fichier Excel..."
    });
    
    // Simulation d'export
    setTimeout(() => {
      toast.success("Export réussi", {
        description: "Le fichier Excel a été téléchargé avec succès."
      });
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="text-lg font-semibold mb-4">Informations générales de la situation</div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="reference">Référence de la situation *</Label>
              <Input 
                id="reference" 
                name="reference"
                value={situationData.reference}
                onChange={handleInputChange}
                placeholder="Ex: SIT-2023-001"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="numero">Numéro de situation</Label>
              <Input 
                id="numero" 
                name="numero"
                value={situationData.numero}
                onChange={handleInputChange}
                placeholder="Ex: 1"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="marche">Marché associé *</Label>
              <Select 
                value={situationData.marche} 
                onValueChange={handleSelectChange('marche')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un marché" />
                </SelectTrigger>
                <SelectContent>
                  {marches.map(marche => (
                    <SelectItem key={marche.id} value={marche.id}>
                      {marche.titre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="titre">Titre de la situation</Label>
              <Input 
                id="titre" 
                name="titre"
                value={situationData.titre}
                onChange={handleInputChange}
                placeholder="Ex: Situation mensuelle - Janvier 2023"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateSituation">Date de la situation *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !situationData.dateSituation && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {situationData.dateSituation ? (
                      format(situationData.dateSituation, "dd MMMM yyyy", { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={situationData.dateSituation}
                    onSelect={handleDateChange('dateSituation')}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateEcheance">Date d'échéance</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !situationData.dateEcheance && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {situationData.dateEcheance ? (
                      format(situationData.dateEcheance, "dd MMMM yyyy", { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={situationData.dateEcheance}
                    onSelect={handleDateChange('dateEcheance')}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="tva">Taux de TVA (%)</Label>
              <Input 
                id="tva" 
                name="tva"
                type="number"
                value={situationData.tva}
                onChange={handleNumberInputChange}
                min="0"
                max="100"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="retenue">Retenue de garantie (%)</Label>
              <Input 
                id="retenue" 
                name="retenue"
                type="number"
                value={situationData.retenue}
                onChange={handleNumberInputChange}
                min="0"
                max="100"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select 
                value={situationData.status} 
                onValueChange={handleSelectChange('status')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                  <SelectItem value="soumis">Soumise</SelectItem>
                  <SelectItem value="valide">Validée</SelectItem>
                  <SelectItem value="facture">Facturée</SelectItem>
                  <SelectItem value="paye">Payée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isAcompte" 
                checked={situationData.isAcompte}
                onCheckedChange={handleCheckboxChange('isAcompte')}
              />
              <Label htmlFor="isAcompte">Acompte</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="estSolde" 
                checked={situationData.estSolde}
                onCheckedChange={handleCheckboxChange('estSolde')}
              />
              <Label htmlFor="estSolde">Situation de solde</Label>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-semibold">Détail de la situation</div>
            <div className="flex space-x-2">
              <Button 
                type="button"
                variant="outline" 
                onClick={exporterExcel}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exporter Excel
              </Button>
              <Button 
                type="button"
                variant="outline" 
                onClick={ajouterLigne}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Ajouter une ligne
              </Button>
            </div>
          </div>
          
          {lignes.length === 0 ? (
            <div className="flex flex-col items-center justify-center border border-dashed rounded-lg p-8 text-center text-gray-500 mb-6">
              <Calculator className="h-12 w-12 mb-3" />
              <p className="mb-1">Aucune ligne de situation</p>
              <p className="text-sm">Cliquez sur "Ajouter une ligne" pour commencer</p>
            </div>
          ) : (
            <div className="overflow-x-auto mb-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Article</TableHead>
                    <TableHead>Désignation</TableHead>
                    <TableHead className="w-[80px]">Unité</TableHead>
                    <TableHead className="w-[100px]">Quantité</TableHead>
                    <TableHead className="w-[130px]">Prix unitaire</TableHead>
                    <TableHead className="w-[130px]">Montant HT</TableHead>
                    <TableHead className="w-[100px]">Réalisé</TableHead>
                    <TableHead className="w-[100px]">Précédent</TableHead>
                    <TableHead className="w-[100px]">Cumulé</TableHead>
                    <TableHead className="w-[100px]">Reste</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lignes.map((ligne) => (
                    <TableRow key={ligne.id}>
                      <TableCell>
                        <Select 
                          value={ligne.article} 
                          onValueChange={(value) => handleSelectArticle(ligne.id, value)}
                        >
                          <SelectTrigger className="h-8 w-full">
                            <SelectValue placeholder="Article" />
                          </SelectTrigger>
                          <SelectContent>
                            {articles.map(article => (
                              <SelectItem key={article.id} value={article.id}>
                                {article.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          className="h-8"
                          value={ligne.designation}
                          onChange={(e) => handleLigneChange(ligne.id, 'designation', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={ligne.unite} 
                          onValueChange={(value) => handleLigneChange(ligne.id, 'unite', value)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {unites.map(unite => (
                              <SelectItem key={unite} value={unite}>
                                {unite}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          className="h-8"
                          type="number"
                          step="0.01"
                          value={ligne.quantite}
                          onChange={(e) => handleLigneChange(ligne.id, 'quantite', parseFloat(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          className="h-8"
                          type="number"
                          step="0.01"
                          value={ligne.prixUnitaire}
                          onChange={(e) => handleLigneChange(ligne.id, 'prixUnitaire', parseFloat(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{ligne.montantHT.toFixed(2)} €</TableCell>
                      <TableCell>
                        <Input
                          className="h-8"
                          type="number"
                          step="0.01"
                          value={ligne.realise}
                          onChange={(e) => handleLigneChange(ligne.id, 'realise', parseFloat(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          className="h-8"
                          type="number"
                          step="0.01"
                          value={ligne.precedent}
                          onChange={(e) => handleLigneChange(ligne.id, 'precedent', parseFloat(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{ligne.cumul.toFixed(2)}</TableCell>
                      <TableCell className="font-medium">{ligne.reste.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => supprimerLigne(ligne.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Ligne de total */}
                  <TableRow className="bg-muted/50">
                    <TableCell colSpan={5} className="text-right font-medium">
                      TOTAL :
                    </TableCell>
                    <TableCell className="font-bold">
                      {situationData.montantHT.toFixed(2)} €
                    </TableCell>
                    <TableCell colSpan={5}></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="space-y-2 mb-4">
                <Label htmlFor="commentaires">Commentaires</Label>
                <Textarea 
                  id="commentaires" 
                  name="commentaires"
                  value={situationData.commentaires}
                  onChange={handleInputChange}
                  placeholder="Observations ou commentaires sur cette situation..."
                  rows={4}
                />
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              <h4 className="text-base font-medium mb-4">Récapitulatif financier</h4>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Montant HT :</span>
                  <span className="font-medium">{situationData.montantHT.toFixed(2)} €</span>
                </div>
                
                <div className="flex justify-between">
                  <span>TVA ({situationData.tva}%) :</span>
                  <span>{(situationData.montantHT * situationData.tva / 100).toFixed(2)} €</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Montant TTC :</span>
                  <span className="font-medium">{situationData.montantTTC.toFixed(2)} €</span>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="flex justify-between">
                    <span>Retenue de garantie ({situationData.retenue}%) :</span>
                    <span className="font-medium">
                      {(situationData.montantTTC * situationData.retenue / 100).toFixed(2)} €
                    </span>
                  </div>
                  
                  <div className="flex justify-between mt-2">
                    <span className="font-semibold">Net à payer :</span>
                    <span className="font-bold text-lg">
                      {(situationData.montantTTC * (1 - situationData.retenue / 100)).toFixed(2)} €
                    </span>
                  </div>
                </div>
                
                {situationData.facture && (
                  <div className="mt-4 p-2 bg-blue-50 border border-blue-100 rounded flex items-start">
                    <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-700">Facture générée :</p>
                      <p className="text-sm text-blue-600">N° {situationData.facture}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          onClick={genererFacture}
          disabled={!!situationData.facture}
        >
          {situationData.facture ? "Facture déjà générée" : "Générer la facture"}
        </Button>
        
        <div className="flex space-x-3">
          <Button type="button" variant="outline">Annuler</Button>
          <Button type="submit" className="bg-agri-primary hover:bg-agri-primary-dark">
            <Save className="mr-2 h-4 w-4" />
            Enregistrer la situation
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SituationForm;
