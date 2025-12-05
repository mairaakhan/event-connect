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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      booking_items: {
        Row: {
          booking_id: string
          category_id: string | null
          category_name: string
          id: string
          price: number
          quantity: number
        }
        Insert: {
          booking_id: string
          category_id?: string | null
          category_name: string
          id?: string
          price: number
          quantity: number
        }
        Update: {
          booking_id?: string
          category_id?: string | null
          category_name?: string
          id?: string
          price?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "booking_items_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ticket_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          created_at: string
          discount_applied: number | null
          event_id: string
          event_name: string
          expires_at: string
          id: string
          paid_by: string | null
          payment_method: string | null
          platform_commission: number
          status: string | null
          total_amount: number
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          discount_applied?: number | null
          event_id: string
          event_name: string
          expires_at: string
          id?: string
          paid_by?: string | null
          payment_method?: string | null
          platform_commission?: number
          status?: string | null
          total_amount: number
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          discount_applied?: number | null
          event_id?: string
          event_name?: string
          expires_at?: string
          id?: string
          paid_by?: string | null
          payment_method?: string | null
          platform_commission?: number
          status?: string | null
          total_amount?: number
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      event_schedules: {
        Row: {
          created_at: string
          day_date: string
          end_time: string
          event_id: string
          id: string
          start_time: string
        }
        Insert: {
          created_at?: string
          day_date: string
          end_time: string
          event_id: string
          id?: string
          start_time: string
        }
        Update: {
          created_at?: string
          day_date?: string
          end_time?: string
          event_id?: string
          id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_schedules_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          category: string
          city: string
          created_at: string
          description: string | null
          early_bird_deadline: string | null
          early_bird_discount: number | null
          end_date: string | null
          external_id: string | null
          flash_sale_discount: number | null
          flash_sale_end: string | null
          flash_sale_start: string | null
          group_booking_discount: number | null
          group_booking_min_tickets: number | null
          id: string
          image: string | null
          name: string
          requires_registration: boolean | null
          sold_tickets: number
          source: string | null
          start_date: string
          status: string | null
          ticket_price: number
          tickets_live_from: string
          total_tickets: number
          updated_at: string
          vendor_id: string | null
          vendor_name: string | null
          venue: string
        }
        Insert: {
          category: string
          city: string
          created_at?: string
          description?: string | null
          early_bird_deadline?: string | null
          early_bird_discount?: number | null
          end_date?: string | null
          external_id?: string | null
          flash_sale_discount?: number | null
          flash_sale_end?: string | null
          flash_sale_start?: string | null
          group_booking_discount?: number | null
          group_booking_min_tickets?: number | null
          id?: string
          image?: string | null
          name: string
          requires_registration?: boolean | null
          sold_tickets?: number
          source?: string | null
          start_date: string
          status?: string | null
          ticket_price?: number
          tickets_live_from: string
          total_tickets?: number
          updated_at?: string
          vendor_id?: string | null
          vendor_name?: string | null
          venue: string
        }
        Update: {
          category?: string
          city?: string
          created_at?: string
          description?: string | null
          early_bird_deadline?: string | null
          early_bird_discount?: number | null
          end_date?: string | null
          external_id?: string | null
          flash_sale_discount?: number | null
          flash_sale_end?: string | null
          flash_sale_start?: string | null
          group_booking_discount?: number | null
          group_booking_min_tickets?: number | null
          id?: string
          image?: string | null
          name?: string
          requires_registration?: boolean | null
          sold_tickets?: number
          source?: string | null
          start_date?: string
          status?: string | null
          ticket_price?: number
          tickets_live_from?: string
          total_tickets?: number
          updated_at?: string
          vendor_id?: string | null
          vendor_name?: string | null
          venue?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_categories: {
        Row: {
          created_at: string
          description: string | null
          event_id: string
          id: string
          name: string
          price: number
          quantity: number
          sold: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_id: string
          id?: string
          name: string
          price: number
          quantity?: number
          sold?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          event_id?: string
          id?: string
          name?: string
          price?: number
          quantity?: number
          sold?: number
        }
        Relationships: [
          {
            foreignKeyName: "ticket_categories_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          account_holder_name: string | null
          account_number: string | null
          bank_name: string | null
          city: string
          contact_person: string
          created_at: string
          email: string
          iban: string | null
          id: string
          mobile_wallet: string | null
          organization_name: string
          password_hash: string
          payment_method_type: string | null
          phone: string
          registration_details: string | null
          updated_at: string
        }
        Insert: {
          account_holder_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          city: string
          contact_person: string
          created_at?: string
          email: string
          iban?: string | null
          id?: string
          mobile_wallet?: string | null
          organization_name: string
          password_hash: string
          payment_method_type?: string | null
          phone: string
          registration_details?: string | null
          updated_at?: string
        }
        Update: {
          account_holder_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          city?: string
          contact_person?: string
          created_at?: string
          email?: string
          iban?: string | null
          id?: string
          mobile_wallet?: string | null
          organization_name?: string
          password_hash?: string
          payment_method_type?: string | null
          phone?: string
          registration_details?: string | null
          updated_at?: string
        }
        Relationships: []
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
