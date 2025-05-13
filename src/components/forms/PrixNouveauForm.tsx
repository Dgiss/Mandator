
import React, { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Save } from 'lucide-react';
import { createPrixNouveau } from '@/services/droits/prixNouveaux';

interface PrixNouveauFormProps {
  marcheId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PrixNouveauForm = ({ marcheId, onSuccess, onCancel }: PrixNouveauFormProps) => {
  const [formData, setFormData] = useState({
    marche_id: marcheId,
    reference: '',
    designation: '',
    unite: 'u',
    quantite: 1,
    prix_unitaire: 0,
    justification: '',
    materiaux_montant: 0,
    main_oeuvre_montant: 0,
    materiel_montant: 0,
    frais_generaux: 10, // Pourcentage par défaut
    benefice: 5, // Pourcentage par défaut
    statut: 'brouillon'
  });

  const unites = ['m', 'm²', 'm³', 'u', 'kg', 'tonne', 'forfait', 'jour'];
  
  const statuts = [
    { value: 'brouillon', label: 'Brouillon' },
    { value: 'propose', label: 'Proposé' },
    { value: 'enattente', label: 'En attente de validation' },
    { value: 'valide', label: 'Validé' },
    { value: 'refuse', label: 'Refusé' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updatedData = { ...prev, [name]: value };
      if (['materiaux_montant', 'main_oeuvre_montant', 'materiel_montant', 'frais_generaux', 'benefice'].includes(name)) {
        return calculatePrixUnitaire(updatedData);
      }
      return updatedData;
    });
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numberValue = value === '' ? 0 : parseFloat(value);
    
    setFormData(prev => {
      const updatedData = { ...prev, [name]: numberValue };
      if (['materiaux_montant', 'main_oeuvre_montant', 'materiel_montant', 'frais_generaux', 'benefice'].includes(name)) {
        return calculatePrixUnitaire(updatedData);
      }
      return updatedData;
    });
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  // Calcule le prix unitaire en fonction des coûts et des marges
  const calculatePrixUnitaire = (data: typeof formData) => {
    const coutHorsDroits = data.materiaux_montant + data.main_oeuvre_montant + data.materiel_montant;
    const fraisGeneraux = coutHorsDroits * (data.frais_generaux / 100);
    const benefice = coutHorsDroits * (data.benefice / 100);
    
    const prixUnitaire = coutHorsDroits + fraisGeneraux + benefice;
    
    return {
      ...data,
      prix_unitaire: parseFloat(prixUnitaire.toFixed(2))
    };
  };

  const generateReference = () => {
    const today = new Date();
    const refNumber = Math.floor(Math.random() * 900) + 100; // 3 chiffres aléatoires
    const reference = `PN-${today.getFullYear()}-${refNumber}`;
    setFormData({ ...formData, reference });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reference || !formData.designation || !formData.justification) {
      toast.error("Formulaire incomplet", {
        description: "Veuillez remplir tous les champs obligatoires"
      });
      return;
    }
    
    try {
      await createPrixNouveau(formData);
      
      toast.success("Prix nouveau créé", {
        description: `Le prix nouveau ${formData.reference} a été créé avec succès.`
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erreur lors de la création du prix nouveau:', error);
      toast.error("Erreur de création", {
        description: "Une erreur s'est produite lors de la création du prix nouveau."
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="text-lg font-semibold mb-4">Informations générales</div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="reference">Référence *</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={generateReference} 
                  className="h-8 text-xs"
                >
                  Générer
                </Button>
              </div>
              <Input 
                id="reference" 
                name="reference"
                value={formData.reference}
                onChange={handleInputChange}
                placeholder="Ex: PN-2023-001"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="statut">Statut</Label>
              <Select 
                value={formData.statut} 
                onValueChange={handleSelectChange('statut')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un statut" />
                </SelectTrigger>
                <SelectContent>
                  {statuts.map(statut => (
                    <SelectItem key={statut.value} value={statut.value}>
                      {statut.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="designation">Désignation *</Label>
              <Input 
                id="designation" 
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                placeholder="Ex: Fourniture et pose de carrelage spécial antidérapant"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unite">Unité</Label>
              <Select 
                value={formData.unite} 
                onValueChange={handleSelectChange('unite')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une unité" />
                </SelectTrigger>
                <SelectContent>
                  {unites.map(unite => (
                    <SelectItem key={unite} value={unite}>
                      {unite}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantite">Quantité</Label>
              <Input 
                id="quantite" 
                name="quantite"
                type="number"
                step="0.01"
                min="0"
                value={formData.quantite}
                onChange={handleNumberInputChange}
                placeholder="Ex: 10"
              />
            </div>
          </div>
          
          <div className="space-y-2 mb-6">
            <Label htmlFor="justification">Justification *</Label>
            <Textarea 
              id="justification" 
              name="justification"
              value={formData.justification}
              onChange={handleInputChange}
              placeholder="Expliquez pourquoi ce prix nouveau est nécessaire..."
              rows={4}
              required
            />
          </div>
          
          <Separator className="my-6" />
          
          <div className="text-lg font-semibold mb-4">Décomposition du prix</div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="materiaux_montant">Matériaux (€)</Label>
              <Input 
                id="materiaux_montant" 
                name="materiaux_montant"
                type="number"
                step="0.01"
                min="0"
                value={formData.materiaux_montant}
                onChange={handleNumberInputChange}
                placeholder="Ex: 100"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="main_oeuvre_montant">Main d'œuvre (€)</Label>
              <Input 
                id="main_oeuvre_montant" 
                name="main_oeuvre_montant"
                type="number"
                step="0.01"
                min="0"
                value={formData.main_oeuvre_montant}
                onChange={handleNumberInputChange}
                placeholder="Ex: 50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="materiel_montant">Matériel (€)</Label>
              <Input 
                id="materiel_montant" 
                name="materiel_montant"
                type="number"
                step="0.01"
                min="0"
                value={formData.materiel_montant}
                onChange={handleNumberInputChange}
                placeholder="Ex: 25"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="frais_generaux">Frais généraux (%)</Label>
              <Input 
                id="frais_generaux" 
                name="frais_generaux"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.frais_generaux}
                onChange={handleNumberInputChange}
                placeholder="Ex: 10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="benefice">Bénéfice (%)</Label>
              <Input 
                id="benefice" 
                name="benefice"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.benefice}
                onChange={handleNumberInputChange}
                placeholder="Ex: 5"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prix_unitaire">Prix unitaire (€) - calculé</Label>
              <Input 
                id="prix_unitaire" 
                name="prix_unitaire"
                type="number"
                step="0.01"
                min="0"
                value={formData.prix_unitaire}
                onChange={handleNumberInputChange}
                className="font-bold"
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center p-4 bg-muted/50 rounded-md">
            <div className="text-lg font-medium">Montant total HT:</div>
            <div className="text-xl font-bold">
              {(formData.prix_unitaire * formData.quantite).toFixed(2)} €
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
          Enregistrer le prix nouveau
        </Button>
      </div>
    </form>
  );
};

export default PrixNouveauForm;
