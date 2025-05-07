export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      documents: {
        Row: {
          created_at: string | null
          dateupload: string | null
          description: string | null
          fascicule_id: string | null
          file_path: string | null
          id: string
          marche_id: string
          nom: string
          statut: string
          taille: string | null
          type: string
          version: string
        }
        Insert: {
          created_at?: string | null
          dateupload?: string | null
          description?: string | null
          fascicule_id?: string | null
          file_path?: string | null
          id?: string
          marche_id: string
          nom: string
          statut: string
          taille?: string | null
          type: string
          version: string
        }
        Update: {
          created_at?: string | null
          dateupload?: string | null
          description?: string | null
          fascicule_id?: string | null
          file_path?: string | null
          id?: string
          marche_id?: string
          nom?: string
          statut?: string
          taille?: string | null
          type?: string
          version?: string
        }
        Relationships: []
      }
      fascicules: {
        Row: {
          created_at: string | null
          datemaj: string | null
          description: string | null
          id: string
          marche_id: string
          nom: string
          nombredocuments: number | null
          progression: number | null
        }
        Insert: {
          created_at?: string | null
          datemaj?: string | null
          description?: string | null
          id?: string
          marche_id: string
          nom: string
          nombredocuments?: number | null
          progression?: number | null
        }
        Update: {
          created_at?: string | null
          datemaj?: string | null
          description?: string | null
          id?: string
          marche_id?: string
          nom?: string
          nombredocuments?: number | null
          progression?: number | null
        }
        Relationships: []
      }
      marches: {
        Row: {
          budget: string | null
          client: string | null
          created_at: string | null
          datecreation: string | null
          description: string | null
          id: string
          image: string | null
          statut: string
          titre: string
          user_id: string | null
        }
        Insert: {
          budget?: string | null
          client?: string | null
          created_at?: string | null
          datecreation?: string | null
          description?: string | null
          id?: string
          image?: string | null
          statut?: string
          titre: string
          user_id?: string | null
        }
        Update: {
          budget?: string | null
          client?: string | null
          created_at?: string | null
          datecreation?: string | null
          description?: string | null
          id?: string
          image?: string | null
          statut?: string
          titre?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          entreprise: string | null
          id: string
          nom: string | null
          prenom: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          entreprise?: string | null
          id: string
          nom?: string | null
          prenom?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          entreprise?: string | null
          id?: string
          nom?: string | null
          prenom?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          attachment_path: string | null
          content: string
          created_at: string | null
          date_creation: string | null
          document_id: string | null
          fascicule_id: string | null
          id: string
          marche_id: string
          statut: string
        }
        Insert: {
          attachment_path?: string | null
          content: string
          created_at?: string | null
          date_creation?: string | null
          document_id?: string | null
          fascicule_id?: string | null
          id?: string
          marche_id: string
          statut?: string
        }
        Update: {
          attachment_path?: string | null
          content?: string
          created_at?: string | null
          date_creation?: string | null
          document_id?: string | null
          fascicule_id?: string | null
          id?: string
          marche_id?: string
          statut?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_fascicule_id_fkey"
            columns: ["fascicule_id"]
            isOneToOne: false
            referencedRelation: "fascicules"
            referencedColumns: ["id"]
          },
        ]
      }
      reponses: {
        Row: {
          attachment_path: string | null
          content: string
          created_at: string | null
          date_creation: string | null
          id: string
          question_id: string
          user_id: string | null
        }
        Insert: {
          attachment_path?: string | null
          content: string
          created_at?: string | null
          date_creation?: string | null
          id?: string
          question_id: string
          user_id?: string | null
        }
        Update: {
          attachment_path?: string | null
          content?: string
          created_at?: string | null
          date_creation?: string | null
          id?: string
          question_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reponses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      versions: {
        Row: {
          commentaire: string | null
          created_at: string | null
          cree_par: string
          date_creation: string | null
          document_id: string
          file_path: string | null
          id: string
          marche_id: string
          taille: string | null
          version: string
        }
        Insert: {
          commentaire?: string | null
          created_at?: string | null
          cree_par: string
          date_creation?: string | null
          document_id: string
          file_path?: string | null
          id?: string
          marche_id: string
          taille?: string | null
          version: string
        }
        Update: {
          commentaire?: string | null
          created_at?: string | null
          cree_par?: string
          date_creation?: string | null
          document_id?: string
          file_path?: string | null
          id?: string
          marche_id?: string
          taille?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      visas: {
        Row: {
          attachment_path: string | null
          commentaire: string | null
          created_at: string | null
          date_demande: string | null
          demande_par: string
          document_id: string | null
          echeance: string | null
          id: string
          marche_id: string
          statut: string | null
          version: string
        }
        Insert: {
          attachment_path?: string | null
          commentaire?: string | null
          created_at?: string | null
          date_demande?: string | null
          demande_par: string
          document_id?: string | null
          echeance?: string | null
          id?: string
          marche_id: string
          statut?: string | null
          version: string
        }
        Update: {
          attachment_path?: string | null
          commentaire?: string | null
          created_at?: string | null
          date_demande?: string | null
          demande_par?: string
          document_id?: string | null
          echeance?: string | null
          id?: string
          marche_id?: string
          statut?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "visas_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
