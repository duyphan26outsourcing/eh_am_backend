// ⚠️ BẢN VIẾT TAY TẠM THỜI — khớp `sql-docs/migrations/01_identity_rbac_audit.sql`.
//
// Project Supabase của Every Half chưa được tạo nên chưa sinh được file thật. Sau khi chạy
// migration 01 trên project DEV, chạy `npm run gen:types` để GHI ĐÈ toàn bộ file này bằng
// bản sinh tự động — đừng sửa tay file này thêm nữa sau lúc đó.
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
    PostgrestVersion: '14.15';
  };
  public: {
    Tables: {
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
      user_profiles: {
        Row: {
          created_at: string;
          created_by: string | null;
          display_name: string;
          employee_code: string | null;
          id: string;
          job_title: string | null;
          phone: string | null;
          preferred_locale: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          display_name: string;
          employee_code?: string | null;
          id: string;
          job_title?: string | null;
          phone?: string | null;
          preferred_locale?: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          display_name?: string;
          employee_code?: string | null;
          id?: string;
          job_title?: string | null;
          phone?: string | null;
          preferred_locale?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_profiles_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      unaccent: { Args: { '': string }; Returns: string };
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
