
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const SUPABASE_URL = "https://mfqyisynsaxcffawttlp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mcXlpc3luc2F4Y2ZmYXd0dGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NTQ5MDMsImV4cCI6MjA2MjIzMDkwM30.dqc976amch1YOJVoDBPjYb_wELToNL1T-G6Ikc_rDj0";

// Configuration optimisée du client Supabase avec prévention des problèmes de tokens JWT
export const supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'  // Utilisation de PKCE pour une meilleure sécurité
  },
  global: {
    headers: {
      'x-client-info': 'supabase-js-web/2.49.4'
    }
  },
  realtime: {
    timeout: 30000, // Augmenter le timeout pour éviter les déconnexions
  }
});
