
-- Fix for the recursion issues in RLS policies

-- First, ensure that the RPC function is correctly defined
CREATE OR REPLACE FUNCTION public.get_accessible_marches()
 RETURNS SETOF marches
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  user_role TEXT;
BEGIN
  -- Get the user's global role
  SELECT role_global INTO user_role FROM profiles WHERE id = current_user_id;
  
  -- If the user is admin, return all markets
  IF user_role = 'ADMIN' THEN
    RETURN QUERY SELECT * FROM marches ORDER BY datecreation DESC;
  ELSE
    -- Return markets where user is creator or has explicit rights
    RETURN QUERY 
      SELECT * FROM marches WHERE user_id = current_user_id
      UNION
      SELECT m.* FROM marches m
      JOIN droits_marche dm ON m.id = dm.marche_id
      WHERE dm.user_id = current_user_id
      ORDER BY datecreation DESC;
  END IF;
END;
$$;

-- Grant execute permissions for the function
GRANT EXECUTE ON FUNCTION public.get_accessible_marches() TO authenticated;

-- Ensure the get_documents_for_marche function is correctly defined
CREATE OR REPLACE FUNCTION public.get_documents_for_marche(marche_id_param uuid)
 RETURNS SETOF documents
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user has access to this market using non-recursive functions
  IF public.is_admin() OR public.is_market_creator(marche_id_param) OR public.has_market_rights(marche_id_param) THEN
    RETURN QUERY 
      SELECT * FROM documents 
      WHERE marche_id = marche_id_param
      ORDER BY nom ASC;
  END IF;
  
  -- Return empty set if no access
  RETURN;
END;
$$;

-- Grant execute permissions for the documents function
GRANT EXECUTE ON FUNCTION public.get_documents_for_marche(uuid) TO authenticated;

-- Ensure the get_fascicules_for_marche function is correctly defined
CREATE OR REPLACE FUNCTION public.get_fascicules_for_marche(marche_id_param uuid)
 RETURNS SETOF fascicules
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user has access to this market using non-recursive functions
  IF public.is_admin() OR public.is_market_creator(marche_id_param) OR public.has_market_rights(marche_id_param) THEN
    RETURN QUERY 
      SELECT * FROM fascicules 
      WHERE marche_id = marche_id_param
      ORDER BY nom ASC;
  END IF;
  
  -- Return empty set if no access
  RETURN;
END;
$$;

-- Grant execute permissions for the fascicules function
GRANT EXECUTE ON FUNCTION public.get_fascicules_for_marche(uuid) TO authenticated;
