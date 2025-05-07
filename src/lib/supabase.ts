
// Re-export the supabase client from the integrations folder
import { supabase } from '@/integrations/supabase/client';

// Export supabase client for use throughout the app
export { supabase };
export default supabase;
