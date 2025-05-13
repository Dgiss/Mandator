import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { CalendarIcon, Save, PlusCircle, Trash2, Calculator } from 'lucide-react';
import { createSituation } from '@/services/droits/situations';

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

interface SituationFormProps {
  marcheId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const SituationForm = ({ marcheId, onSuccess, onCancel }: SituationFormProps) => {
  const [situationData, setSituationData] = useState({
    marche_id: marcheId,
    numero: 1,
    date: new Date(),
    lot: '',
    montant_ht: 0,
    montant_ttc: 0,
    avancement: 0,
    statut: 'brouillon',
    commentaires: ''
  });
  
  const [lignes, setLignes] = useState<LigneSituation[]>([]);
  
  // Mock data for select fields
  const lots = [
    { id: 'lot-001', nom: 'Gros œuvre' },
    { id: 'lot-002', nom: 'Électricité' },
    { id: 'lot-003', nom: 'Plomberie' },
    { id: 'lot-004', nom: 'Peinture' },
    { id: 'lot-005', nom: 'Menuiseries' }
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSituationData({ ...situationData, [name]: value });
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numberValue = value === '' ? 0 : parseFloat(value);
    setSituationData({ ...situationData, [name]: numberValue });
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setSituationData({ ...situationData, [name]: value });
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSituationData({ ...situationData, date });
    }
  };
  
  // Fonction pour recalculer les montants et l'état financier
  const recalculerMontants = () => {
    // Calcul du montant HT total à partir des lignes
    const totalHT = lignes.reduce((total, ligne) => total + ligne.montantHT, 0);
    
    // Calcul du montant TTC avec TVA à 20%
    const calculTVA = totalHT * 0.2;
    const totalTTC = totalHT + calculTVA;
    
    setSituationData({
      ...situationData,
      montant_ht: parseFloat(totalHT.toFixed(2)),
      montant_ttc: parseFloat(totalTTC.toFixed(2))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation simple
    if (!situationData.lot) {
      toast.error("Formulaire incomplet", {
        description: "Veuillez sélectionner un lot"
      });
      return;
    }
    
    if (lignes.length === 0) {
      toast.warning("Aucune ligne de situation", {
        description: "Veuillez ajouter au moins une ligne à cette situation"
      });
      return;
    }
    
    try {
      // Convertir la date au format ISO string pour la base de données
      const dateString = situationData.date.toISOString().split('T')[0];
      
      // Préparation des données pour l'envoi
      const situationToSave = {
        marche_id: situationData.marche_id,
        numero: situationData.numero,
        date: dateString,
        lot: situationData.lot,
        montant_ht: situationData.montant_ht,
        montant_ttc: situationData.montant_ttc,
        avancement: situationData.avancement,
        statut: situationData.statut
      };
      
      // Envoi des données à l'API
      await createSituation(situationToSave);
      
      toast.success("Situation créée avec succès", {
        description: `La situation n°${situationData.numero} a été créée avec succès.`
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erreur lors de la création de la situation:', error);
      toast.error("Erreur de création", {
        description: "Une erreur s'est produite lors de la cr��tion de la situation."
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="text-lg font-semibold mb-4">Informations générales de la situation</div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="numero">Numéro de situation</Label>
              <Input 
                id="numero" 
                name="numero"
                type="number"
                value={situationData.numero}
                onChange={handleNumberInputChange}
                placeholder="Ex: 1"
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
                      !situationData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {situationData.date ? (
                      format(situationData.date, "dd MMMM yyyy", { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={situationData.date}
                    onSelect={handleDateChange}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lot">Lot associé *</Label>
              <Select 
                value={situationData.lot} 
                onValueChange={handleSelectChange('lot')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un lot" />
                </SelectTrigger>
                <SelectContent>
                  {lots.map(lot => (
                    <SelectItem key={lot.id} value={lot.id}>
                      {lot.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="avancement">Avancement global (%)</Label>
              <Input 
                id="avancement" 
                name="avancement"
                type="number"
                min="0"
                max="100"
                value={situationData.avancement}
                onChange={handleNumberInputChange}
                placeholder="Ex: 30"
              />
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-semibold">Détail de la situation</div>
            <Button 
              type="button"
              variant="outline" 
              onClick={ajouterLigne}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Ajouter une ligne
            </Button>
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
                      {situationData.montant_ht.toFixed(2)} €
                    </TableCell>
                    <TableCell colSpan={5}></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div></div>
            <div className="border rounded-md p-4">
              <h4 className="text-base font-medium mb-4">Récapitulatif financier</h4>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Montant HT :</span>
                  <span className="font-medium">{situationData.montant_ht.toFixed(2)} €</span>
                </div>
                
                <div className="flex justify-between">
                  <span>TVA (20%) :</span>
                  <span>{(situationData.montant_ht * 0.2).toFixed(2)} €</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Montant TTC :</span>
                  <span className="font-medium">{situationData.montant_ttc.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button type="submit" className="bg-agri-primary hover:bg-agri-primary-dark">
          <Save className="mr-2 h-4 w-4" />
          Enregistrer la situation
        </Button>
      </div>
    </form>
  );
};

export default SituationForm;
