
-- This migration fixes infinite recursion detected in policies for marches and droits_marche tables

-- First, drop problematic policies
DO $$ 
BEGIN
  -- Drop existing recursive policies if they exist
  BEGIN
    DROP POLICY IF EXISTS "Enable read for users with access" ON public.marches;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Policy not found or error dropping marches policy';
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Users can view droits for markets they have access to" ON public.droits_marche;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Policy not found or error dropping droits_marche policy';
  END;
END $$;

-- Create optimized RPC function to fetch markets safely
CREATE OR REPLACE FUNCTION public.get_user_accessible_markets()
RETURNS SETOF public.marches
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

-- Create better policies that don't cause recursion
-- For marches table
CREATE POLICY "Users can read markets they created" 
ON public.marches
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- For droits_marche table
CREATE POLICY "Users can view their own rights" 
ON public.droits_marche
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can view all markets
CREATE POLICY "Admins can view all markets" 
ON public.marches
FOR SELECT
TO authenticated
USING ((SELECT role_global FROM public.profiles WHERE id = auth.uid()) = 'ADMIN');

-- Grant execute permissions for the new function
GRANT EXECUTE ON FUNCTION public.get_user_accessible_markets() TO authenticated;
