
-- Create a fix for the infinite recursion detected in RLS policies

-- Drop any problematic policies
DROP POLICY IF EXISTS "Users can view droits for markets they have access to" ON public.droits_marche;
DROP POLICY IF EXISTS "Enable read for users with access" ON public.marches;

-- Create simple, non-recursive policies for droits_marche
CREATE POLICY "Users can view their own rights directly" 
ON public.droits_marche
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all rights based on profile" 
ON public.droits_marche
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role_global = 'ADMIN'
  )
);

CREATE POLICY "Market creators can view market rights" 
ON public.droits_marche
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.marches
    WHERE id = marche_id AND user_id = auth.uid()
  )
);

-- Create simple, non-recursive policies for marches
CREATE POLICY "Users can view markets they created" 
ON public.marches
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all markets" 
ON public.marches
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role_global = 'ADMIN'
  )
);

-- Create a secure function to check if a user has access to a market
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

-- Grant execution permission
GRANT EXECUTE ON FUNCTION public.get_accessible_marches() TO authenticated;
