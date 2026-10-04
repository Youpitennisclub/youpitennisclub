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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          cancel_token: string
          cancelled_at: string | null
          charged_cents: number
          confirmed_at: string | null
          created_at: string
          duration: number
          email: string
          first_name: string
          id: string
          last_name: string
          level: Database["public"]["Enums"]["tennis_level"]
          non_member: boolean
          phone: string
          photo_url: string | null
          starts_at: string
          user_id: string | null
          venue: string
        }
        Insert: {
          cancel_token?: string
          cancelled_at?: string | null
          charged_cents?: number
          confirmed_at?: string | null
          created_at?: string
          duration?: number
          email: string
          first_name: string
          id?: string
          last_name: string
          level: Database["public"]["Enums"]["tennis_level"]
          non_member?: boolean
          phone: string
          photo_url?: string | null
          starts_at: string
          user_id?: string | null
          venue?: string
        }
        Update: {
          cancel_token?: string
          cancelled_at?: string | null
          charged_cents?: number
          confirmed_at?: string | null
          created_at?: string
          duration?: number
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          level?: Database["public"]["Enums"]["tennis_level"]
          non_member?: boolean
          phone?: string
          photo_url?: string | null
          starts_at?: string
          user_id?: string | null
          venue?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount_cents: number
          booking_id: string | null
          created_at: string
          id: string
          reason: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          booking_id?: string | null
          created_at?: string
          id?: string
          reason: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          booking_id?: string | null
          created_at?: string
          id?: string
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          comment: string
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string | null
          photo_url: string | null
          rating: number
        }
        Insert: {
          comment: string
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name?: string | null
          photo_url?: string | null
          rating: number
        }
        Update: {
          comment?: string
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string | null
          photo_url?: string | null
          rating?: number
        }
        Relationships: []
      }
      student_credits: {
        Row: {
          balance_cents: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance_cents?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance_cents?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_credit: {
        Args: {
          _amount_cents: number
          _booking_id?: string
          _reason: string
          _user_id: string
        }
        Returns: number
      }
      get_public_bookings: {
        Args: { from_ts: string }
        Returns: {
          confirmed: boolean
          first_name: string
          last_initials: string
          level: Database["public"]["Enums"]["tennis_level"]
          photo_url: string
          starts_at: string
          venue: string
        }[]
      }
      get_public_feedback: {
        Args: never
        Returns: {
          comment: string
          created_at: string
          first_name: string
          last_initial: string
          photo_url: string
          rating: number
        }[]
      }
      submit_feedback: {
        Args: {
          _comment: string
          _email: string
          _first_name: string
          _last_name?: string
          _photo_url?: string
          _rating: number
        }
        Returns: undefined
      }
    }
    Enums: {
      tennis_level: "beginner" | "intermediate" | "advanced" | "total_beginner"
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
    Enums: {
      tennis_level: ["beginner", "intermediate", "advanced", "total_beginner"],
    },
  },
} as const
