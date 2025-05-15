
-- Create an optimized market access check function that doesn't cause recursion
CREATE OR REPLACE FUNCTION public.check_market_access(market_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin (bypass RLS)
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role_global = 'ADMIN'
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user is creator of the market
  IF EXISTS (
    SELECT 1 FROM public.marches
    WHERE id = market_id AND user_id = auth.uid()
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user has explicit rights
  RETURN EXISTS (
    SELECT 1 FROM public.droits_marche
    WHERE marche_id = market_id AND user_id = auth.uid()
  );
END;
$$;

-- Ensure this function can be called by authenticated users
GRANT EXECUTE ON FUNCTION public.check_market_access(UUID) TO authenticated;

-- Update any problematic RLS policies
DO $$ 
BEGIN
  -- Drop and recreate potentially recursive policies on marches
  BEGIN
    DROP POLICY IF EXISTS "Enable read for users with access" ON public.marches;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Policy did not exist or could not be dropped';
  END;

  -- Create a clean policy using our security definer function
  CREATE POLICY "Enable read for users with access" 
  ON public.marches 
  FOR SELECT
  TO authenticated 
  USING (
    public.check_market_access(id) 
  );
END $$;
