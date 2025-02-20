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
      candidates: {
        Row: {
          created_at: string
          email: string
          id: string
          job_id: string
          name: string
          phone: string
          resume_url: string | null
          status: string
          video_submitted_at: string | null
          video_token: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          job_id: string
          name: string
          phone: string
          resume_url?: string | null
          status?: string
          video_submitted_at?: string | null
          video_token?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          job_id?: string
          name?: string
          phone?: string
          resume_url?: string | null
          status?: string
          video_submitted_at?: string | null
          video_token?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      job_openings: {
        Row: {
          created_at: string
          department: string
          description: string
          id: string
          location: string
          public_page_enabled: boolean | null
          status: string
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          department: string
          description: string
          id?: string
          location: string
          public_page_enabled?: boolean | null
          status?: string
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          department?: string
          description?: string
          id?: string
          location?: string
          public_page_enabled?: boolean | null
          status?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pricing_plans: {
        Row: {
          created_at: string
          features: string[]
          id: string
          is_popular: boolean | null
          name: string
          price_monthly: number
          price_yearly: number
        }
        Insert: {
          created_at?: string
          features: string[]
          id?: string
          is_popular?: boolean | null
          name: string
          price_monthly: number
          price_yearly: number
        }
        Update: {
          created_at?: string
          features?: string[]
          id?: string
          is_popular?: boolean | null
          name?: string
          price_monthly?: number
          price_yearly?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          has_premium_access: boolean | null
          id: string
          last_login: string | null
          login_count: number | null
        }
        Insert: {
          created_at?: string
          has_premium_access?: boolean | null
          id: string
          last_login?: string | null
          login_count?: number | null
        }
        Update: {
          created_at?: string
          has_premium_access?: boolean | null
          id?: string
          last_login?: string | null
          login_count?: number | null
        }
        Relationships: []
      }
      video_request_logs: {
        Row: {
          created_at: string
          id: string
          request_count: number
          request_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          request_count: number
          request_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          request_count?: number
          request_date?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      send_video_invite: {
        Args: {
          payload: Json
        }
        Returns: Json
      }
      set_request_video_token: {
        Args: {
          token: string
        }
        Returns: undefined
      }
      validate_and_get_candidate: {
        Args: {
          token: string
        }
        Returns: {
          id: string
          job_id: string
          name: string
          email: string
          phone: string
          resume_url: string
          status: string
          created_at: string
          video_url: string
          video_token: string
          video_submitted_at: string
        }[]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
