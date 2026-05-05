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
      activos: {
        Row: {
          actualizado_en: string
          actualizado_por: string | null
          cantidad: number | null
          categoria: Database["public"]["Enums"]["activo_categoria"]
          codigo_activo: string
          creado_en: string
          creado_por: string | null
          departamento_id: string | null
          descripcion: string | null
          documento_url: string | null
          especificaciones: Json | null
          estado_documento: string | null
          estado_garantia: Database["public"]["Enums"]["garantia_estado"]
          estado_operacional: Database["public"]["Enums"]["activo_estado"]
          fecha_compra: string | null
          fecha_vencimiento_garantia: string | null
          foto_url: string | null
          id: string
          ip_asignada: string | null
          mac_address: string | null
          marca: string | null
          modelo: string | null
          moneda: string | null
          nombre: string
          notas: string | null
          numero_contrato: string | null
          numero_factura: string | null
          numero_serie: string | null
          organizacion_id: string | null
          proveedor: string | null
          responsable_actual: string | null
          tipo: Database["public"]["Enums"]["activo_tipo"]
          ubicacion: string | null
          usuario_asignado: string | null
          valor_compra: number | null
          version: string | null
        }
        Insert: {
          actualizado_en?: string
          actualizado_por?: string | null
          cantidad?: number | null
          categoria: Database["public"]["Enums"]["activo_categoria"]
          codigo_activo?: string
          creado_en?: string
          creado_por?: string | null
          departamento_id?: string | null
          descripcion?: string | null
          documento_url?: string | null
          especificaciones?: Json | null
          estado_documento?: string | null
          estado_garantia?: Database["public"]["Enums"]["garantia_estado"]
          estado_operacional?: Database["public"]["Enums"]["activo_estado"]
          fecha_compra?: string | null
          fecha_vencimiento_garantia?: string | null
          foto_url?: string | null
          id?: string
          ip_asignada?: string | null
          mac_address?: string | null
          marca?: string | null
          modelo?: string | null
          moneda?: string | null
          nombre: string
          notas?: string | null
          numero_contrato?: string | null
          numero_factura?: string | null
          numero_serie?: string | null
          organizacion_id?: string | null
          proveedor?: string | null
          responsable_actual?: string | null
          tipo?: Database["public"]["Enums"]["activo_tipo"]
          ubicacion?: string | null
          usuario_asignado?: string | null
          valor_compra?: number | null
          version?: string | null
        }
        Update: {
          actualizado_en?: string
          actualizado_por?: string | null
          cantidad?: number | null
          categoria?: Database["public"]["Enums"]["activo_categoria"]
          codigo_activo?: string
          creado_en?: string
          creado_por?: string | null
          departamento_id?: string | null
          descripcion?: string | null
          documento_url?: string | null
          especificaciones?: Json | null
          estado_documento?: string | null
          estado_garantia?: Database["public"]["Enums"]["garantia_estado"]
          estado_operacional?: Database["public"]["Enums"]["activo_estado"]
          fecha_compra?: string | null
          fecha_vencimiento_garantia?: string | null
          foto_url?: string | null
          id?: string
          ip_asignada?: string | null
          mac_address?: string | null
          marca?: string | null
          modelo?: string | null
          moneda?: string | null
          nombre?: string
          notas?: string | null
          numero_contrato?: string | null
          numero_factura?: string | null
          numero_serie?: string | null
          organizacion_id?: string | null
          proveedor?: string | null
          responsable_actual?: string | null
          tipo?: Database["public"]["Enums"]["activo_tipo"]
          ubicacion?: string | null
          usuario_asignado?: string | null
          valor_compra?: number | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activos_departamento_id_fkey"
            columns: ["departamento_id"]
            isOneToOne: false
            referencedRelation: "departamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activos_organizacion_id_fkey"
            columns: ["organizacion_id"]
            isOneToOne: false
            referencedRelation: "organizaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      auditorias: {
        Row: {
          accion: string
          cambios_anteriores: Json | null
          cambios_nuevos: Json | null
          creado_en: string
          id: string
          ip_address: string | null
          registro_id: string | null
          tabla: string | null
          usuario_id: string | null
        }
        Insert: {
          accion: string
          cambios_anteriores?: Json | null
          cambios_nuevos?: Json | null
          creado_en?: string
          id?: string
          ip_address?: string | null
          registro_id?: string | null
          tabla?: string | null
          usuario_id?: string | null
        }
        Update: {
          accion?: string
          cambios_anteriores?: Json | null
          cambios_nuevos?: Json | null
          creado_en?: string
          id?: string
          ip_address?: string | null
          registro_id?: string | null
          tabla?: string | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      departamentos: {
        Row: {
          creado_en: string
          id: string
          nombre: string
          organizacion_id: string
          responsable: string | null
        }
        Insert: {
          creado_en?: string
          id?: string
          nombre: string
          organizacion_id: string
          responsable?: string | null
        }
        Update: {
          creado_en?: string
          id?: string
          nombre?: string
          organizacion_id?: string
          responsable?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departamentos_organizacion_id_fkey"
            columns: ["organizacion_id"]
            isOneToOne: false
            referencedRelation: "organizaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      movimientos_activos: {
        Row: {
          activo_id: string
          costo_asociado: number | null
          creado_en: string
          creado_por: string | null
          departamento_anterior: string | null
          departamento_nuevo: string | null
          fecha_movimiento: string
          id: string
          motivo: string | null
          notas: string | null
          responsable_anterior: string | null
          responsable_nuevo: string | null
          tipo_movimiento: Database["public"]["Enums"]["movimiento_tipo"]
        }
        Insert: {
          activo_id: string
          costo_asociado?: number | null
          creado_en?: string
          creado_por?: string | null
          departamento_anterior?: string | null
          departamento_nuevo?: string | null
          fecha_movimiento?: string
          id?: string
          motivo?: string | null
          notas?: string | null
          responsable_anterior?: string | null
          responsable_nuevo?: string | null
          tipo_movimiento: Database["public"]["Enums"]["movimiento_tipo"]
        }
        Update: {
          activo_id?: string
          costo_asociado?: number | null
          creado_en?: string
          creado_por?: string | null
          departamento_anterior?: string | null
          departamento_nuevo?: string | null
          fecha_movimiento?: string
          id?: string
          motivo?: string | null
          notas?: string | null
          responsable_anterior?: string | null
          responsable_nuevo?: string | null
          tipo_movimiento?: Database["public"]["Enums"]["movimiento_tipo"]
        }
        Relationships: [
          {
            foreignKeyName: "movimientos_activos_activo_id_fkey"
            columns: ["activo_id"]
            isOneToOne: false
            referencedRelation: "activos"
            referencedColumns: ["id"]
          },
        ]
      }
      organizaciones: {
        Row: {
          ciudad: string | null
          codigo: string
          creado_en: string
          id: string
          logo_url: string | null
          nombre: string
          pais: string | null
        }
        Insert: {
          ciudad?: string | null
          codigo: string
          creado_en?: string
          id?: string
          logo_url?: string | null
          nombre: string
          pais?: string | null
        }
        Update: {
          ciudad?: string | null
          codigo?: string
          creado_en?: string
          id?: string
          logo_url?: string | null
          nombre?: string
          pais?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          actualizado_en: string
          creado_en: string
          email: string
          estado: string
          id: string
          nombre: string
        }
        Insert: {
          actualizado_en?: string
          creado_en?: string
          email: string
          estado?: string
          id: string
          nombre: string
        }
        Update: {
          actualizado_en?: string
          creado_en?: string
          email?: string
          estado?: string
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      activo_categoria:
        | "PC"
        | "Notebook"
        | "Servidor"
        | "Impresora"
        | "Escaner"
        | "Celular"
        | "Tablet"
        | "Monitor"
        | "Teclado"
        | "Mouse"
        | "UPS"
        | "Router"
        | "Switch"
        | "Otro"
      activo_estado:
        | "Activo"
        | "Inactivo"
        | "En Reparacion"
        | "De Baja"
        | "En Deposito"
        | "Extraviado"
      activo_tipo: "Hardware" | "Software" | "Licencia" | "Otro"
      app_role: "administrador" | "coordinador" | "usuario"
      garantia_estado: "Vigente" | "Expirada" | "Sin Garantia"
      movimiento_tipo:
        | "Compra"
        | "Asignacion"
        | "Reasignacion"
        | "Traslado"
        | "Reparacion"
        | "Mantenimiento"
        | "Baja"
        | "Devolucion"
        | "Cambio de Responsable"
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
    Enums: {
      activo_categoria: [
        "PC",
        "Notebook",
        "Servidor",
        "Impresora",
        "Escaner",
        "Celular",
        "Tablet",
        "Monitor",
        "Teclado",
        "Mouse",
        "UPS",
        "Router",
        "Switch",
        "Otro",
      ],
      activo_estado: [
        "Activo",
        "Inactivo",
        "En Reparacion",
        "De Baja",
        "En Deposito",
        "Extraviado",
      ],
      activo_tipo: ["Hardware", "Software", "Licencia", "Otro"],
      app_role: ["administrador", "coordinador", "usuario"],
      garantia_estado: ["Vigente", "Expirada", "Sin Garantia"],
      movimiento_tipo: [
        "Compra",
        "Asignacion",
        "Reasignacion",
        "Traslado",
        "Reparacion",
        "Mantenimiento",
        "Baja",
        "Devolucion",
        "Cambio de Responsable",
      ],
    },
  },
} as const
