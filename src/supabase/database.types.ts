export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.18';
  };
  public: {
    Tables: {
      account_status_command_receipts: {
        Row: {
          action: string;
          actor_id: string;
          command_key: string;
          completed_at: string | null;
          created_at: string;
          employee_id: string;
          reason_code_id: string;
          reason_note: string | null;
          result_row: Json | null;
        };
        Insert: {
          action: string;
          actor_id: string;
          command_key: string;
          completed_at?: string | null;
          created_at?: string;
          employee_id: string;
          reason_code_id: string;
          reason_note?: string | null;
          result_row?: Json | null;
        };
        Update: {
          action?: string;
          actor_id?: string;
          command_key?: string;
          completed_at?: string | null;
          created_at?: string;
          employee_id?: string;
          reason_code_id?: string;
          reason_note?: string | null;
          result_row?: Json | null;
        };
        Relationships: [];
      };
      activation_invites: {
        Row: {
          accepted_at: string | null;
          activation_started_at: string | null;
          created_at: string;
          created_by: string | null;
          expires_at: string;
          id: string;
          status: string;
          token_hash: string;
          user_id: string;
        };
        Insert: {
          accepted_at?: string | null;
          activation_started_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          expires_at: string;
          id?: string;
          status?: string;
          token_hash: string;
          user_id: string;
        };
        Update: {
          accepted_at?: string | null;
          activation_started_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          expires_at?: string;
          id?: string;
          status?: string;
          token_hash?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'activation_invites_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'activation_invites_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      asset_cancellation_requests: {
        Row: {
          asset_id: string;
          created_at: string;
          decided_at: string | null;
          decided_by: string | null;
          decision_reason_code_id: string | null;
          decision_reason_note: string | null;
          id: string;
          request_reason_code_id: string;
          request_reason_note: string | null;
          requested_at: string;
          requested_by: string;
          status: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          asset_id: string;
          created_at?: string;
          decided_at?: string | null;
          decided_by?: string | null;
          decision_reason_code_id?: string | null;
          decision_reason_note?: string | null;
          id?: string;
          request_reason_code_id: string;
          request_reason_note?: string | null;
          requested_at?: string;
          requested_by: string;
          status?: string;
          updated_at?: string;
          version?: number;
        };
        Update: {
          asset_id?: string;
          created_at?: string;
          decided_at?: string | null;
          decided_by?: string | null;
          decision_reason_code_id?: string | null;
          decision_reason_note?: string | null;
          id?: string;
          request_reason_code_id?: string;
          request_reason_note?: string | null;
          requested_at?: string;
          requested_by?: string;
          status?: string;
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'asset_cancellation_requests_asset_id_fkey';
            columns: ['asset_id'];
            isOneToOne: false;
            referencedRelation: 'assets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'asset_cancellation_requests_decided_by_fkey';
            columns: ['decided_by'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'asset_cancellation_requests_decision_reason_code_id_fkey';
            columns: ['decision_reason_code_id'];
            isOneToOne: false;
            referencedRelation: 'reason_codes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'asset_cancellation_requests_request_reason_code_id_fkey';
            columns: ['request_reason_code_id'];
            isOneToOne: false;
            referencedRelation: 'reason_codes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'asset_cancellation_requests_requested_by_fkey';
            columns: ['requested_by'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      asset_command_receipts: {
        Row: {
          actor_id: string;
          command_key: string;
          completed_at: string | null;
          created_at: string;
          operation: string;
          payload: Json;
          result_row: Json | null;
        };
        Insert: {
          actor_id: string;
          command_key: string;
          completed_at?: string | null;
          created_at?: string;
          operation: string;
          payload: Json;
          result_row?: Json | null;
        };
        Update: {
          actor_id?: string;
          command_key?: string;
          completed_at?: string | null;
          created_at?: string;
          operation?: string;
          payload?: Json;
          result_row?: Json | null;
        };
        Relationships: [];
      };
      asset_types: {
        Row: {
          asset_kind: string | null;
          code: string;
          created_at: string;
          created_by: string | null;
          fast_group_code: string | null;
          id: string;
          name: string;
          parent_id: string | null;
          serial_required: boolean;
          status: string;
          updated_at: string;
          updated_by: string | null;
          useful_life_months: number | null;
          version: number;
        };
        Insert: {
          asset_kind?: string | null;
          code: string;
          created_at?: string;
          created_by?: string | null;
          fast_group_code?: string | null;
          id?: string;
          name: string;
          parent_id?: string | null;
          serial_required?: boolean;
          status?: string;
          updated_at?: string;
          updated_by?: string | null;
          useful_life_months?: number | null;
          version?: number;
        };
        Update: {
          asset_kind?: string | null;
          code?: string;
          created_at?: string;
          created_by?: string | null;
          fast_group_code?: string | null;
          id?: string;
          name?: string;
          parent_id?: string | null;
          serial_required?: boolean;
          status?: string;
          updated_at?: string;
          updated_by?: string | null;
          useful_life_months?: number | null;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'asset_types_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'asset_types_parent_id_fkey';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'asset_types';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'asset_types_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      assets: {
        Row: {
          asset_code: string;
          asset_type_id: string;
          cost_center_id: string;
          created_at: string;
          created_by: string | null;
          id: string;
          invoice_no: string | null;
          lifecycle_status: string;
          name: string;
          note: string | null;
          physical_condition: string;
          primary_location_id: string;
          profile_version: number;
          purchase_date: string | null;
          qr_token: string;
          responsible_user_id: string;
          serial: string | null;
          supplier_id: string | null;
          updated_at: string;
        };
        Insert: {
          asset_code: string;
          asset_type_id: string;
          cost_center_id: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          invoice_no?: string | null;
          lifecycle_status: string;
          name: string;
          note?: string | null;
          physical_condition?: string;
          primary_location_id: string;
          profile_version?: number;
          purchase_date?: string | null;
          qr_token: string;
          responsible_user_id: string;
          serial?: string | null;
          supplier_id?: string | null;
          updated_at?: string;
        };
        Update: {
          asset_code?: string;
          asset_type_id?: string;
          cost_center_id?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          invoice_no?: string | null;
          lifecycle_status?: string;
          name?: string;
          note?: string | null;
          physical_condition?: string;
          primary_location_id?: string;
          profile_version?: number;
          purchase_date?: string | null;
          qr_token?: string;
          responsible_user_id?: string;
          serial?: string | null;
          supplier_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'assets_asset_type_id_fkey';
            columns: ['asset_type_id'];
            isOneToOne: false;
            referencedRelation: 'asset_types';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assets_cost_center_id_fkey';
            columns: ['cost_center_id'];
            isOneToOne: false;
            referencedRelation: 'cost_centers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assets_primary_location_id_fkey';
            columns: ['primary_location_id'];
            isOneToOne: false;
            referencedRelation: 'locations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assets_responsible_user_id_fkey';
            columns: ['responsible_user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assets_supplier_id_fkey';
            columns: ['supplier_id'];
            isOneToOne: false;
            referencedRelation: 'suppliers';
            referencedColumns: ['id'];
          },
        ];
      };
      audit_events: {
        Row: {
          actor_id: string | null;
          actor_label: string | null;
          changes: Json | null;
          context_id: string | null;
          context_type: string | null;
          created_at: string;
          event_code: string;
          id: number;
          ip_address: unknown;
          metadata: Json;
          reason: string | null;
          request_id: string | null;
          subject_id: string | null;
          subject_type: string | null;
          user_agent: string | null;
        };
        Insert: {
          actor_id?: string | null;
          actor_label?: string | null;
          changes?: Json | null;
          context_id?: string | null;
          context_type?: string | null;
          created_at?: string;
          event_code: string;
          id?: number;
          ip_address?: unknown;
          metadata?: Json;
          reason?: string | null;
          request_id?: string | null;
          subject_id?: string | null;
          subject_type?: string | null;
          user_agent?: string | null;
        };
        Update: {
          actor_id?: string | null;
          actor_label?: string | null;
          changes?: Json | null;
          context_id?: string | null;
          context_type?: string | null;
          created_at?: string;
          event_code?: string;
          id?: number;
          ip_address?: unknown;
          metadata?: Json;
          reason?: string | null;
          request_id?: string | null;
          subject_id?: string | null;
          subject_type?: string | null;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      context_role_assignments: {
        Row: {
          context_id: string;
          context_type: string;
          created_at: string;
          effective_from: string;
          effective_to: string | null;
          grant_reason: string | null;
          granted_by: string | null;
          id: string;
          revoke_reason: string | null;
          revoked_by: string | null;
          role_code: string;
          subject_id: string;
          subject_type: string;
        };
        Insert: {
          context_id: string;
          context_type: string;
          created_at?: string;
          effective_from?: string;
          effective_to?: string | null;
          grant_reason?: string | null;
          granted_by?: string | null;
          id?: string;
          revoke_reason?: string | null;
          revoked_by?: string | null;
          role_code: string;
          subject_id: string;
          subject_type?: string;
        };
        Update: {
          context_id?: string;
          context_type?: string;
          created_at?: string;
          effective_from?: string;
          effective_to?: string | null;
          grant_reason?: string | null;
          granted_by?: string | null;
          id?: string;
          revoke_reason?: string | null;
          revoked_by?: string | null;
          role_code?: string;
          subject_id?: string;
          subject_type?: string;
        };
        Relationships: [];
      };
      cost_centers: {
        Row: {
          code: string;
          created_at: string;
          created_by: string | null;
          id: string;
          name: string;
          status: string;
          updated_at: string;
          updated_by: string | null;
          version: number;
        };
        Insert: {
          code: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          name: string;
          status?: string;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Update: {
          code?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          name?: string;
          status?: string;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'cost_centers_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'cost_centers_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      departments: {
        Row: {
          code: string;
          created_at: string;
          created_by: string | null;
          id: string;
          manager_id: string | null;
          name: string;
          status: string;
          updated_at: string;
          updated_by: string | null;
          version: number;
        };
        Insert: {
          code: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          manager_id?: string | null;
          name: string;
          status?: string;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Update: {
          code?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          manager_id?: string | null;
          name?: string;
          status?: string;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'departments_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'departments_manager_id_fkey';
            columns: ['manager_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'departments_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      employee_command_receipts: {
        Row: {
          actor_id: string;
          command_key: string;
          completed_at: string | null;
          created_at: string;
          delivered_at: string | null;
          delivery_status: string | null;
          employee_id: string | null;
          operation: string;
          result_row: Json | null;
        };
        Insert: {
          actor_id: string;
          command_key: string;
          completed_at?: string | null;
          created_at?: string;
          delivered_at?: string | null;
          delivery_status?: string | null;
          employee_id?: string | null;
          operation: string;
          result_row?: Json | null;
        };
        Update: {
          actor_id?: string;
          command_key?: string;
          completed_at?: string | null;
          created_at?: string;
          delivered_at?: string | null;
          delivery_status?: string | null;
          employee_id?: string | null;
          operation?: string;
          result_row?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: 'employee_command_receipts_employee_id_fkey';
            columns: ['employee_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      employee_profile_command_receipts: {
        Row: {
          actor_id: string;
          command_key: string;
          completed_at: string | null;
          created_at: string;
          employee_id: string;
          operation: string;
          payload: Json;
          result_row: Json | null;
        };
        Insert: {
          actor_id: string;
          command_key: string;
          completed_at?: string | null;
          created_at?: string;
          employee_id: string;
          operation: string;
          payload: Json;
          result_row?: Json | null;
        };
        Update: {
          actor_id?: string;
          command_key?: string;
          completed_at?: string | null;
          created_at?: string;
          employee_id?: string;
          operation?: string;
          payload?: Json;
          result_row?: Json | null;
        };
        Relationships: [];
      };
      employee_termination_receipts: {
        Row: {
          actor_id: string;
          command_key: string;
          completed_at: string | null;
          created_at: string;
          employee_id: string;
          payload: Json;
          result_row: Json | null;
        };
        Insert: {
          actor_id: string;
          command_key: string;
          completed_at?: string | null;
          created_at?: string;
          employee_id: string;
          payload: Json;
          result_row?: Json | null;
        };
        Update: {
          actor_id?: string;
          command_key?: string;
          completed_at?: string | null;
          created_at?: string;
          employee_id?: string;
          payload?: Json;
          result_row?: Json | null;
        };
        Relationships: [];
      };
      location_command_receipts: {
        Row: {
          actor_id: string;
          command_key: string;
          completed_at: string | null;
          created_at: string;
          location_id: string | null;
          operation: string;
          result_row: Json | null;
        };
        Insert: {
          actor_id: string;
          command_key: string;
          completed_at?: string | null;
          created_at?: string;
          location_id?: string | null;
          operation: string;
          result_row?: Json | null;
        };
        Update: {
          actor_id?: string;
          command_key?: string;
          completed_at?: string | null;
          created_at?: string;
          location_id?: string | null;
          operation?: string;
          result_row?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: 'location_command_receipts_location_id_fkey';
            columns: ['location_id'];
            isOneToOne: false;
            referencedRelation: 'locations';
            referencedColumns: ['id'];
          },
        ];
      };
      locations: {
        Row: {
          address: string | null;
          address_detail: string | null;
          code: string;
          created_at: string;
          created_by: string | null;
          deactivated_at: string | null;
          deactivated_by: string | null;
          deactivated_note: string | null;
          deactivated_reason_code_id: string | null;
          default_cost_center_id: string | null;
          id: string;
          name: string;
          province_code: string | null;
          province_name: string | null;
          status: string;
          type: string;
          updated_at: string;
          updated_by: string | null;
          version: number;
          ward_name: string | null;
        };
        Insert: {
          address?: string | null;
          address_detail?: string | null;
          code: string;
          created_at?: string;
          created_by?: string | null;
          deactivated_at?: string | null;
          deactivated_by?: string | null;
          deactivated_note?: string | null;
          deactivated_reason_code_id?: string | null;
          default_cost_center_id?: string | null;
          id?: string;
          name: string;
          province_code?: string | null;
          province_name?: string | null;
          status?: string;
          type: string;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
          ward_name?: string | null;
        };
        Update: {
          address?: string | null;
          address_detail?: string | null;
          code?: string;
          created_at?: string;
          created_by?: string | null;
          deactivated_at?: string | null;
          deactivated_by?: string | null;
          deactivated_note?: string | null;
          deactivated_reason_code_id?: string | null;
          default_cost_center_id?: string | null;
          id?: string;
          name?: string;
          province_code?: string | null;
          province_name?: string | null;
          status?: string;
          type?: string;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
          ward_name?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'locations_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'locations_deactivated_by_fkey';
            columns: ['deactivated_by'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'locations_deactivated_reason_code_id_fkey';
            columns: ['deactivated_reason_code_id'];
            isOneToOne: false;
            referencedRelation: 'reason_codes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'locations_default_cost_center_id_fkey';
            columns: ['default_cost_center_id'];
            isOneToOne: false;
            referencedRelation: 'cost_centers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'locations_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      reason_codes: {
        Row: {
          code: string;
          created_at: string;
          created_by: string | null;
          id: string;
          is_freetext: boolean;
          label: string;
          reason_group: string;
          status: string;
          updated_at: string;
          updated_by: string | null;
          version: number;
        };
        Insert: {
          code: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          is_freetext?: boolean;
          label: string;
          reason_group: string;
          status?: string;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Update: {
          code?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          is_freetext?: boolean;
          label?: string;
          reason_group?: string;
          status?: string;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'reason_codes_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reason_codes_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      repair_vendor_command_receipts: {
        Row: {
          actor_id: string;
          command_key: string;
          completed_at: string | null;
          created_at: string;
          operation: string;
          repair_vendor_id: string | null;
          result_row: Json | null;
        };
        Insert: {
          actor_id: string;
          command_key: string;
          completed_at?: string | null;
          created_at?: string;
          operation: string;
          repair_vendor_id?: string | null;
          result_row?: Json | null;
        };
        Update: {
          actor_id?: string;
          command_key?: string;
          completed_at?: string | null;
          created_at?: string;
          operation?: string;
          repair_vendor_id?: string | null;
          result_row?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: 'repair_vendor_command_receipts_repair_vendor_id_fkey';
            columns: ['repair_vendor_id'];
            isOneToOne: false;
            referencedRelation: 'repair_vendors';
            referencedColumns: ['id'];
          },
        ];
      };
      repair_vendors: {
        Row: {
          contact_email: string | null;
          contact_name: string | null;
          contact_phone: string | null;
          created_at: string;
          created_by: string | null;
          deactivated_at: string | null;
          deactivated_by: string | null;
          deactivated_note: string | null;
          deactivated_reason_code_id: string | null;
          external_location_id: string;
          id: string;
          name: string;
          service_types: string[];
          status: string;
          updated_at: string;
          updated_by: string | null;
          version: number;
        };
        Insert: {
          contact_email?: string | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          created_by?: string | null;
          deactivated_at?: string | null;
          deactivated_by?: string | null;
          deactivated_note?: string | null;
          deactivated_reason_code_id?: string | null;
          external_location_id: string;
          id?: string;
          name: string;
          service_types: string[];
          status?: string;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Update: {
          contact_email?: string | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          created_by?: string | null;
          deactivated_at?: string | null;
          deactivated_by?: string | null;
          deactivated_note?: string | null;
          deactivated_reason_code_id?: string | null;
          external_location_id?: string;
          id?: string;
          name?: string;
          service_types?: string[];
          status?: string;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'repair_vendors_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'repair_vendors_deactivated_by_fkey';
            columns: ['deactivated_by'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'repair_vendors_deactivated_reason_code_id_fkey';
            columns: ['deactivated_reason_code_id'];
            isOneToOne: false;
            referencedRelation: 'reason_codes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'repair_vendors_external_location_id_fkey';
            columns: ['external_location_id'];
            isOneToOne: true;
            referencedRelation: 'locations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'repair_vendors_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      role_assignment_command_receipts: {
        Row: {
          actor_id: string;
          assignment_id: string | null;
          command_key: string;
          completed_at: string | null;
          context_ids: string[] | null;
          context_type: string | null;
          created_at: string;
          effective_from: string | null;
          effective_to: string | null;
          employee_id: string;
          operation: string;
          reason: string | null;
          result_rows: Json | null;
          role_code: string | null;
        };
        Insert: {
          actor_id: string;
          assignment_id?: string | null;
          command_key: string;
          completed_at?: string | null;
          context_ids?: string[] | null;
          context_type?: string | null;
          created_at?: string;
          effective_from?: string | null;
          effective_to?: string | null;
          employee_id: string;
          operation: string;
          reason?: string | null;
          result_rows?: Json | null;
          role_code?: string | null;
        };
        Update: {
          actor_id?: string;
          assignment_id?: string | null;
          command_key?: string;
          completed_at?: string | null;
          context_ids?: string[] | null;
          context_type?: string | null;
          created_at?: string;
          effective_from?: string | null;
          effective_to?: string | null;
          employee_id?: string;
          operation?: string;
          reason?: string | null;
          result_rows?: Json | null;
          role_code?: string | null;
        };
        Relationships: [];
      };
      supplier_command_receipts: {
        Row: {
          actor_id: string;
          command_key: string;
          completed_at: string | null;
          created_at: string;
          operation: string;
          result_row: Json | null;
          supplier_id: string | null;
        };
        Insert: {
          actor_id: string;
          command_key: string;
          completed_at?: string | null;
          created_at?: string;
          operation: string;
          result_row?: Json | null;
          supplier_id?: string | null;
        };
        Update: {
          actor_id?: string;
          command_key?: string;
          completed_at?: string | null;
          created_at?: string;
          operation?: string;
          result_row?: Json | null;
          supplier_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'supplier_command_receipts_supplier_id_fkey';
            columns: ['supplier_id'];
            isOneToOne: false;
            referencedRelation: 'suppliers';
            referencedColumns: ['id'];
          },
        ];
      };
      suppliers: {
        Row: {
          contact_email: string | null;
          contact_name: string | null;
          contact_phone: string | null;
          created_at: string;
          created_by: string | null;
          id: string;
          name: string;
          status: string;
          tax_id: string | null;
          updated_at: string;
          updated_by: string | null;
          version: number;
        };
        Insert: {
          contact_email?: string | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          name: string;
          status?: string;
          tax_id?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Update: {
          contact_email?: string | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          name?: string;
          status?: string;
          tax_id?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'suppliers_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'suppliers_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      user_profiles: {
        Row: {
          auth_email_sync_status: string;
          auth_email_sync_updated_at: string | null;
          created_at: string;
          created_by: string | null;
          department_id: string | null;
          display_name: string;
          employee_code: string | null;
          employment_type: string | null;
          id: string;
          job_title: string | null;
          manager_id: string | null;
          must_change_password: boolean;
          phone: string | null;
          preferred_locale: string;
          primary_location_id: string | null;
          profile_version: number;
          start_date: string | null;
          status: string;
          termination_date: string | null;
          termination_note: string | null;
          termination_reason_code_id: string | null;
          updated_at: string;
          work_email: string | null;
        };
        Insert: {
          auth_email_sync_status?: string;
          auth_email_sync_updated_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          department_id?: string | null;
          display_name: string;
          employee_code?: string | null;
          employment_type?: string | null;
          id: string;
          job_title?: string | null;
          manager_id?: string | null;
          must_change_password?: boolean;
          phone?: string | null;
          preferred_locale?: string;
          primary_location_id?: string | null;
          profile_version?: number;
          start_date?: string | null;
          status?: string;
          termination_date?: string | null;
          termination_note?: string | null;
          termination_reason_code_id?: string | null;
          updated_at?: string;
          work_email?: string | null;
        };
        Update: {
          auth_email_sync_status?: string;
          auth_email_sync_updated_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          department_id?: string | null;
          display_name?: string;
          employee_code?: string | null;
          employment_type?: string | null;
          id?: string;
          job_title?: string | null;
          manager_id?: string | null;
          must_change_password?: boolean;
          phone?: string | null;
          preferred_locale?: string;
          primary_location_id?: string | null;
          profile_version?: number;
          start_date?: string | null;
          status?: string;
          termination_date?: string | null;
          termination_note?: string | null;
          termination_reason_code_id?: string | null;
          updated_at?: string;
          work_email?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_profiles_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_profiles_department_id_fkey';
            columns: ['department_id'];
            isOneToOne: false;
            referencedRelation: 'departments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_profiles_manager_id_fkey';
            columns: ['manager_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_profiles_primary_location_id_fkey';
            columns: ['primary_location_id'];
            isOneToOne: false;
            referencedRelation: 'locations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_profiles_termination_reason_code_id_fkey';
            columns: ['termination_reason_code_id'];
            isOneToOne: false;
            referencedRelation: 'reason_codes';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      change_asset_responsible: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_asset_id: string;
          p_command_key: string;
          p_expected_version: number;
          p_ip: unknown;
          p_reason_code_id: string;
          p_reason_note: string;
          p_request_id: string;
          p_responsible_user_id: string;
          p_user_agent: string;
        };
        Returns: Json;
      };
      change_employee_account_status: {
        Args: {
          p_action: string;
          p_actor_id: string;
          p_actor_label: string;
          p_command_key: string;
          p_employee_id: string;
          p_ip: unknown;
          p_reason_code_id: string;
          p_reason_note: string;
          p_request_id: string;
          p_user_agent: string;
        };
        Returns: Json;
      };
      change_employee_email: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_command_key: string;
          p_email: string;
          p_employee_id: string;
          p_expected_version: number;
          p_invite_expires_at: string;
          p_invite_token_hash: string;
          p_ip: unknown;
          p_reason_code_id: string;
          p_reason_note: string;
          p_request_id: string;
          p_user_agent: string;
        };
        Returns: Json;
      };
      claim_activation_invite: { Args: { p_user_id: string }; Returns: Json };
      complete_account_activation: {
        Args: {
          p_invite_id: string;
          p_ip: unknown;
          p_request_id: string;
          p_user_agent: string;
          p_user_id: string;
        };
        Returns: boolean;
      };
      complete_resend_invite_delivery: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_command_key: string;
          p_delivery_status: string;
          p_ip: unknown;
          p_request_id: string;
          p_user_agent: string;
        };
        Returns: undefined;
      };
      create_asset: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_asset_type_id: string;
          p_command_key: string;
          p_invoice_no: string;
          p_ip: unknown;
          p_lifecycle_status: string;
          p_name: string;
          p_note: string;
          p_primary_location_id: string;
          p_purchase_date: string;
          p_request_id: string;
          p_responsible_user_id: string;
          p_serial: string;
          p_supplier_id: string;
          p_user_agent: string;
        };
        Returns: Json;
      };
      create_asset_type: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_asset_kind: string;
          p_changes: Json;
          p_code: string;
          p_fast_group_code: string;
          p_ip: unknown;
          p_name: string;
          p_parent_id: string;
          p_reason: string;
          p_request_id: string;
          p_serial_required: boolean;
          p_useful_life_months: number;
          p_user_agent: string;
        };
        Returns: {
          asset_kind: string | null;
          code: string;
          created_at: string;
          created_by: string | null;
          fast_group_code: string | null;
          id: string;
          name: string;
          parent_id: string | null;
          serial_required: boolean;
          status: string;
          updated_at: string;
          updated_by: string | null;
          useful_life_months: number | null;
          version: number;
        };
        SetofOptions: {
          from: '*';
          to: 'asset_types';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      create_asset_type_group: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_changes: Json;
          p_code: string;
          p_ip: unknown;
          p_name: string;
          p_reason: string;
          p_request_id: string;
          p_user_agent: string;
        };
        Returns: {
          asset_kind: string | null;
          code: string;
          created_at: string;
          created_by: string | null;
          fast_group_code: string | null;
          id: string;
          name: string;
          parent_id: string | null;
          serial_required: boolean;
          status: string;
          updated_at: string;
          updated_by: string | null;
          useful_life_months: number | null;
          version: number;
        };
        SetofOptions: {
          from: '*';
          to: 'asset_types';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      create_cost_center: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_changes: Json;
          p_code: string;
          p_ip: unknown;
          p_name: string;
          p_reason: string;
          p_request_id: string;
          p_user_agent: string;
        };
        Returns: {
          code: string;
          created_at: string;
          created_by: string | null;
          id: string;
          name: string;
          status: string;
          updated_at: string;
          updated_by: string | null;
          version: number;
        };
        SetofOptions: {
          from: '*';
          to: 'cost_centers';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      create_department: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_changes: Json;
          p_code: string;
          p_ip: unknown;
          p_name: string;
          p_reason: string;
          p_request_id: string;
          p_user_agent: string;
        };
        Returns: {
          code: string;
          created_at: string;
          created_by: string | null;
          id: string;
          manager_id: string | null;
          name: string;
          status: string;
          updated_at: string;
          updated_by: string | null;
          version: number;
        };
        SetofOptions: {
          from: '*';
          to: 'departments';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      create_employee: {
        Args: {
          p_activation_method: string;
          p_actor_id: string;
          p_actor_label: string;
          p_changes: Json;
          p_command_key: string;
          p_department_id: string;
          p_display_name: string;
          p_effective_from: string;
          p_effective_to: string;
          p_employee_code: string;
          p_employment_type: string;
          p_invite_expires_at: string;
          p_invite_token_hash: string;
          p_ip: unknown;
          p_job_title: string;
          p_manager_id: string;
          p_must_change_password: boolean;
          p_phone: string;
          p_preferred_locale: string;
          p_primary_location_id: string;
          p_reason_code_id: string;
          p_reason_note: string;
          p_request_id: string;
          p_role_code: string;
          p_role_context_id: string;
          p_role_context_type: string;
          p_start_date: string;
          p_user_agent: string;
          p_user_id: string;
          p_work_email: string;
        };
        Returns: {
          auth_email_sync_status: string;
          auth_email_sync_updated_at: string | null;
          created_at: string;
          created_by: string | null;
          department_id: string | null;
          display_name: string;
          employee_code: string | null;
          employment_type: string | null;
          id: string;
          job_title: string | null;
          manager_id: string | null;
          must_change_password: boolean;
          phone: string | null;
          preferred_locale: string;
          primary_location_id: string | null;
          profile_version: number;
          start_date: string | null;
          status: string;
          termination_date: string | null;
          termination_note: string | null;
          termination_reason_code_id: string | null;
          updated_at: string;
          work_email: string | null;
        };
        SetofOptions: {
          from: '*';
          to: 'user_profiles';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      create_location: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_address_detail: string;
          p_changes: Json;
          p_code: string;
          p_command_key: string;
          p_cost_center_id: string;
          p_ip: unknown;
          p_name: string;
          p_province_code: string;
          p_province_name: string;
          p_reason: string;
          p_request_id: string;
          p_type: string;
          p_user_agent: string;
          p_ward_name: string;
        };
        Returns: {
          address: string | null;
          address_detail: string | null;
          code: string;
          created_at: string;
          created_by: string | null;
          deactivated_at: string | null;
          deactivated_by: string | null;
          deactivated_note: string | null;
          deactivated_reason_code_id: string | null;
          default_cost_center_id: string | null;
          id: string;
          name: string;
          province_code: string | null;
          province_name: string | null;
          status: string;
          type: string;
          updated_at: string;
          updated_by: string | null;
          version: number;
          ward_name: string | null;
        };
        SetofOptions: {
          from: '*';
          to: 'locations';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      create_reason_code: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_changes: Json;
          p_code: string;
          p_ip: unknown;
          p_label: string;
          p_reason: string;
          p_reason_group: string;
          p_request_id: string;
          p_user_agent: string;
        };
        Returns: {
          code: string;
          created_at: string;
          created_by: string | null;
          id: string;
          is_freetext: boolean;
          label: string;
          reason_group: string;
          status: string;
          updated_at: string;
          updated_by: string | null;
          version: number;
        };
        SetofOptions: {
          from: '*';
          to: 'reason_codes';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      create_repair_vendor: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_changes: Json;
          p_command_key: string;
          p_contact_email: string;
          p_contact_name: string;
          p_contact_phone: string;
          p_external_location_id: string;
          p_ip: unknown;
          p_name: string;
          p_request_id: string;
          p_service_types: string[];
          p_user_agent: string;
        };
        Returns: {
          contact_email: string | null;
          contact_name: string | null;
          contact_phone: string | null;
          created_at: string;
          created_by: string | null;
          deactivated_at: string | null;
          deactivated_by: string | null;
          deactivated_note: string | null;
          deactivated_reason_code_id: string | null;
          external_location_id: string;
          id: string;
          name: string;
          service_types: string[];
          status: string;
          updated_at: string;
          updated_by: string | null;
          version: number;
        };
        SetofOptions: {
          from: '*';
          to: 'repair_vendors';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      create_supplier: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_changes: Json;
          p_command_key: string;
          p_contact_email: string;
          p_contact_name: string;
          p_contact_phone: string;
          p_ip: unknown;
          p_name: string;
          p_request_id: string;
          p_tax_id: string;
          p_user_agent: string;
        };
        Returns: {
          contact_email: string | null;
          contact_name: string | null;
          contact_phone: string | null;
          created_at: string;
          created_by: string | null;
          id: string;
          name: string;
          status: string;
          tax_id: string | null;
          updated_at: string;
          updated_by: string | null;
          version: number;
        };
        SetofOptions: {
          from: '*';
          to: 'suppliers';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      deactivate_asset_type: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_changes: Json;
          p_expected_version: number;
          p_id: string;
          p_ip: unknown;
          p_note: string;
          p_reason_code_id: string;
          p_request_id: string;
          p_user_agent: string;
        };
        Returns: {
          asset_kind: string | null;
          code: string;
          created_at: string;
          created_by: string | null;
          fast_group_code: string | null;
          id: string;
          name: string;
          parent_id: string | null;
          serial_required: boolean;
          status: string;
          updated_at: string;
          updated_by: string | null;
          useful_life_months: number | null;
          version: number;
        };
        SetofOptions: {
          from: '*';
          to: 'asset_types';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      deactivate_cost_center: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_changes: Json;
          p_expected_version: number;
          p_id: string;
          p_ip: unknown;
          p_note: string;
          p_reason_code_id: string;
          p_request_id: string;
          p_user_agent: string;
        };
        Returns: {
          code: string;
          created_at: string;
          created_by: string | null;
          id: string;
          name: string;
          status: string;
          updated_at: string;
          updated_by: string | null;
          version: number;
        };
        SetofOptions: {
          from: '*';
          to: 'cost_centers';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      deactivate_reason_code: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_changes: Json;
          p_expected_version: number;
          p_id: string;
          p_ip: unknown;
          p_note: string;
          p_reason_code_id: string;
          p_request_id: string;
          p_user_agent: string;
        };
        Returns: {
          code: string;
          created_at: string;
          created_by: string | null;
          id: string;
          is_freetext: boolean;
          label: string;
          reason_group: string;
          status: string;
          updated_at: string;
          updated_by: string | null;
          version: number;
        };
        SetofOptions: {
          from: '*';
          to: 'reason_codes';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      deactivate_repair_vendor: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_command_key: string;
          p_expected_version: number;
          p_id: string;
          p_ip: unknown;
          p_location_changes: Json;
          p_note: string;
          p_reason_code_id: string;
          p_request_id: string;
          p_user_agent: string;
          p_vendor_changes: Json;
        };
        Returns: {
          contact_email: string | null;
          contact_name: string | null;
          contact_phone: string | null;
          created_at: string;
          created_by: string | null;
          deactivated_at: string | null;
          deactivated_by: string | null;
          deactivated_note: string | null;
          deactivated_reason_code_id: string | null;
          external_location_id: string;
          id: string;
          name: string;
          service_types: string[];
          status: string;
          updated_at: string;
          updated_by: string | null;
          version: number;
        };
        SetofOptions: {
          from: '*';
          to: 'repair_vendors';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      deactivate_supplier: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_changes: Json;
          p_command_key: string;
          p_expected_version: number;
          p_id: string;
          p_ip: unknown;
          p_note: string;
          p_reason_code_id: string;
          p_request_id: string;
          p_user_agent: string;
        };
        Returns: {
          contact_email: string | null;
          contact_name: string | null;
          contact_phone: string | null;
          created_at: string;
          created_by: string | null;
          id: string;
          name: string;
          status: string;
          tax_id: string | null;
          updated_at: string;
          updated_by: string | null;
          version: number;
        };
        SetofOptions: {
          from: '*';
          to: 'suppliers';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      decide_asset_cancellation: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_cancellation_id: string;
          p_command_key: string;
          p_decision: string;
          p_expected_version: number;
          p_ip: unknown;
          p_reason_code_id: string;
          p_reason_note: string;
          p_request_id: string;
          p_user_agent: string;
        };
        Returns: Json;
      };
      grant_role_assignments: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_command_key: string;
          p_context_ids: string[];
          p_context_type: string;
          p_effective_from: string;
          p_effective_to: string;
          p_employee_id: string;
          p_ip: unknown;
          p_reason: string;
          p_request_id: string;
          p_role_code: string;
          p_user_agent: string;
        };
        Returns: Json;
      };
      list_assets: {
        Args: {
          p_asset_type_id: string;
          p_limit: number;
          p_location_id: string;
          p_location_ids: string[];
          p_offset: number;
          p_physical_condition: string;
          p_search: string;
          p_status: string;
        };
        Returns: {
          asset_code: string;
          asset_kind: string;
          asset_type_code: string;
          asset_type_id: string;
          asset_type_name: string;
          cost_center_id: string;
          created_at: string;
          id: string;
          lifecycle_status: string;
          location_code: string;
          location_name: string;
          name: string;
          physical_condition: string;
          primary_location_id: string;
          responsible_employee_code: string;
          responsible_name: string;
          responsible_user_id: string;
          serial: string;
          total_count: number;
        }[];
      };
      list_employees: {
        Args: {
          p_department_id: string;
          p_employment_type: string;
          p_limit: number;
          p_location_id: string;
          p_offset: number;
          p_role_code: string;
          p_search: string;
          p_status: string;
        };
        Returns: {
          department_code: string;
          department_id: string;
          department_name: string;
          display_name: string;
          employee_code: string;
          employment_type: string;
          id: string;
          invite_expires_at: string;
          invite_status: string;
          job_title: string;
          location_code: string;
          location_name: string;
          phone: string;
          primary_location_id: string;
          start_date: string;
          status: string;
          total_count: number;
          work_email: string;
        }[];
      };
      location_open_usage_counts: {
        Args: { p_location_id: string };
        Returns: Json;
      };
      mark_employee_email_sync: {
        Args: { p_employee_id: string; p_status: string };
        Returns: undefined;
      };
      preview_activation_invite: { Args: { p_user_id: string }; Returns: Json };
      release_activation_invite: {
        Args: { p_invite_id: string; p_user_id: string };
        Returns: boolean;
      };
      request_asset_cancellation: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_asset_id: string;
          p_command_key: string;
          p_ip: unknown;
          p_reason_code_id: string;
          p_reason_note: string;
          p_request_id: string;
          p_user_agent: string;
        };
        Returns: Json;
      };
      resend_employee_invite: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_command_key: string;
          p_employee_id: string;
          p_invite_expires_at: string;
          p_invite_token_hash: string;
          p_ip: unknown;
          p_request_id: string;
          p_user_agent: string;
        };
        Returns: Json;
      };
      revoke_employee_sessions: {
        Args: { p_employee_id: string };
        Returns: number;
      };
      revoke_role_assignment: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_assignment_id: string;
          p_command_key: string;
          p_employee_id: string;
          p_ip: unknown;
          p_reason: string;
          p_request_id: string;
          p_user_agent: string;
        };
        Returns: Json;
      };
      set_asset_lifecycle_status: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_asset_id: string;
          p_command_key: string;
          p_expected_version: number;
          p_ip: unknown;
          p_reason_code_id: string;
          p_reason_note: string;
          p_request_id: string;
          p_target_status: string;
          p_user_agent: string;
        };
        Returns: Json;
      };
      terminate_employee: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_asset_transfers: Json;
          p_command_key: string;
          p_employee_id: string;
          p_expected_version: number;
          p_ip: unknown;
          p_new_manager_id: string;
          p_reason_code_id: string;
          p_reason_note: string;
          p_request_id: string;
          p_user_agent: string;
        };
        Returns: Json;
      };
      unaccent: { Args: { '': string }; Returns: string };
      update_asset_description: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_asset_id: string;
          p_asset_type_id: string;
          p_command_key: string;
          p_expected_version: number;
          p_ip: unknown;
          p_name: string;
          p_note: string;
          p_reason_code_id: string;
          p_reason_note: string;
          p_request_id: string;
          p_serial: string;
          p_user_agent: string;
        };
        Returns: Json;
      };
      update_asset_type: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_asset_kind: string;
          p_changes: Json;
          p_expected_version: number;
          p_fast_group_code: string;
          p_id: string;
          p_ip: unknown;
          p_name: string;
          p_reason: string;
          p_request_id: string;
          p_serial_required: boolean;
          p_useful_life_months: number;
          p_user_agent: string;
        };
        Returns: {
          asset_kind: string | null;
          code: string;
          created_at: string;
          created_by: string | null;
          fast_group_code: string | null;
          id: string;
          name: string;
          parent_id: string | null;
          serial_required: boolean;
          status: string;
          updated_at: string;
          updated_by: string | null;
          useful_life_months: number | null;
          version: number;
        };
        SetofOptions: {
          from: '*';
          to: 'asset_types';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      update_asset_type_group: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_changes: Json;
          p_expected_version: number;
          p_id: string;
          p_ip: unknown;
          p_name: string;
          p_reason: string;
          p_request_id: string;
          p_user_agent: string;
        };
        Returns: {
          asset_kind: string | null;
          code: string;
          created_at: string;
          created_by: string | null;
          fast_group_code: string | null;
          id: string;
          name: string;
          parent_id: string | null;
          serial_required: boolean;
          status: string;
          updated_at: string;
          updated_by: string | null;
          useful_life_months: number | null;
          version: number;
        };
        SetofOptions: {
          from: '*';
          to: 'asset_types';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      update_cost_center: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_changes: Json;
          p_expected_version: number;
          p_id: string;
          p_ip: unknown;
          p_name: string;
          p_reason: string;
          p_request_id: string;
          p_user_agent: string;
        };
        Returns: {
          code: string;
          created_at: string;
          created_by: string | null;
          id: string;
          name: string;
          status: string;
          updated_at: string;
          updated_by: string | null;
          version: number;
        };
        SetofOptions: {
          from: '*';
          to: 'cost_centers';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      update_department: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_changes: Json;
          p_expected_version: number;
          p_id: string;
          p_ip: unknown;
          p_name: string;
          p_reason: string;
          p_request_id: string;
          p_user_agent: string;
        };
        Returns: {
          code: string;
          created_at: string;
          created_by: string | null;
          id: string;
          manager_id: string | null;
          name: string;
          status: string;
          updated_at: string;
          updated_by: string | null;
          version: number;
        };
        SetofOptions: {
          from: '*';
          to: 'departments';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      update_employee_profile: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_command_key: string;
          p_department_id: string;
          p_display_name: string;
          p_employee_code: string;
          p_employee_id: string;
          p_employment_type: string;
          p_expected_version: number;
          p_ip: unknown;
          p_job_title: string;
          p_manager_id: string;
          p_phone: string;
          p_preferred_locale: string;
          p_primary_location_id: string;
          p_reason: string;
          p_request_id: string;
          p_start_date: string;
          p_user_agent: string;
        };
        Returns: Json;
      };
      update_location: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_address_detail: string;
          p_changes: Json;
          p_command_key: string;
          p_cost_center_id: string;
          p_expected_version: number;
          p_id: string;
          p_ip: unknown;
          p_name: string;
          p_province_code: string;
          p_province_name: string;
          p_reason: string;
          p_request_id: string;
          p_user_agent: string;
          p_ward_name: string;
        };
        Returns: {
          address: string | null;
          address_detail: string | null;
          code: string;
          created_at: string;
          created_by: string | null;
          deactivated_at: string | null;
          deactivated_by: string | null;
          deactivated_note: string | null;
          deactivated_reason_code_id: string | null;
          default_cost_center_id: string | null;
          id: string;
          name: string;
          province_code: string | null;
          province_name: string | null;
          status: string;
          type: string;
          updated_at: string;
          updated_by: string | null;
          version: number;
          ward_name: string | null;
        };
        SetofOptions: {
          from: '*';
          to: 'locations';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      update_reason_code: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_changes: Json;
          p_expected_version: number;
          p_id: string;
          p_ip: unknown;
          p_label: string;
          p_reason: string;
          p_request_id: string;
          p_user_agent: string;
        };
        Returns: {
          code: string;
          created_at: string;
          created_by: string | null;
          id: string;
          is_freetext: boolean;
          label: string;
          reason_group: string;
          status: string;
          updated_at: string;
          updated_by: string | null;
          version: number;
        };
        SetofOptions: {
          from: '*';
          to: 'reason_codes';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      update_repair_vendor: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_changes: Json;
          p_command_key: string;
          p_contact_email: string;
          p_contact_name: string;
          p_contact_phone: string;
          p_expected_version: number;
          p_id: string;
          p_ip: unknown;
          p_name: string;
          p_request_id: string;
          p_service_types: string[];
          p_user_agent: string;
        };
        Returns: {
          contact_email: string | null;
          contact_name: string | null;
          contact_phone: string | null;
          created_at: string;
          created_by: string | null;
          deactivated_at: string | null;
          deactivated_by: string | null;
          deactivated_note: string | null;
          deactivated_reason_code_id: string | null;
          external_location_id: string;
          id: string;
          name: string;
          service_types: string[];
          status: string;
          updated_at: string;
          updated_by: string | null;
          version: number;
        };
        SetofOptions: {
          from: '*';
          to: 'repair_vendors';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      update_supplier: {
        Args: {
          p_actor_id: string;
          p_actor_label: string;
          p_changes: Json;
          p_command_key: string;
          p_contact_email: string;
          p_contact_name: string;
          p_contact_phone: string;
          p_expected_version: number;
          p_id: string;
          p_ip: unknown;
          p_name: string;
          p_request_id: string;
          p_tax_id: string;
          p_user_agent: string;
        };
        Returns: {
          contact_email: string | null;
          contact_name: string | null;
          contact_phone: string | null;
          created_at: string;
          created_by: string | null;
          id: string;
          name: string;
          status: string;
          tax_id: string | null;
          updated_at: string;
          updated_by: string | null;
          version: number;
        };
        SetofOptions: {
          from: '*';
          to: 'suppliers';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
