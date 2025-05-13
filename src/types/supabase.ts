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
      // Ajout des nouvelles tables
      ordres_service: {
        Row: {
          id: string;
          marche_id: string;
          reference: string;
          type: string;
          date_emission: string;
          delai: number | null;
          description: string;
          destinataire: string;
          impact: string | null;
          statut: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          marche_id: string;
          reference: string;
          type: string;
          date_emission: string;
          delai?: number | null;
          description: string;
          destinataire: string;
          impact?: string | null;
          statut: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          marche_id?: string;
          reference?: string;
          type?: string;
          date_emission?: string;
          delai?: number | null;
          description?: string;
          destinataire?: string;
          impact?: string | null;
          statut?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      prix_nouveaux: {
        Row: {
          id: string;
          marche_id: string;
          reference: string;
          designation: string;
          unite: string;
          quantite: number;
          prix_unitaire: number;
          justification: string;
          materiaux_montant: number | null;
          main_oeuvre_montant: number | null;
          materiel_montant: number | null;
          frais_generaux: number | null;
          benefice: number | null;
          statut: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          marche_id: string;
          reference: string;
          designation: string;
          unite: string;
          quantite: number;
          prix_unitaire: number;
          justification: string;
          materiaux_montant?: number | null;
          main_oeuvre_montant?: number | null;
          materiel_montant?: number | null;
          frais_generaux?: number | null;
          benefice?: number | null;
          statut: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          marche_id?: string;
          reference?: string;
          designation?: string;
          unite?: string;
          quantite?: number;
          prix_unitaire?: number;
          justification?: string;
          materiaux_montant?: number | null;
          main_oeuvre_montant?: number | null;
          materiel_montant?: number | null;
          frais_generaux?: number | null;
          benefice?: number | null;
          statut?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      situations: {
        Row: {
          id: string;
          marche_id: string;
          numero: number;
          date: string;
          lot: string;
          montant_ht: number;
          montant_ttc: number;
          avancement: number;
          statut: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          marche_id: string;
          numero: number;
          date: string;
          lot: string;
          montant_ht: number;
          montant_ttc: number;
          avancement: number;
          statut: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          marche_id?: string;
          numero?: number;
          date?: string;
          lot?: string;
          montant_ht?: number;
          montant_ttc?: number;
          avancement?: number;
          statut?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
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
        Insert: {
          id?: string;
          type: string;
          user_id: string;
          created_at?: string;
          marche_id: string;
          objet_id: string;
          lue?: boolean;
          titre: string;
          message: string;
          objet_type: string;
        };
        Update: {
          id?: string;
          type?: string;
          user_id?: string;
          created_at?: string;
          marche_id?: string;
          objet_id?: string;
          lue?: boolean;
          titre?: string;
          message?: string;
          objet_type?: string;
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
