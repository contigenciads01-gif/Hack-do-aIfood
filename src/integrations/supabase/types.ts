export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          user_id: string;
          nome: string;
          categoria: string;
          cidade: string | null;
          whatsapp: string | null;
          instagram: string | null;
          horario: string | null;
          slogan: string | null;
          tem_logo: boolean;
          logo_path: string | null;
          cores: Json;
          personalidade: string[];
          tom: string | null;
          publico: string[];
          faixa_preco: string | null;
          diferenciais: string[];
          estilo_visual: string | null;
          data_inicio: string;
          nivel: number;
          cadastro_passo: number;
          cadastro_concluido?: boolean | null;
          banner_path?: string | null;
          site?: string | null;
          email_publico?: string | null;
          endereco?: Json | null;
          mostrar_endereco_anuncios?: boolean | null;
          formas_atendimento?: string[] | null;
          horario_funcionamento?: Json | null;
          created_at?: string;
          updated_at?: string;
          criado_em?: string;
          atualizado_em?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          nome: string;
          categoria: string;
          cidade?: string | null;
          whatsapp?: string | null;
          instagram?: string | null;
          horario?: string | null;
          slogan?: string | null;
          tem_logo?: boolean;
          logo_path?: string | null;
          cores?: Json;
          personalidade?: string[];
          tom?: string | null;
          publico?: string[];
          faixa_preco?: string | null;
          diferenciais?: string[];
          estilo_visual?: string | null;
          data_inicio?: string;
          nivel?: number;
          cadastro_passo?: number;
          cadastro_concluido?: boolean | null;
          banner_path?: string | null;
          site?: string | null;
          email_publico?: string | null;
          endereco?: Json | null;
          mostrar_endereco_anuncios?: boolean | null;
          formas_atendimento?: string[] | null;
          horario_funcionamento?: Json | null;
          created_at?: string;
          updated_at?: string;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          nome?: string;
          categoria?: string;
          cidade?: string | null;
          whatsapp?: string | null;
          instagram?: string | null;
          horario?: string | null;
          slogan?: string | null;
          tem_logo?: boolean;
          logo_path?: string | null;
          cores?: Json;
          personalidade?: string[];
          tom?: string | null;
          publico?: string[];
          faixa_preco?: string | null;
          diferenciais?: string[];
          estilo_visual?: string | null;
          data_inicio?: string;
          nivel?: number;
          cadastro_passo?: number;
          cadastro_concluido?: boolean | null;
          banner_path?: string | null;
          site?: string | null;
          email_publico?: string | null;
          endereco?: Json | null;
          mostrar_endereco_anuncios?: boolean | null;
          formas_atendimento?: string[] | null;
          horario_funcionamento?: Json | null;
          created_at?: string;
          updated_at?: string;
          criado_em?: string;
          atualizado_em?: string;
        };
        Relationships: [];
      };
      pratos: {
        Row: {
          id: string;
          user_id: string;
          nome: string;
          ingredientes?: string[] | null;
          preco?: number | null;
          destaque?: string | null;
          criado_em: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          nome: string;
          ingredientes?: string[] | null;
          preco?: number | null;
          destaque?: string | null;
          criado_em?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          nome?: string;
          ingredientes?: string[] | null;
          preco?: number | null;
          destaque?: string | null;
          criado_em?: string;
        };
        Relationships: [];
      };
      prato_fotos: {
        Row: {
          id: string;
          prato_id: string;
          user_id: string;
          slot: number;
          storage_path: string;
          criado_em: string;
        };
        Insert: {
          id?: string;
          prato_id: string;
          user_id: string;
          slot: number;
          storage_path: string;
          criado_em?: string;
        };
        Update: {
          id?: string;
          prato_id?: string;
          user_id?: string;
          slot?: number;
          storage_path?: string;
          criado_em?: string;
        };
        Relationships: [];
      };
      prompt_drafts: {
        Row: {
          id: string;
          user_id: string;
          tool: string;
          values: Json;
          template: string;
          texto: string | null;
          original: string | null;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tool: string;
          values?: Json;
          template: string;
          texto?: string | null;
          original?: string | null;
          atualizado_em?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tool?: string;
          values?: Json;
          template?: string;
          texto?: string | null;
          original?: string | null;
          atualizado_em?: string;
        };
        Relationships: [];
      };
      materials: {
        Row: {
          id: string;
          user_id: string;
          tool: string;
          template: string;
          title: string;
          text: string;
          original: string | null;
          summary: Json;
          criado_em: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tool: string;
          template: string;
          title: string;
          text: string;
          original?: string | null;
          summary?: Json;
          criado_em?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tool?: string;
          template?: string;
          title?: string;
          text?: string;
          original?: string | null;
          summary?: Json;
          criado_em?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
