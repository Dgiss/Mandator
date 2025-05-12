
-- This function allows us to execute SQL queries safely from the edge function
CREATE OR REPLACE FUNCTION public.execute_query(query_text TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  EXECUTE 'WITH query_result AS (' || query_text || ') SELECT to_jsonb(array_agg(row_to_json(query_result))) FROM query_result' INTO result;
  RETURN COALESCE(result, '[]'::JSONB);
END;
$$;

-- Grant execution permission to authenticated users
GRANT EXECUTE ON FUNCTION public.execute_query TO authenticated;
