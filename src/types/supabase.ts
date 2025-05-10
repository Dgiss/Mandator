import { Database as SupabaseDatabase } from '@/integrations/supabase/types';

// Extend the Supabase types with our custom database schema
export interface Database {
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
          dateupload: string | null;
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
          dateupload?: string | null;
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
          dateupload?: string | null;
          taille?: string | null;
          file_path?: string | null;
          marche_id?: string;
          fascicule_id?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      fascicules: {
        Row: {
          id: string;
          nom: string;
          description: string | null;
          marche_id: string;
          nombredocuments: number | null;
          progression: number | null;
          datemaj: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          nom: string;
          description?: string | null;
          marche_id: string;
          nombredocuments?: number | null;
          progression?: number | null;
          datemaj?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          nom?: string;
          description?: string | null;
          marche_id?: string;
          nombredocuments?: number | null;
          progression?: number | null;
          datemaj?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      marches: {
        Row: {
          id: string;
          titre: string;
          description: string | null;
          client: string | null;
          statut: string;
          datecreation: string | null;
          budget: string | null;
          image: string | null;
          user_id: string | null;
          created_at: string | null;
          reference: string | null;
          logo: string | null;
        };
        Insert: {
          id?: string;
          titre: string;
          description?: string | null;
          client?: string | null;
          statut?: string;
          datecreation?: string | null;
          budget?: string | null;
          image?: string | null;
          user_id?: string | null;
          created_at?: string | null;
          reference?: string | null;
          logo?: string | null;
        };
        Update: {
          id?: string;
          titre?: string;
          description?: string | null;
          client?: string | null;
          statut?: string;
          datecreation?: string | null;
          budget?: string | null;
          image?: string | null;
          user_id?: string | null;
          created_at?: string | null;
          reference?: string | null;
          logo?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          nom: string | null;
          prenom: string | null;
          role: string | null;
          entreprise: string | null;
          created_at: string | null;
          updated_at: string | null;
          role_global: string;
          email: string | null;
        };
        Insert: {
          id: string;
          nom?: string | null;
          prenom?: string | null;
          role?: string | null;
          entreprise?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          role_global?: string;
          email?: string | null;
        };
        Update: {
          id?: string;
          nom?: string | null;
          prenom?: string | null;
          role?: string | null;
          entreprise?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          role_global?: string;
          email?: string | null;
        };
        Relationships: [];
      };
      droits_marche: {
        Row: {
          id: string;
          user_id: string;
          marche_id: string;
          role_specifique: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          marche_id: string;
          role_specifique: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          marche_id?: string;
          role_specifique?: string;
          created_at?: string | null;
        };
        Relationships: [];
      };
      versions: {
        Row: {
          id: string;
          document_id: string;
          marche_id: string;
          version: string;
          cree_par: string;
          date_creation: string | null;
          taille: string | null;
          commentaire: string | null;
          file_path: string | null;
          created_at: string | null;
          statut: string | null;
        };
        Insert: {
          id?: string;
          document_id: string;
          marche_id: string;
          version: string;
          cree_par: string;
          date_creation?: string | null;
          taille?: string | null;
          commentaire?: string | null;
          file_path?: string | null;
          created_at?: string | null;
          statut?: string | null;
        };
        Update: {
          id?: string;
          document_id?: string;
          marche_id?: string;
          version?: string;
          cree_par?: string;
          date_creation?: string | null;
          taille?: string | null;
          commentaire?: string | null;
          file_path?: string | null;
          created_at?: string | null;
          statut?: string | null;
        };
        Relationships: [];
      };
      visas: {
        Row: {
          id: string;
          document_id: string | null;
          marche_id: string;
          version: string;
          demande_par: string;
          date_demande: string | null;
          echeance: string | null;
          statut: string | null;
          commentaire: string | null;
          attachment_path: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          document_id?: string | null;
          marche_id: string;
          version: string;
          demande_par: string;
          date_demande?: string | null;
          echeance?: string | null;
          statut?: string | null;
          commentaire?: string | null;
          attachment_path?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          document_id?: string | null;
          marche_id?: string;
          version?: string;
          demande_par?: string;
          date_demande?: string | null;
          echeance?: string | null;
          statut?: string | null;
          commentaire?: string | null;
          attachment_path?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      reponses: {
        Row: {
          id: string;
          question_id: string;
          content: string;
          user_id: string | null;
          date_creation: string | null;
          attachment_path: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          question_id: string;
          content: string;
          user_id?: string | null;
          date_creation?: string | null;
          attachment_path?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          question_id?: string;
          content?: string;
          user_id?: string | null;
          date_creation?: string | null;
          attachment_path?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          content: string;
          marche_id: string;
          document_id: string | null;
          fascicule_id: string | null;
          attachment_path: string | null;
          date_creation: string;
          statut: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          content: string;
          marche_id: string;
          document_id?: string | null;
          fascicule_id?: string | null;
          attachment_path?: string | null;
          date_creation?: string;
          statut?: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          content?: string;
          marche_id?: string;
          document_id?: string | null;
          fascicule_id?: string | null;
          attachment_path?: string | null;
          date_creation?: string;
          statut?: string;
          created_at?: string | null;
        };
        Relationships: [];
      };
      document_attachments: {
        Row: {
          id: string;
          document_id: string;
          version_id: string | null;
          file_name: string;
          file_path: string;
          file_type: string;
          file_size: string;
          uploaded_at: string | null;
        };
        Insert: {
          id?: string;
          document_id: string;
          version_id?: string | null;
          file_name: string;
          file_path: string;
          file_type: string;
          file_size: string;
          uploaded_at?: string | null;
        };
        Update: {
          id?: string;
          document_id?: string;
          version_id?: string | null;
          file_name?: string;
          file_path?: string;
          file_type?: string;
          file_size?: string;
          uploaded_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: SupabaseDatabase['public']['Views'];
    Functions: SupabaseDatabase['public']['Functions'];
    Enums: SupabaseDatabase['public']['Enums'];
    CompositeTypes: SupabaseDatabase['public']['CompositeTypes'];
  };
}
