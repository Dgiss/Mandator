
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import ImageUpload from './ImageUpload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Plus, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormSection } from '@/components/ui/form-section';
import { EnhancedForm, useFormOperations } from '@/components/ui/enhanced-form';
import { FormPreview } from '@/components/ui/form-preview';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioItem } from '@/components/ui/radio-group';

interface MarcheCreationFormProps {
  values: {
    titre: string;
    client: string;
    budget: string;
    devise: string;
    typeMarche: string;
    description: string;
    hasAttachments: boolean;
    isPublic: boolean;
    datecreation: Date | undefined;
    dateDebut: Date | undefined;
    dateFin: Date | undefined;
    statut: string;
    adresse: string;
    ville: string;
    codePostal: string;
    pays: string;
    region: string;
  };
  errors: Record<string, string>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSubmit: (onSubmit: (data: any) => Promise<void>) => (e?: React.FormEvent) => Promise<void>;
  setFieldValue: (field: string, value: any) => void;
  isSubmitting: boolean;
  submitting: boolean;
  coverImageUrl: string | null;
  logoUrl: string | null;
  handleCoverImageChange: (file: File | null) => void;
  handleLogoChange: (file: File | null) => void;
  onSubmit: (data: any) => Promise<void>;
}

const MarcheCreationForm: React.FC<MarcheCreationFormProps> = ({
  values,
  errors,
  handleChange,
  handleSubmit,
  setFieldValue,
  isSubmitting,
  submitting,
  coverImageUrl,
  logoUrl,
  handleCoverImageChange,
  handleLogoChange,
  onSubmit
}) => {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<{ id: string, name: string, role: string }[]>([]);
  const [userDialogOpen, setUserDialogOpen] = useState(false);

  // Sample users for demonstration
  const availableUsers = [
    { id: 'user1', name: 'Jean Dupont', avatar: 'JD', company: 'BTP Construction' },
    { id: 'user2', name: 'Marie Lambert', avatar: 'ML', company: 'Architectes Associés' },
    { id: 'user3', name: 'Thomas Mercier', avatar: 'TM', company: 'Bureau d\'études' },
    { id: 'user4', name: 'Sophie Martin', avatar: 'SM', company: 'Direction des travaux' },
    { id: 'user5', name: 'Pierre Durand', avatar: 'PD', company: 'Consultant BTP' }
  ];

  const statuts = ["En attente", "En cours", "Terminé"];
  const devises = ["€", "$", "£", "CHF", "CAD"];
  const typeMarche = ["Public", "Privé", "Mixte"];
  const userRoles = ["MOE", "ENTREPRISE", "MANDATAIRE", "CONTROLEUR", "CONSULTANT"];

  const addUser = (userId: string, role: string) => {
    const user = availableUsers.find(u => u.id === userId);
    if (user && !selectedUsers.some(u => u.id === userId)) {
      setSelectedUsers([...selectedUsers, { id: userId, name: user.name, role }]);
    }
  };

  const removeUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
  };

  const isFormValid = () => {
    return Object.keys(errors).length === 0;
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {showPreview ? (
          <FormPreview
            title="Aperçu du marché"
            data={{
              ...values,
              utilisateurs: selectedUsers.length > 0 ? `${selectedUsers.length} utilisateurs` : "Aucun"
            }}
            isValid={isFormValid()}
            onEdit={() => setShowPreview(false)}
          />
        ) : (
          <>
            {/* Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUpload
                id="coverImage"
                label="Image de couverture"
                description="Une image représentative du marché"
                imageUrl={coverImageUrl}
                onImageChange={handleCoverImageChange}
                aspectRatio="wide"
                maxSize="5MB"
              />

              <ImageUpload
                id="logo"
                label="Logo du marché"
                description="Logo du client ou du projet"
                imageUrl={logoUrl}
                onImageChange={handleLogoChange}
                aspectRatio="square"
                maxSize="2MB"
              />
            </div>

            {/* Informations générales */}
            <FormSection
              title="Informations générales"
              description="Détails principaux du marché"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="titre" className="text-sm font-medium">
                    Titre du marché*
                  </Label>
                  <Input
                    id="titre"
                    name="titre"
                    value={values.titre}
                    onChange={handleChange}
                    placeholder="Ex: Construction d'une école primaire"
                    className={errors.titre ? "border-red-500" : ""}
                  />
                  {errors.titre && <p className="text-sm text-red-500">{errors.titre}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client" className="text-sm font-medium">
                    Client*
                  </Label>
                  <Input
                    id="client"
                    name="client"
                    value={values.client}
                    onChange={handleChange}
                    placeholder="Ex: Mairie de Lyon"
                    className={errors.client ? "border-red-500" : ""}
                  />
                  {errors.client && <p className="text-sm text-red-500">{errors.client}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="typeMarche" className="text-sm font-medium">
                    Type de marché*
                  </Label>
                  <Select
                    value={values.typeMarche || "Public"}
                    onValueChange={(value) => setFieldValue("typeMarche", value)}
                  >
                    <SelectTrigger id="typeMarche">
                      <SelectValue placeholder="Sélectionner un type de marché" />
                    </SelectTrigger>
                    <SelectContent>
                      {typeMarche.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="statut" className="text-sm font-medium">
                    Statut
                  </Label>
                  <Select
                    value={values.statut}
                    onValueChange={(value) => setFieldValue('statut', value)}
                  >
                    <SelectTrigger id="statut">
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuts.map((statut) => (
                        <SelectItem key={statut} value={statut}>
                          {statut}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-4">
                  <div className="space-y-2 flex-grow">
                    <Label htmlFor="budget" className="text-sm font-medium">
                      Budget*
                    </Label>
                    <Input
                      id="budget"
                      name="budget"
                      type="number"
                      value={values.budget}
                      onChange={handleChange}
                      placeholder="Ex: 250000"
                      className={errors.budget ? "border-red-500" : ""}
                    />
                    {errors.budget && <p className="text-sm text-red-500">{errors.budget}</p>}
                  </div>

                  <div className="space-y-2 w-24">
                    <Label htmlFor="devise" className="text-sm font-medium">
                      Devise
                    </Label>
                    <Select
                      value={values.devise || "€"}
                      onValueChange={(value) => setFieldValue("devise", value)}
                    >
                      <SelectTrigger id="devise">
                        <SelectValue placeholder="€" />
                      </SelectTrigger>
                      <SelectContent>
                        {devises.map((devise) => (
                          <SelectItem key={devise} value={devise}>
                            {devise}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mt-6">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description du marché*
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={values.description}
                  onChange={handleChange}
                  placeholder="Description détaillée du marché public..."
                  rows={5}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>
            </FormSection>

            {/* Dates clés */}
            <FormSection title="Dates clés" description="Planification temporelle du marché">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="datecreation" className="text-sm font-medium">
                    Date de création
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !values.datecreation && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {values.datecreation ? (
                          format(values.datecreation, 'P', { locale: fr })
                        ) : (
                          <span>Sélectionner une date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={values.datecreation}
                        onSelect={(date) => setFieldValue('datecreation', date)}
                        initialFocus
                        locale={fr}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateDebut" className="text-sm font-medium">
                    Date de début
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !values.dateDebut && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {values.dateDebut ? (
                          format(values.dateDebut, 'P', { locale: fr })
                        ) : (
                          <span>Sélectionner une date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={values.dateDebut}
                        onSelect={(date) => setFieldValue('dateDebut', date)}
                        initialFocus
                        locale={fr}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFin" className="text-sm font-medium">
                    Date de fin prévisionnelle
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !values.dateFin && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {values.dateFin ? (
                          format(values.dateFin, 'P', { locale: fr })
                        ) : (
                          <span>Sélectionner une date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={values.dateFin}
                        onSelect={(date) => setFieldValue('dateFin', date)}
                        initialFocus
                        locale={fr}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </FormSection>

            {/* Localisation */}
            <FormSection title="Localisation" description="Adresse et localisation du projet">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="adresse" className="text-sm font-medium">
                    Adresse
                  </Label>
                  <Input
                    id="adresse"
                    name="adresse"
                    value={values.adresse || ""}
                    onChange={handleChange}
                    placeholder="Ex: 123 rue de la République"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ville" className="text-sm font-medium">
                    Ville
                  </Label>
                  <Input
                    id="ville"
                    name="ville"
                    value={values.ville || ""}
                    onChange={handleChange}
                    placeholder="Ex: Lyon"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="codePostal" className="text-sm font-medium">
                    Code postal
                  </Label>
                  <Input
                    id="codePostal"
                    name="codePostal"
                    value={values.codePostal || ""}
                    onChange={handleChange}
                    placeholder="Ex: 69000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region" className="text-sm font-medium">
                    Région
                  </Label>
                  <Input
                    id="region"
                    name="region"
                    value={values.region || ""}
                    onChange={handleChange}
                    placeholder="Ex: Auvergne-Rhône-Alpes"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pays" className="text-sm font-medium">
                    Pays
                  </Label>
                  <Input
                    id="pays"
                    name="pays"
                    value={values.pays || "France"}
                    onChange={handleChange}
                    placeholder="Ex: France"
                  />
                </div>
              </div>
            </FormSection>

            {/* Utilisateurs et Rôles */}
            <FormSection title="Utilisateurs et Rôles" description="Gestion des accès au marché">
              <div className="space-y-4">
                {selectedUsers.length > 0 && (
                  <div className="rounded-lg border divide-y">
                    {selectedUsers.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.role}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => removeUser(user.id)}>
                          Retirer
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Ajouter un utilisateur
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter un utilisateur au marché</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      <div className="space-y-4">
                        <Label>Sélectionner un utilisateur</Label>
                        <div className="grid gap-3 max-h-[250px] overflow-y-auto">
                          {availableUsers.map(user => (
                            <div
                              key={user.id}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-md border",
                                selectedUsers.some(u => u.id === user.id) && "bg-muted"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback>{user.avatar}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">{user.name}</p>
                                  <p className="text-xs text-muted-foreground">{user.company}</p>
                                </div>
                              </div>
                              {!selectedUsers.some(u => u.id === user.id) ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => {
                                    addUser(user.id, 'STANDARD');
                                  }}
                                >
                                  Ajouter
                                </Button>
                              ) : (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => removeUser(user.id)}
                                >
                                  Retirer
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {selectedUsers.length > 0 && (
                        <div className="space-y-3">
                          <Label>Définir les rôles</Label>
                          {selectedUsers.map(user => (
                            <div key={user.id} className="flex items-center justify-between border-b pb-3">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{user.name}</span>
                              </div>
                              <Select
                                value={user.role}
                                onValueChange={(value) => {
                                  setSelectedUsers(selectedUsers.map(u => 
                                    u.id === user.id ? { ...u, role: value } : u
                                  ));
                                }}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue placeholder="Rôle" />
                                </SelectTrigger>
                                <SelectContent>
                                  {userRoles.map(role => (
                                    <SelectItem key={role} value={role}>
                                      {role}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <Button type="button" onClick={() => setUserDialogOpen(false)}>
                        Fermer
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </FormSection>

            {/* Options supplémentaires */}
            <FormSection title="Options supplémentaires">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasAttachments"
                    checked={values.hasAttachments}
                    onCheckedChange={(checked) => setFieldValue('hasAttachments', checked)}
                  />
                  <label
                    htmlFor="hasAttachments"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Ce marché comporte des pièces jointes
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPublic"
                    checked={values.isPublic}
                    onCheckedChange={(checked) => setFieldValue('isPublic', checked)}
                  />
                  <label
                    htmlFor="isPublic"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Marché public accessible à tous
                  </label>
                </div>
              </div>
            </FormSection>
          </>
        )}

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? "Modifier le formulaire" : "Aperçu avant soumission"}
          </Button>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => navigate('/marches')}>
              Annuler
            </Button>
            <Button
              type="submit"
              variant="btpPrimary"
              disabled={isSubmitting || submitting}
            >
              {isSubmitting || submitting ? "Enregistrement..." : "Créer le marché"}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
};

export default MarcheCreationForm;
