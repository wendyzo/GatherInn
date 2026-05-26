export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      org_positions: {
        Row: {
          id: string;
          society_id: string;
          title: string;
          tier: "executive" | "project_owner" | "member";
          parent_id: string | null;
          position_order: number;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          society_id: string;
          title: string;
          tier?: "executive" | "project_owner" | "member";
          parent_id?: string | null;
          position_order?: number;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          society_id?: string;
          title?: string;
          tier?: "executive" | "project_owner" | "member";
          parent_id?: string | null;
          position_order?: number;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "org_positions_society_id_fkey";
            columns: ["society_id"];
            isOneToOne: false;
            referencedRelation: "societies";
            referencedColumns: ["id"];
          },
        ];
      };
      position_assignments: {
        Row: {
          id: string;
          position_id: string;
          user_id: string;
          assigned_by: string;
          status: "pending" | "active";
          created_at: string;
        };
        Insert: {
          id?: string;
          position_id: string;
          user_id: string;
          assigned_by: string;
          status?: "pending" | "active";
          created_at?: string;
        };
        Update: {
          id?: string;
          position_id?: string;
          user_id?: string;
          assigned_by?: string;
          status?: "pending" | "active";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "position_assignments_position_id_fkey";
            columns: ["position_id"];
            isOneToOne: false;
            referencedRelation: "org_positions";
            referencedColumns: ["id"];
          },
        ];
      };
      event_risks: {
        Row: {
          created_at: string;
          description: string | null;
          event_id: string;
          id: string;
          resolved: boolean;
          severity: string;
          title: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          event_id: string;
          id?: string;
          resolved?: boolean;
          severity?: string;
          title: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          event_id?: string;
          id?: string;
          resolved?: boolean;
          severity?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_risks_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      event_tasks: {
        Row: {
          completed: boolean;
          created_at: string;
          description: string | null;
          due_date: string | null;
          event_id: string;
          id: string;
          position: number;
          title: string;
        };
        Insert: {
          completed?: boolean;
          created_at?: string;
          description?: string | null;
          due_date?: string | null;
          event_id: string;
          id?: string;
          position?: number;
          title: string;
        };
        Update: {
          completed?: boolean;
          created_at?: string;
          description?: string | null;
          due_date?: string | null;
          event_id?: string;
          id?: string;
          position?: number;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_tasks_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      event_vendors: {
        Row: {
          contact: string | null;
          created_at: string;
          event_id: string;
          id: string;
          name: string;
          notes: string | null;
          rating: number | null;
          service: string | null;
        };
        Insert: {
          contact?: string | null;
          created_at?: string;
          event_id: string;
          id?: string;
          name: string;
          notes?: string | null;
          rating?: number | null;
          service?: string | null;
        };
        Update: {
          contact?: string | null;
          created_at?: string;
          event_id?: string;
          id?: string;
          name?: string;
          notes?: string | null;
          rating?: number | null;
          service?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "event_vendors_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      events: {
        Row: {
          cloned_from_event_id: string | null;
          created_at: string;
          created_by: string;
          description: string | null;
          event_date: string | null;
          id: string;
          location: string | null;
          name: string;
          project_id: string | null;
          society_id: string;
          status: string;
        };
        Insert: {
          cloned_from_event_id?: string | null;
          created_at?: string;
          created_by: string;
          description?: string | null;
          event_date?: string | null;
          id?: string;
          location?: string | null;
          name: string;
          project_id?: string | null;
          society_id: string;
          status?: string;
        };
        Update: {
          cloned_from_event_id?: string | null;
          created_at?: string;
          created_by?: string;
          description?: string | null;
          event_date?: string | null;
          id?: string;
          location?: string | null;
          name?: string;
          project_id?: string | null;
          society_id?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "events_cloned_from_event_id_fkey";
            columns: ["cloned_from_event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_society_id_fkey";
            columns: ["society_id"];
            isOneToOne: false;
            referencedRelation: "societies";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          experience_tags: string[];
          full_name: string | null;
          id: string;
          skills: string[];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          experience_tags?: string[];
          full_name?: string | null;
          id: string;
          skills?: string[];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          experience_tags?: string[];
          full_name?: string | null;
          id?: string;
          skills?: string[];
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          created_at: string;
          created_by: string;
          description: string | null;
          id: string;
          name: string;
          society_id: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          description?: string | null;
          id?: string;
          name: string;
          society_id: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          description?: string | null;
          id?: string;
          name?: string;
          society_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_society_id_fkey";
            columns: ["society_id"];
            isOneToOne: false;
            referencedRelation: "societies";
            referencedColumns: ["id"];
          },
        ];
      };
      runsheet_blocks: {
        Row: {
          created_at: string;
          description: string | null;
          duration_minutes: number;
          event_id: string;
          id: string;
          position: number;
          start_time: string;
          title: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          duration_minutes?: number;
          event_id: string;
          id?: string;
          position?: number;
          start_time?: string;
          title: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          duration_minutes?: number;
          event_id?: string;
          id?: string;
          position?: number;
          start_time?: string;
          title?: string;
        };
        Relationships: [];
      };
      societies: {
        Row: {
          created_at: string;
          created_by: string;
          description: string | null;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          description?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          description?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      society_members: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["society_role"];
          society_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["society_role"];
          society_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["society_role"];
          society_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "society_members_society_id_fkey";
            columns: ["society_id"];
            isOneToOne: false;
            referencedRelation: "societies";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_manage_society: {
        Args: { _society_id: string; _user_id: string };
        Returns: boolean;
      };
      has_society_role: {
        Args: {
          _role: Database["public"]["Enums"]["society_role"];
          _society_id: string;
          _user_id: string;
        };
        Returns: boolean;
      };
      is_society_member: {
        Args: { _society_id: string; _user_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      society_role: "executive" | "project_owner" | "member";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      society_role: ["executive", "project_owner", "member"],
    },
  },
} as const;
