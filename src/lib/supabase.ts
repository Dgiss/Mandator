
// Re-export the supabase client from our custom client
import { supabaseClient as supabase } from '@/lib/supabase-client';

// Export supabase client for use throughout the app
export { supabase };
export default supabase;
