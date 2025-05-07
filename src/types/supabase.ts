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
        Relationships: [];
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
        Relationships: [];
      };
      // Ajout de la définition de la table marches
      marches: {
        Row: {
          id: string;
          titre: string;
          description: string | null;
          client: string | null;
          statut: string;
          datecreation: string | null;  // Correction: datecreation au lieu de dateCreation
          budget: string | null;
          image: string | null;
          user_id: string | null;
          created_at: string | null;
          reference: string | null;
          logo: string | null;
          // Ces champs ne sont pas présents dans la base de données
          // dateDebut?: string | null;
          // dateFin?: string | null;
          // hasAttachments?: boolean | null;
          // isPublic?: boolean | null;
        };
        Insert: {
          id?: string;
          titre: string;
          description?: string | null;
          client?: string | null;
          statut?: string;
          datecreation?: string | null;  // Correction: datecreation au lieu de dateCreation
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
          datecreation?: string | null;  // Correction: datecreation au lieu de dateCreation
          budget?: string | null;
          image?: string | null;
          user_id?: string | null;
          created_at?: string | null;
          reference?: string | null;
          logo?: string | null;
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
      // Ajout de la table profiles
      profiles: {
        Row: {
          id: string;
          nom: string | null;
          prenom: string | null;
          role: string | null;
          entreprise: string | null;
          created_at: string | null;
          updated_at: string | null;
          role_utilisateur: string | null;
        };
        Insert: {
          id: string;
          nom?: string | null;
          prenom?: string | null;
          role?: string | null;
          entreprise?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          role_utilisateur?: string | null;
        };
        Update: {
          id?: string;
          nom?: string | null;
          prenom?: string | null;
          role?: string | null;
          entreprise?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          role_utilisateur?: string | null;
        };
        Relationships: [];
      };
      // Ajout de la table versions
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
      // Ajout de la table visas
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
      // Ajout de la table reponses
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
    };
    Views: SupabaseDatabase['public']['Views'];
    Functions: SupabaseDatabase['public']['Functions'];
    Enums: SupabaseDatabase['public']['Enums'];
    CompositeTypes: SupabaseDatabase['public']['CompositeTypes'];
  };
}
