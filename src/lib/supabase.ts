
// Re-export the supabase client from our custom client
import { supabaseClient } from './supabase-client';

// Export supabase client for use throughout the app
export const supabase = supabaseClient;
export default supabase;
