
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const SUPABASE_URL = "https://mfqyisynsaxcffawttlp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mcXlpc3luc2F4Y2ZmYXd0dGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NTQ5MDMsImV4cCI6MjA2MjIzMDkwM30.dqc976amch1YOJVoDBPjYb_wELToNL1T-G6Ikc_rDj0";

// Create a single instance of the supabase client with improved configuration
export const supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storageKey: 'mandator_auth_token',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    },
    // Add fetch options with longer timeout
    fetch: (url, options) => {
      return fetch(url, {
        ...options,
        // High timeout to avoid connection issues
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });
    }
  }
});
