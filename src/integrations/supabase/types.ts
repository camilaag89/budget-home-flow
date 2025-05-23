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
      categories: {
        Row: {
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      constructions: {
        Row: {
          "Área Construída": number | null
          "Área do Terreno": number | null
          Cidade: string | null
          CNPJ: string | null
          Data: string | null
          Endereço: string | null
          "Full Text": string | null
          id: number
          latitude: number | null
          longitude: number | null
          "Nome da Empresa": string | null
          "Nome do Arquivo": string | null
          Status: string | null
          "Tipo de Licença": string | null
        }
        Insert: {
          "Área Construída"?: number | null
          "Área do Terreno"?: number | null
          Cidade?: string | null
          CNPJ?: string | null
          Data?: string | null
          Endereço?: string | null
          "Full Text"?: string | null
          id?: number
          latitude?: number | null
          longitude?: number | null
          "Nome da Empresa"?: string | null
          "Nome do Arquivo"?: string | null
          Status?: string | null
          "Tipo de Licença"?: string | null
        }
        Update: {
          "Área Construída"?: number | null
          "Área do Terreno"?: number | null
          Cidade?: string | null
          CNPJ?: string | null
          Data?: string | null
          Endereço?: string | null
          "Full Text"?: string | null
          id?: number
          latitude?: number | null
          longitude?: number | null
          "Nome da Empresa"?: string | null
          "Nome do Arquivo"?: string | null
          Status?: string | null
          "Tipo de Licença"?: string | null
        }
        Relationships: []
      }
      future_installments: {
        Row: {
          amount: number
          id: string
          installment_number: number
          month: string
          transaction_id: string
        }
        Insert: {
          amount: number
          id?: string
          installment_number: number
          month: string
          transaction_id: string
        }
        Update: {
          amount?: number
          id?: string
          installment_number?: number
          month?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "future_installments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      spending_goals: {
        Row: {
          amount: number
          category: string
          end_date: string | null
          id: string
          period: string
          start_date: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          end_date?: string | null
          id?: string
          period: string
          start_date: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          end_date?: string | null
          id?: string
          period?: string
          start_date?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string
          current_installment: number | null
          date: string
          description: string
          id: string
          installments: number | null
          payment_method: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          current_installment?: number | null
          date: string
          description: string
          id?: string
          installments?: number | null
          payment_method: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          current_installment?: number | null
          date?: string
          description?: string
          id?: string
          installments?: number | null
          payment_method?: string
          type?: string
          user_id?: string
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
