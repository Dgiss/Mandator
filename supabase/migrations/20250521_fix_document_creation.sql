
-- Create a secure function to safely create or update documents
-- This avoids infinite recursion issues with RLS policies
CREATE OR REPLACE FUNCTION public.create_or_update_document_safely(
  p_id UUID DEFAULT NULL,  -- NULL for new document, document ID for update
  p_nom TEXT,
  p_description TEXT,
  p_type TEXT,
  p_statut TEXT DEFAULT 'En attente de diffusion',
  p_version TEXT DEFAULT 'A',
  p_marche_id UUID,
  p_fascicule_id UUID DEFAULT NULL,
  p_file_path TEXT DEFAULT NULL,
  p_taille TEXT DEFAULT '0 KB',
  p_designation TEXT DEFAULT NULL,
  p_geographie TEXT DEFAULT NULL,
  p_phase TEXT DEFAULT NULL,
  p_numero_operation TEXT DEFAULT NULL,
  p_domaine_technique TEXT DEFAULT NULL,
  p_numero TEXT DEFAULT NULL,
  p_emetteur TEXT DEFAULT NULL,
  p_date_diffusion TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_date_bpe TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  doc_id UUID;
BEGIN
  -- Check if user has access to the market
  IF NOT public.check_market_access(p_marche_id) THEN
    RAISE EXCEPTION 'Access denied to this market';
  END IF;
  
  -- If p_id is provided, update existing document
  IF p_id IS NOT NULL THEN
    UPDATE public.documents
    SET 
      nom = p_nom,
      description = p_description,
      type = p_type,
      statut = p_statut,
      version = p_version,
      marche_id = p_marche_id,
      fascicule_id = p_fascicule_id,
      file_path = COALESCE(p_file_path, file_path),
      taille = COALESCE(p_taille, taille),
      designation = p_designation,
      geographie = p_geographie,
      phase = p_phase,
      numero_operation = p_numero_operation,
      domaine_technique = p_domaine_technique,
      numero = p_numero,
      emetteur = p_emetteur,
      date_diffusion = p_date_diffusion,
      date_bpe = p_date_bpe,
      dateupload = CURRENT_TIMESTAMP
    WHERE id = p_id
    RETURNING id INTO doc_id;
  ELSE
    -- Insert new document
    INSERT INTO public.documents (
      nom, 
      description, 
      type, 
      statut, 
      version,
      marche_id,
      fascicule_id,
      file_path,
      taille,
      dateupload,
      designation,
      geographie,
      phase,
      numero_operation,
      domaine_technique,
      numero,
      emetteur,
      date_diffusion,
      date_bpe
    )
    VALUES (
      p_nom,
      p_description,
      p_type,
      p_statut,
      p_version,
      p_marche_id,
      p_fascicule_id,
      p_file_path,
      p_taille,
      CURRENT_TIMESTAMP,
      p_designation,
      p_geographie,
      p_phase,
      p_numero_operation,
      p_domaine_technique,
      p_numero,
      p_emetteur,
      p_date_diffusion,
      p_date_bpe
    )
    RETURNING id INTO doc_id;
  END IF;
  
  -- Update the fascicule's document count if a fascicule_id was provided
  IF p_fascicule_id IS NOT NULL THEN
    UPDATE fascicules
    SET nombredocuments = (
      SELECT COUNT(*) 
      FROM documents 
      WHERE fascicule_id = p_fascicule_id
    ),
    datemaj = CURRENT_TIMESTAMP
    WHERE id = p_fascicule_id;
  END IF;
  
  RETURN doc_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_or_update_document_safely TO authenticated;

-- Create a secure function to fetch markets a user has access to
CREATE OR REPLACE FUNCTION public.get_accessible_marches_for_select()
RETURNS TABLE(id UUID, titre TEXT) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Check if user is admin
  SELECT role_global INTO user_role FROM profiles WHERE id = auth.uid();
  
  IF user_role = 'ADMIN' THEN
    RETURN QUERY 
      SELECT m.id, m.titre 
      FROM marches m
      ORDER BY m.titre;
  ELSE
    -- Return markets where user has access
    RETURN QUERY 
      SELECT m.id, m.titre 
      FROM marches m
      WHERE m.user_id = auth.uid()
      
      UNION
      
      SELECT m.id, m.titre 
      FROM marches m
      JOIN droits_marche dm ON m.id = dm.marche_id
      WHERE dm.user_id = auth.uid()
      
      ORDER BY titre;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_accessible_marches_for_select TO authenticated;
