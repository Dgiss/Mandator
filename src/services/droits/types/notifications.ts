
import { Database } from '@/types/supabase';

// Define the Notification type based on the database schema
export type Notification = {
  id: string;
  type: string;
  user_id: string;
  created_at: string;
  marche_id: string;
  objet_id: string;
  lue: boolean;
  titre: string;
  message: string;
  objet_type: string;
};
