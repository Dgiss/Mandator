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
      alertes: {
        Row: {
          active: boolean
          created_at: string
          delai_jours: number
          id: string
          marche_id: string
          type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          delai_jours: number
          id?: string
          marche_id: string
          type: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          delai_jours?: number
          id?: string
          marche_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alertes_marche_id_fkey"
            columns: ["marche_id"]
            isOneToOne: false
            referencedRelation: "marches"
            referencedColumns: ["id"]
          },
        ]
      }
      document_attachments: {
        Row: {
          document_id: string
          file_name: string
          file_path: string
          file_size: string
          file_type: string
          id: string
          uploaded_at: string | null
          version_id: string | null
        }
        Insert: {
          document_id: string
          file_name: string
          file_path: string
          file_size: string
          file_type: string
          id?: string
          uploaded_at?: string | null
          version_id?: string | null
        }
        Update: {
          document_id?: string
          file_name?: string
          file_path?: string
          file_size?: string
          file_type?: string
          id?: string
          uploaded_at?: string | null
          version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_attachments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_attachments_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "versions"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          date_bpe: string | null
          date_diffusion: string | null
          dateupload: string | null
          dateupload_old: string | null
          description: string | null
          designation: string | null
          domaine_technique: string | null
          emetteur: string | null
          fascicule_id: string | null
          file_path: string | null
          geographie: string | null
          id: string
          marche_id: string
          nom: string
          numero: string | null
          numero_operation: string | null
          phase: string | null
          statut: string
          taille: string | null
          type: string
          version: string
        }
        Insert: {
          created_at?: string | null
          date_bpe?: string | null
          date_diffusion?: string | null
          dateupload?: string | null
          dateupload_old?: string | null
          description?: string | null
          designation?: string | null
          domaine_technique?: string | null
          emetteur?: string | null
          fascicule_id?: string | null
          file_path?: string | null
          geographie?: string | null
          id?: string
          marche_id: string
          nom: string
          numero?: string | null
          numero_operation?: string | null
          phase?: string | null
          statut?: string
          taille?: string | null
          type: string
          version: string
        }
        Update: {
          created_at?: string | null
          date_bpe?: string | null
          date_diffusion?: string | null
          dateupload?: string | null
          dateupload_old?: string | null
          description?: string | null
          designation?: string | null
          domaine_technique?: string | null
          emetteur?: string | null
          fascicule_id?: string | null
          file_path?: string | null
          geographie?: string | null
          id?: string
          marche_id?: string
          nom?: string
          numero?: string | null
          numero_operation?: string | null
          phase?: string | null
          statut?: string
          taille?: string | null
          type?: string
          version?: string
        }
        Relationships: []
      }
      droits_marche: {
        Row: {
          created_at: string | null
          id: string
          marche_id: string
          role_specifique: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          marche_id: string
          role_specifique: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          marche_id?: string
          role_specifique?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "droits_marche_marche_id_fkey"
            columns: ["marche_id"]
            isOneToOne: false
            referencedRelation: "marches"
            referencedColumns: ["id"]
          },
        ]
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
          adresse: string | null
          budget: string | null
          client: string | null
          code_postal: string | null
          commentaire: string | null
          created_at: string | null
          date_debut: string | null
          date_fin: string | null
          date_fin_gpa: string | null
          date_notification: string | null
          datecreation: string | null
          description: string | null
          id: string
          image: string | null
          logo: string | null
          pays: string | null
          periode_chantier: string | null
          periode_preparation: string | null
          region: string | null
          statut: string
          titre: string
          type_marche: string | null
          user_id: string | null
          ville: string | null
        }
        Insert: {
          adresse?: string | null
          budget?: string | null
          client?: string | null
          code_postal?: string | null
          commentaire?: string | null
          created_at?: string | null
          date_debut?: string | null
          date_fin?: string | null
          date_fin_gpa?: string | null
          date_notification?: string | null
          datecreation?: string | null
          description?: string | null
          id?: string
          image?: string | null
          logo?: string | null
          pays?: string | null
          periode_chantier?: string | null
          periode_preparation?: string | null
          region?: string | null
          statut?: string
          titre: string
          type_marche?: string | null
          user_id?: string | null
          ville?: string | null
        }
        Update: {
          adresse?: string | null
          budget?: string | null
          client?: string | null
          code_postal?: string | null
          commentaire?: string | null
          created_at?: string | null
          date_debut?: string | null
          date_fin?: string | null
          date_fin_gpa?: string | null
          date_notification?: string | null
          datecreation?: string | null
          description?: string | null
          id?: string
          image?: string | null
          logo?: string | null
          pays?: string | null
          periode_chantier?: string | null
          periode_preparation?: string | null
          region?: string | null
          statut?: string
          titre?: string
          type_marche?: string | null
          user_id?: string | null
          ville?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          lue: boolean
          marche_id: string
          message: string
          objet_id: string
          objet_type: string
          titre: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lue?: boolean
          marche_id: string
          message: string
          objet_id: string
          objet_type: string
          titre: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lue?: boolean
          marche_id?: string
          message?: string
          objet_id?: string
          objet_type?: string
          titre?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_marche_id_fkey"
            columns: ["marche_id"]
            isOneToOne: false
            referencedRelation: "marches"
            referencedColumns: ["id"]
          },
        ]
      }
      ordres_service: {
        Row: {
          created_at: string
          date_emission: string
          delai: number | null
          description: string
          destinataire: string
          id: string
          impact: string | null
          marche_id: string
          reference: string
          statut: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_emission: string
          delai?: number | null
          description: string
          destinataire: string
          id?: string
          impact?: string | null
          marche_id: string
          reference: string
          statut: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_emission?: string
          delai?: number | null
          description?: string
          destinataire?: string
          id?: string
          impact?: string | null
          marche_id?: string
          reference?: string
          statut?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ordres_service_marche_id_fkey"
            columns: ["marche_id"]
            isOneToOne: false
            referencedRelation: "marches"
            referencedColumns: ["id"]
          },
        ]
      }
      prix_nouveaux: {
        Row: {
          benefice: number | null
          created_at: string
          designation: string
          frais_generaux: number | null
          id: string
          justification: string
          main_oeuvre_montant: number | null
          marche_id: string
          materiaux_montant: number | null
          materiel_montant: number | null
          prix_unitaire: number
          quantite: number
          reference: string
          statut: string
          unite: string
          updated_at: string
        }
        Insert: {
          benefice?: number | null
          created_at?: string
          designation: string
          frais_generaux?: number | null
          id?: string
          justification: string
          main_oeuvre_montant?: number | null
          marche_id: string
          materiaux_montant?: number | null
          materiel_montant?: number | null
          prix_unitaire: number
          quantite: number
          reference: string
          statut: string
          unite: string
          updated_at?: string
        }
        Update: {
          benefice?: number | null
          created_at?: string
          designation?: string
          frais_generaux?: number | null
          id?: string
          justification?: string
          main_oeuvre_montant?: number | null
          marche_id?: string
          materiaux_montant?: number | null
          materiel_montant?: number | null
          prix_unitaire?: number
          quantite?: number
          reference?: string
          statut?: string
          unite?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prix_nouveaux_marche_id_fkey"
            columns: ["marche_id"]
            isOneToOne: false
            referencedRelation: "marches"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          entreprise: string | null
          id: string
          nom: string | null
          prenom: string | null
          role: string | null
          role_global: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          entreprise?: string | null
          id: string
          nom?: string | null
          prenom?: string | null
          role?: string | null
          role_global?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          entreprise?: string | null
          id?: string
          nom?: string | null
          prenom?: string | null
          role?: string | null
          role_global?: string
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
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
      situations: {
        Row: {
          avancement: number
          created_at: string
          date: string
          id: string
          lot: string
          marche_id: string
          montant_ht: number
          montant_ttc: number
          numero: number
          statut: string
          updated_at: string
        }
        Insert: {
          avancement: number
          created_at?: string
          date: string
          id?: string
          lot: string
          marche_id: string
          montant_ht: number
          montant_ttc: number
          numero: number
          statut: string
          updated_at?: string
        }
        Update: {
          avancement?: number
          created_at?: string
          date?: string
          id?: string
          lot?: string
          marche_id?: string
          montant_ht?: number
          montant_ttc?: number
          numero?: number
          statut?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "situations_marche_id_fkey"
            columns: ["marche_id"]
            isOneToOne: false
            referencedRelation: "marches"
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
          statut: string | null
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
          statut?: string | null
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
          statut?: string | null
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
      assign_role_to_user: {
        Args: { user_id: string; marche_id: string; role_specifique: string }
        Returns: undefined
      }
      check_droits_access: {
        Args: { droit_id: string }
        Returns: boolean
      }
      check_marche_access: {
        Args: { marche_id: string }
        Returns: boolean
      }
      check_market_access: {
        Args: { market_id: string }
        Returns: boolean
      }
      check_user_marche_access: {
        Args: { user_id: string; marche_id: string }
        Returns: boolean
      }
      check_user_marche_access_safe: {
        Args: { user_id: string; marche_id: string }
        Returns: boolean
      }
      check_versions_non_diffusees: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          id: string
          lue: boolean
          marche_id: string
          message: string
          objet_id: string
          objet_type: string
          titre: string
          type: string
          user_id: string
        }[]
      }
      check_visas_en_attente: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          id: string
          lue: boolean
          marche_id: string
          message: string
          objet_id: string
          objet_type: string
          titre: string
          type: string
          user_id: string
        }[]
      }
      create_new_marche: {
        Args: { marche_data: Json }
        Returns: {
          adresse: string | null
          budget: string | null
          client: string | null
          code_postal: string | null
          commentaire: string | null
          created_at: string | null
          date_debut: string | null
          date_fin: string | null
          date_fin_gpa: string | null
          date_notification: string | null
          datecreation: string | null
          description: string | null
          id: string
          image: string | null
          logo: string | null
          pays: string | null
          periode_chantier: string | null
          periode_preparation: string | null
          region: string | null
          statut: string
          titre: string
          type_marche: string | null
          user_id: string | null
          ville: string | null
        }
      }
      get_accessible_marches_for_user: {
        Args: Record<PropertyKey, never>
        Returns: {
          adresse: string | null
          budget: string | null
          client: string | null
          code_postal: string | null
          commentaire: string | null
          created_at: string | null
          date_debut: string | null
          date_fin: string | null
          date_fin_gpa: string | null
          date_notification: string | null
          datecreation: string | null
          description: string | null
          id: string
          image: string | null
          logo: string | null
          pays: string | null
          periode_chantier: string | null
          periode_preparation: string | null
          region: string | null
          statut: string
          titre: string
          type_marche: string | null
          user_id: string | null
          ville: string | null
        }[]
      }
      get_droits_for_marche: {
        Args: { marche_id_param: string }
        Returns: {
          created_at: string | null
          id: string
          marche_id: string
          role_specifique: string
          user_id: string
        }[]
      }
      get_droits_for_user: {
        Args: { user_id_param: string }
        Returns: {
          created_at: string | null
          id: string
          marche_id: string
          role_specifique: string
          user_id: string
        }[]
      }
      get_user_global_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role_for_marche: {
        Args: { marche_id: string } | { user_id: string; marche_id: string }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_moe_for_marche: {
        Args: { marche_id: string }
        Returns: boolean
      }
      remove_role_from_user: {
        Args: { user_id: string; marche_id: string }
        Returns: undefined
      }
      search_profiles: {
        Args: { search_term: string }
        Returns: {
          created_at: string | null
          email: string | null
          entreprise: string | null
          id: string
          nom: string | null
          prenom: string | null
          role: string | null
          role_global: string
          updated_at: string | null
        }[]
      }
      user_can_access_marche: {
        Args: { marche_id: string }
        Returns: boolean
      }
      user_can_create_marche: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      user_has_access_to_marche: {
        Args: { user_id: string; marche_id: string }
        Returns: boolean
      }
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
