
-- Fonction RPC pour créer un marché tout en évitant les problèmes de RLS
CREATE OR REPLACE FUNCTION public.create_new_marche(marche_data JSONB)
RETURNS public.marches
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_marche public.marches;
  current_user_id UUID;
BEGIN
  -- Récupérer l'ID de l'utilisateur actuel
  current_user_id := auth.uid();
  
  -- Si aucun utilisateur n'est connecté, lever une exception
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non connecté';
  END IF;
  
  -- Insérer le marché dans la base de données avec l'ID de l'utilisateur actuel
  INSERT INTO public.marches (
    titre,
    description,
    client,
    statut,
    budget,
    image,
    logo,
    user_id,
    datecreation,
    type_marche,
    adresse,
    ville,
    code_postal,
    pays,
    region,
    date_debut,
    date_fin,
    date_notification,
    periode_preparation,
    periode_chantier,
    date_fin_gpa,
    commentaire
  )
  VALUES (
    marche_data->>'titre',
    marche_data->>'description',
    marche_data->>'client',
    COALESCE(marche_data->>'statut', 'En attente'),
    marche_data->>'budget',
    marche_data->>'image',
    marche_data->>'logo',
    COALESCE(marche_data->>'user_id', current_user_id::text)::uuid,
    COALESCE((marche_data->>'datecreation')::timestamp with time zone, now()),
    marche_data->>'type_marche',
    marche_data->>'adresse',
    marche_data->>'ville',
    marche_data->>'code_postal',
    marche_data->>'pays',
    marche_data->>'region',
    (marche_data->>'date_debut')::timestamp with time zone,
    (marche_data->>'date_fin')::timestamp with time zone,
    (marche_data->>'date_notification')::timestamp with time zone,
    marche_data->>'periode_preparation',
    marche_data->>'periode_chantier',
    (marche_data->>'date_fin_gpa')::timestamp with time zone,
    marche_data->>'commentaire'
  )
  RETURNING * INTO new_marche;
  
  -- Attribuer automatiquement le rôle MOE au créateur
  INSERT INTO public.droits_marche (marche_id, user_id, role_specifique)
  VALUES (new_marche.id, COALESCE((marche_data->>'user_id')::uuid, current_user_id), 'MOE');
  
  RETURN new_marche;
END;
$$;

-- Créer une politique RLS qui permet aux utilisateurs de créer des marchés
CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users" 
ON public.marches 
FOR INSERT
TO authenticated 
WITH CHECK (true);

-- Créer une politique RLS qui permet aux utilisateurs de visualiser les marchés auxquels ils ont accès
CREATE POLICY IF NOT EXISTS "Enable read for users with access" 
ON public.marches 
FOR SELECT
TO authenticated 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1
    FROM public.droits_marche
    WHERE droits_marche.marche_id = id AND droits_marche.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role_global = 'ADMIN'
  )
);

-- Ajouter un trigger pour vérifier les droits d'accès
CREATE OR REPLACE FUNCTION public.check_user_marche_access(user_id uuid, marche_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the user is an admin
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role_global = 'ADMIN'
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if the user is the creator of the marché
  IF EXISTS (
    SELECT 1 FROM public.marches
    WHERE id = marche_id AND user_id = check_user_marche_access.user_id
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if the user has specific rights to the market
  RETURN EXISTS (
    SELECT 1 FROM public.droits_marche
    WHERE droits_marche.user_id = check_user_marche_access.user_id 
    AND droits_marche.marche_id = check_user_marche_access.marche_id
  );
END;
$$;
