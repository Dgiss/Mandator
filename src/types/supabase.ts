
import { Database as SupabaseDatabase } from '@/integrations/supabase/types';

// Extend the Supabase types with our custom database schema
export interface Database extends SupabaseDatabase {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string;
          nom: string;
          type: string;
          statut: string;
          version: string;
          description: string | null;
          dateUpload: string | null;
          taille: string | null;
          file_path: string | null;
          marche_id: string;
          fascicule_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          nom: string;
          type: string;
          statut: string;
          version: string;
          description?: string | null;
          dateUpload?: string | null;
          taille?: string | null;
          file_path?: string | null;
          marche_id: string;
          fascicule_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          nom?: string;
          type?: string;
          statut?: string;
          version?: string;
          description?: string | null;
          dateUpload?: string | null;
          taille?: string | null;
          file_path?: string | null;
          marche_id?: string;
          fascicule_id?: string | null;
          created_at?: string | null;
        };
      };
      fascicules: {
        Row: {
          id: string;
          nom: string;
          description: string | null;
          marche_id: string;
          nombreDocuments: number | null;
          progression: number | null;
          dateMaj: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          nom: string;
          description?: string | null;
          marche_id: string;
          nombreDocuments?: number | null;
          progression?: number | null;
          dateMaj?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          nom?: string;
          description?: string | null;
          marche_id?: string;
          nombreDocuments?: number | null;
          progression?: number | null;
          dateMaj?: string | null;
          created_at?: string | null;
        };
      };
    };
    Views: SupabaseDatabase['public']['Views'];
    Functions: SupabaseDatabase['public']['Functions'];
    Enums: SupabaseDatabase['public']['Enums'];
    CompositeTypes: SupabaseDatabase['public']['CompositeTypes'];
  };
}
