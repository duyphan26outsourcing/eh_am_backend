export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      asset_types: {
        Row: {
          asset_kind: string | null
          code: string
          created_at: string
          created_by: string | null
          fast_group_code: string | null
          id: string
          name: string
          parent_id: string | null
          serial_required: boolean
          status: string
          updated_at: string
          updated_by: string | null
          useful_life_months: number | null
          version: number
        }
        Insert: {
          asset_kind?: string | null
          code: string
          created_at?: string
          created_by?: string | null
          fast_group_code?: string | null
          id?: string
          name: string
          parent_id?: string | null
          serial_required?: boolean
          status?: string
          updated_at?: string
          updated_by?: string | null
          useful_life_months?: number | null
          version?: number
        }
        Update: {
          asset_kind?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          fast_group_code?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          serial_required?: boolean
          status?: string
          updated_at?: string
          updated_by?: string | null
          useful_life_months?: number | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "asset_types_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_types_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "asset_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_types_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          actor_id: string | null
          actor_label: string | null
          changes: Json | null
          context_id: string | null
          context_type: string | null
          created_at: string
          event_code: string
          id: number
          ip_address: unknown
          metadata: Json
          reason: string | null
          request_id: string | null
          subject_id: string | null
          subject_type: string | null
          user_agent: string | null
        }
        Insert: {
          actor_id?: string | null
          actor_label?: string | null
          changes?: Json | null
          context_id?: string | null
          context_type?: string | null
          created_at?: string
          event_code: string
          id?: number
          ip_address?: unknown
          metadata?: Json
          reason?: string | null
          request_id?: string | null
          subject_id?: string | null
          subject_type?: string | null
          user_agent?: string | null
        }
        Update: {
          actor_id?: string | null
          actor_label?: string | null
          changes?: Json | null
          context_id?: string | null
          context_type?: string | null
          created_at?: string
          event_code?: string
          id?: number
          ip_address?: unknown
          metadata?: Json
          reason?: string | null
          request_id?: string | null
          subject_id?: string | null
          subject_type?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      context_role_assignments: {
        Row: {
          context_id: string
          context_type: string
          created_at: string
          effective_from: string
          effective_to: string | null
          grant_reason: string | null
          granted_by: string | null
          id: string
          revoke_reason: string | null
          revoked_by: string | null
          role_code: string
          subject_id: string
          subject_type: string
        }
        Insert: {
          context_id: string
          context_type: string
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          grant_reason?: string | null
          granted_by?: string | null
          id?: string
          revoke_reason?: string | null
          revoked_by?: string | null
          role_code: string
          subject_id: string
          subject_type?: string
        }
        Update: {
          context_id?: string
          context_type?: string
          created_at?: string
          effective_from?: string
          effective_to?: string | null
          grant_reason?: string | null
          granted_by?: string | null
          id?: string
          revoke_reason?: string | null
          revoked_by?: string | null
          role_code?: string
          subject_id?: string
          subject_type?: string
        }
        Relationships: []
      }
      cost_centers: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          id: string
          name: string
          status: string
          updated_at: string
          updated_by: string | null
          version: number
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "cost_centers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_centers_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          id: string
          manager_id: string | null
          name: string
          status: string
          updated_at: string
          updated_by: string | null
          version: number
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          id?: string
          manager_id?: string | null
          name: string
          status?: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "departments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string | null
          code: string
          created_at: string
          created_by: string | null
          default_cost_center_id: string | null
          id: string
          name: string
          status: string
          type: string
          updated_at: string
          updated_by: string | null
          version: number
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string
          created_by?: string | null
          default_cost_center_id?: string | null
          id?: string
          name: string
          status?: string
          type: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          default_cost_center_id?: string | null
          id?: string
          name?: string
          status?: string
          type?: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "locations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_default_cost_center_id_fkey"
            columns: ["default_cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reason_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          id: string
          is_freetext: boolean
          label: string
          reason_group: string
          status: string
          updated_at: string
          updated_by: string | null
          version: number
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_freetext?: boolean
          label: string
          reason_group: string
          status?: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_freetext?: boolean
          label?: string
          reason_group?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "reason_codes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reason_codes_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          created_by: string | null
          display_name: string
          employee_code: string | null
          id: string
          job_title: string | null
          phone: string | null
          preferred_locale: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          display_name: string
          employee_code?: string | null
          id: string
          job_title?: string | null
          phone?: string | null
          preferred_locale?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          display_name?: string
          employee_code?: string | null
          id?: string
          job_title?: string | null
          phone?: string | null
          preferred_locale?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_asset_type: {
        Args: {
          p_actor_id: string
          p_actor_label: string
          p_asset_kind: string
          p_changes: Json
          p_code: string
          p_fast_group_code: string
          p_ip: unknown
          p_name: string
          p_parent_id: string
          p_reason: string
          p_request_id: string
          p_serial_required: boolean
          p_useful_life_months: number
          p_user_agent: string
        }
        Returns: {
          asset_kind: string | null
          code: string
          created_at: string
          created_by: string | null
          fast_group_code: string | null
          id: string
          name: string
          parent_id: string | null
          serial_required: boolean
          status: string
          updated_at: string
          updated_by: string | null
          useful_life_months: number | null
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "asset_types"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_asset_type_group: {
        Args: {
          p_actor_id: string
          p_actor_label: string
          p_changes: Json
          p_code: string
          p_ip: unknown
          p_name: string
          p_reason: string
          p_request_id: string
          p_user_agent: string
        }
        Returns: {
          asset_kind: string | null
          code: string
          created_at: string
          created_by: string | null
          fast_group_code: string | null
          id: string
          name: string
          parent_id: string | null
          serial_required: boolean
          status: string
          updated_at: string
          updated_by: string | null
          useful_life_months: number | null
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "asset_types"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_cost_center: {
        Args: {
          p_actor_id: string
          p_actor_label: string
          p_changes: Json
          p_code: string
          p_ip: unknown
          p_name: string
          p_reason: string
          p_request_id: string
          p_user_agent: string
        }
        Returns: {
          code: string
          created_at: string
          created_by: string | null
          id: string
          name: string
          status: string
          updated_at: string
          updated_by: string | null
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "cost_centers"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_department: {
        Args: {
          p_actor_id: string
          p_actor_label: string
          p_changes: Json
          p_code: string
          p_ip: unknown
          p_name: string
          p_reason: string
          p_request_id: string
          p_user_agent: string
        }
        Returns: {
          code: string
          created_at: string
          created_by: string | null
          id: string
          manager_id: string | null
          name: string
          status: string
          updated_at: string
          updated_by: string | null
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "departments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_location: {
        Args: {
          p_actor_id: string
          p_actor_label: string
          p_address: string
          p_changes: Json
          p_code: string
          p_cost_center_id: string
          p_ip: unknown
          p_name: string
          p_reason: string
          p_request_id: string
          p_type: string
          p_user_agent: string
        }
        Returns: {
          address: string | null
          code: string
          created_at: string
          created_by: string | null
          default_cost_center_id: string | null
          id: string
          name: string
          status: string
          type: string
          updated_at: string
          updated_by: string | null
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "locations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_reason_code: {
        Args: {
          p_actor_id: string
          p_actor_label: string
          p_changes: Json
          p_code: string
          p_ip: unknown
          p_label: string
          p_reason: string
          p_reason_group: string
          p_request_id: string
          p_user_agent: string
        }
        Returns: {
          code: string
          created_at: string
          created_by: string | null
          id: string
          is_freetext: boolean
          label: string
          reason_group: string
          status: string
          updated_at: string
          updated_by: string | null
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "reason_codes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      deactivate_asset_type: {
        Args: {
          p_actor_id: string
          p_actor_label: string
          p_changes: Json
          p_expected_version: number
          p_id: string
          p_ip: unknown
          p_note: string
          p_reason_code_id: string
          p_request_id: string
          p_user_agent: string
        }
        Returns: {
          asset_kind: string | null
          code: string
          created_at: string
          created_by: string | null
          fast_group_code: string | null
          id: string
          name: string
          parent_id: string | null
          serial_required: boolean
          status: string
          updated_at: string
          updated_by: string | null
          useful_life_months: number | null
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "asset_types"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      deactivate_cost_center: {
        Args: {
          p_actor_id: string
          p_actor_label: string
          p_changes: Json
          p_expected_version: number
          p_id: string
          p_ip: unknown
          p_note: string
          p_reason_code_id: string
          p_request_id: string
          p_user_agent: string
        }
        Returns: {
          code: string
          created_at: string
          created_by: string | null
          id: string
          name: string
          status: string
          updated_at: string
          updated_by: string | null
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "cost_centers"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      deactivate_reason_code: {
        Args: {
          p_actor_id: string
          p_actor_label: string
          p_changes: Json
          p_expected_version: number
          p_id: string
          p_ip: unknown
          p_note: string
          p_reason_code_id: string
          p_request_id: string
          p_user_agent: string
        }
        Returns: {
          code: string
          created_at: string
          created_by: string | null
          id: string
          is_freetext: boolean
          label: string
          reason_group: string
          status: string
          updated_at: string
          updated_by: string | null
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "reason_codes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      unaccent: { Args: { "": string }; Returns: string }
      update_asset_type: {
        Args: {
          p_actor_id: string
          p_actor_label: string
          p_asset_kind: string
          p_changes: Json
          p_expected_version: number
          p_fast_group_code: string
          p_id: string
          p_ip: unknown
          p_name: string
          p_reason: string
          p_request_id: string
          p_serial_required: boolean
          p_useful_life_months: number
          p_user_agent: string
        }
        Returns: {
          asset_kind: string | null
          code: string
          created_at: string
          created_by: string | null
          fast_group_code: string | null
          id: string
          name: string
          parent_id: string | null
          serial_required: boolean
          status: string
          updated_at: string
          updated_by: string | null
          useful_life_months: number | null
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "asset_types"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_asset_type_group: {
        Args: {
          p_actor_id: string
          p_actor_label: string
          p_changes: Json
          p_expected_version: number
          p_id: string
          p_ip: unknown
          p_name: string
          p_reason: string
          p_request_id: string
          p_user_agent: string
        }
        Returns: {
          asset_kind: string | null
          code: string
          created_at: string
          created_by: string | null
          fast_group_code: string | null
          id: string
          name: string
          parent_id: string | null
          serial_required: boolean
          status: string
          updated_at: string
          updated_by: string | null
          useful_life_months: number | null
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "asset_types"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_cost_center: {
        Args: {
          p_actor_id: string
          p_actor_label: string
          p_changes: Json
          p_expected_version: number
          p_id: string
          p_ip: unknown
          p_name: string
          p_reason: string
          p_request_id: string
          p_user_agent: string
        }
        Returns: {
          code: string
          created_at: string
          created_by: string | null
          id: string
          name: string
          status: string
          updated_at: string
          updated_by: string | null
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "cost_centers"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_department: {
        Args: {
          p_actor_id: string
          p_actor_label: string
          p_changes: Json
          p_expected_version: number
          p_id: string
          p_ip: unknown
          p_name: string
          p_reason: string
          p_request_id: string
          p_user_agent: string
        }
        Returns: {
          code: string
          created_at: string
          created_by: string | null
          id: string
          manager_id: string | null
          name: string
          status: string
          updated_at: string
          updated_by: string | null
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "departments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_location: {
        Args: {
          p_actor_id: string
          p_actor_label: string
          p_address: string
          p_changes: Json
          p_cost_center_id: string
          p_expected_version: number
          p_id: string
          p_ip: unknown
          p_name: string
          p_reason: string
          p_request_id: string
          p_user_agent: string
        }
        Returns: {
          address: string | null
          code: string
          created_at: string
          created_by: string | null
          default_cost_center_id: string | null
          id: string
          name: string
          status: string
          type: string
          updated_at: string
          updated_by: string | null
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "locations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_reason_code: {
        Args: {
          p_actor_id: string
          p_actor_label: string
          p_changes: Json
          p_expected_version: number
          p_id: string
          p_ip: unknown
          p_label: string
          p_reason: string
          p_request_id: string
          p_user_agent: string
        }
        Returns: {
          code: string
          created_at: string
          created_by: string | null
          id: string
          is_freetext: boolean
          label: string
          reason_group: string
          status: string
          updated_at: string
          updated_by: string | null
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "reason_codes"
          isOneToOne: true
          isSetofReturn: false
        }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
