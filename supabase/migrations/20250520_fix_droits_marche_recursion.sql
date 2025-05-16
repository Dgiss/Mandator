
-- Create a secure function to fetch fascicules for a specific market
-- This avoids infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.get_fascicules_for_marche(marche_id_param UUID)
RETURNS SETOF public.fascicules
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Vérifier si l'utilisateur a accès à ce marché
  IF NOT check_market_access(marche_id_param) THEN
    RETURN;
  END IF;
  
  -- Retourner tous les fascicules pour ce marché
  RETURN QUERY 
    SELECT * FROM fascicules 
    WHERE marche_id = marche_id_param
    ORDER BY nom ASC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_fascicules_for_marche(UUID) TO authenticated;

-- Fix the droits_marche access policy to avoid recursion
DO $$ 
BEGIN
  -- Drop existing recursive policies if they exist
  BEGIN
    DROP POLICY IF EXISTS "Users can view their own droits" ON public.droits_marche;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'No policy to drop or error dropping policy';
  END;
  
  -- Create a new policy that doesn't cause recursion
  CREATE POLICY "Users can view droits for markets they have access to" 
  ON public.droits_marche
  FOR SELECT
  TO authenticated
  USING (
    check_market_access(marche_id) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role_global = 'ADMIN'
    )
  );
END $$;
