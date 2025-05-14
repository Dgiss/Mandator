
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Initialize the Supabase client with proper typing
export const supabaseClient = createClient<Database>(
  'https://mfqyisynsaxcffawttlp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mcXlpc3luc2F4Y2ZmYXd0dGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NTQ5MDMsImV4cCI6MjA2MjIzMDkwM30.dqc976amch1YOJVoDBPjYb_wELToNL1T-G6Ikc_rDj0'
);
