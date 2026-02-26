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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_action_logs: {
        Row: {
          action_type: string
          admin_id: string
          admin_role: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          admin_role: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          admin_role?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      asaas_payments: {
        Row: {
          asaas_payment_id: string | null
          asaas_subscription_id: string | null
          created_at: string
          credits_amount: number
          due_date: string | null
          id: string
          invoice_url: string | null
          paid_at: string | null
          payment_method: string | null
          pix_copy_paste: string | null
          pix_qr_code: string | null
          plan_type: string
          status: string
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          asaas_payment_id?: string | null
          asaas_subscription_id?: string | null
          created_at?: string
          credits_amount: number
          due_date?: string | null
          id?: string
          invoice_url?: string | null
          paid_at?: string | null
          payment_method?: string | null
          pix_copy_paste?: string | null
          pix_qr_code?: string | null
          plan_type: string
          status?: string
          updated_at?: string
          user_id: string
          valor: number
        }
        Update: {
          asaas_payment_id?: string | null
          asaas_subscription_id?: string | null
          created_at?: string
          credits_amount?: number
          due_date?: string | null
          id?: string
          invoice_url?: string | null
          paid_at?: string | null
          payment_method?: string | null
          pix_copy_paste?: string | null
          pix_qr_code?: string | null
          plan_type?: string
          status?: string
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      asaas_subscriptions: {
        Row: {
          asaas_customer_id: string | null
          asaas_subscription_id: string
          created_at: string
          credits_per_cycle: number
          current_cycle: number
          id: string
          last_credit_reset_at: string | null
          next_billing_date: string | null
          plan_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          asaas_customer_id?: string | null
          asaas_subscription_id: string
          created_at?: string
          credits_per_cycle?: number
          current_cycle?: number
          id?: string
          last_credit_reset_at?: string | null
          next_billing_date?: string | null
          plan_type: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          asaas_customer_id?: string | null
          asaas_subscription_id?: string
          created_at?: string
          credits_per_cycle?: number
          current_cycle?: number
          id?: string
          last_credit_reset_at?: string | null
          next_billing_date?: string | null
          plan_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      asaas_webhook_logs: {
        Row: {
          action_taken: string | null
          asaas_payment_id: string | null
          asaas_subscription_id: string | null
          created_at: string
          credits_released: number | null
          error_message: string | null
          event_type: string
          id: string
          ip_address: string | null
          processed: boolean
          raw_payload: Json
        }
        Insert: {
          action_taken?: string | null
          asaas_payment_id?: string | null
          asaas_subscription_id?: string | null
          created_at?: string
          credits_released?: number | null
          error_message?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          processed?: boolean
          raw_payload: Json
        }
        Update: {
          action_taken?: string | null
          asaas_payment_id?: string | null
          asaas_subscription_id?: string | null
          created_at?: string
          credits_released?: number | null
          error_message?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          processed?: boolean
          raw_payload?: Json
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action_type: string
          created_at: string
          document_type: string | null
          document_version: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          document_type?: string | null
          document_version?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          document_type?: string | null
          document_version?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      business_branding_settings: {
        Row: {
          created_at: string
          display_name: string
          document_number: string
          id: string
          is_active: boolean | null
          logo_path: string | null
          primary_color: string | null
          secondary_color: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          document_number: string
          id?: string
          is_active?: boolean | null
          logo_path?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          document_number?: string
          id?: string
          is_active?: boolean | null
          logo_path?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          id: string
          issued_at: string
          last_downloaded_at: string | null
          registro_id: string
          reissued_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          issued_at?: string
          last_downloaded_at?: string | null
          registro_id: string
          reissued_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          issued_at?: string
          last_downloaded_at?: string | null
          registro_id?: string
          reissued_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_registro_id_fkey"
            columns: ["registro_id"]
            isOneToOne: true
            referencedRelation: "registros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_registro_id_fkey"
            columns: ["registro_id"]
            isOneToOne: true
            referencedRelation: "registros_verificacao_publica"
            referencedColumns: ["id"]
          },
        ]
      }
      credits: {
        Row: {
          available_credits: number
          created_at: string
          id: string
          last_ledger_id: string | null
          plan_type: string
          total_credits: number
          updated_at: string
          used_credits: number
          user_id: string
          version: number
        }
        Insert: {
          available_credits?: number
          created_at?: string
          id?: string
          last_ledger_id?: string | null
          plan_type?: string
          total_credits?: number
          updated_at?: string
          used_credits?: number
          user_id: string
          version?: number
        }
        Update: {
          available_credits?: number
          created_at?: string
          id?: string
          last_ledger_id?: string | null
          plan_type?: string
          total_credits?: number
          updated_at?: string
          used_credits?: number
          user_id?: string
          version?: number
        }
        Relationships: []
      }
      credits_ledger: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          created_by: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          operation: Database["public"]["Enums"]["credit_operation"]
          reason: string
          reference_id: string | null
          reference_type: string | null
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          created_by?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          operation: Database["public"]["Enums"]["credit_operation"]
          reason: string
          reference_id?: string | null
          reference_type?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          created_by?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          operation?: Database["public"]["Enums"]["credit_operation"]
          reason?: string
          reference_id?: string | null
          reference_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      data_requests: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          processed_at: string | null
          processed_by: string | null
          request_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          request_type: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          request_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      legal_documents: {
        Row: {
          content: string
          created_at: string
          document_type: string
          id: string
          is_active: boolean
          title: string
          updated_at: string
          version: string
        }
        Insert: {
          content: string
          created_at?: string
          document_type: string
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
          version: string
        }
        Update: {
          content?: string
          created_at?: string
          document_type?: string
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      pagamentos: {
        Row: {
          created_at: string
          id: string
          metodo_pagamento: string | null
          moeda: string
          registro_id: string
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          created_at?: string
          id?: string
          metodo_pagamento?: string | null
          moeda?: string
          registro_id: string
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id: string
          valor: number
        }
        Update: {
          created_at?: string
          id?: string
          metodo_pagamento?: string | null
          moeda?: string
          registro_id?: string
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_registro_id_fkey"
            columns: ["registro_id"]
            isOneToOne: false
            referencedRelation: "registros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_registro_id_fkey"
            columns: ["registro_id"]
            isOneToOne: false
            referencedRelation: "registros_verificacao_publica"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_links: {
        Row: {
          code: string
          created_at: string
          created_by: string
          id: string
          is_active: boolean
        }
        Insert: {
          code: string
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
        }
        Relationships: []
      }
      processing_logs: {
        Row: {
          attempt_number: number
          calendar_used: string | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          execution_time_ms: number | null
          id: string
          registro_id: string
          started_at: string
          success: boolean
        }
        Insert: {
          attempt_number?: number
          calendar_used?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          registro_id: string
          started_at?: string
          success?: boolean
        }
        Update: {
          attempt_number?: number
          calendar_used?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          registro_id?: string
          started_at?: string
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "processing_logs_registro_id_fkey"
            columns: ["registro_id"]
            isOneToOne: false
            referencedRelation: "registros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processing_logs_registro_id_fkey"
            columns: ["registro_id"]
            isOneToOne: false
            referencedRelation: "registros_verificacao_publica"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          blocked_at: string | null
          blocked_reason: string | null
          company_name: string | null
          cpf_cnpj: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          instagram_url: string | null
          is_blocked: boolean
          is_partner: boolean
          partner_link_id: string | null
          partner_status: string | null
          phone: string | null
          tiktok_url: string | null
          unlimited_credits: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          blocked_at?: string | null
          blocked_reason?: string | null
          company_name?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          instagram_url?: string | null
          is_blocked?: boolean
          is_partner?: boolean
          partner_link_id?: string | null
          partner_status?: string | null
          phone?: string | null
          tiktok_url?: string | null
          unlimited_credits?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          blocked_at?: string | null
          blocked_reason?: string | null
          company_name?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          instagram_url?: string | null
          is_blocked?: boolean
          is_partner?: boolean
          partner_link_id?: string | null
          partner_status?: string | null
          phone?: string | null
          tiktok_url?: string | null
          unlimited_credits?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_partner_link_id_fkey"
            columns: ["partner_link_id"]
            isOneToOne: false
            referencedRelation: "partner_links"
            referencedColumns: ["id"]
          },
        ]
      }
      project_logs: {
        Row: {
          action_type: string
          created_at: string
          details: Json | null
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          details?: Json | null
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          document_number: string
          document_type: string
          email: string | null
          id: string
          name: string
          notes: string | null
          owner_user_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_number: string
          document_type: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          owner_user_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_number?: string
          document_type?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          owner_user_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      record_authors: {
        Row: {
          created_at: string
          display_order: number
          document_number: string
          document_type: string
          email: string
          id: string
          name: string
          registro_id: string
          role: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          document_number: string
          document_type: string
          email: string
          id?: string
          name: string
          registro_id: string
          role: string
        }
        Update: {
          created_at?: string
          display_order?: number
          document_number?: string
          document_type?: string
          email?: string
          id?: string
          name?: string
          registro_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "record_authors_registro_id_fkey"
            columns: ["registro_id"]
            isOneToOne: false
            referencedRelation: "registros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "record_authors_registro_id_fkey"
            columns: ["registro_id"]
            isOneToOne: false
            referencedRelation: "registros_verificacao_publica"
            referencedColumns: ["id"]
          },
        ]
      }
      registros: {
        Row: {
          arquivo_nome: string
          arquivo_path: string
          arquivo_tamanho: number | null
          created_at: string
          descricao: string | null
          error_message: string | null
          hash_sha256: string | null
          id: string
          nome_ativo: string
          project_id: string | null
          status: Database["public"]["Enums"]["registro_status"]
          tipo_ativo: Database["public"]["Enums"]["tipo_ativo"]
          titular_document: string | null
          titular_name: string | null
          titular_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          arquivo_nome: string
          arquivo_path: string
          arquivo_tamanho?: number | null
          created_at?: string
          descricao?: string | null
          error_message?: string | null
          hash_sha256?: string | null
          id?: string
          nome_ativo: string
          project_id?: string | null
          status?: Database["public"]["Enums"]["registro_status"]
          tipo_ativo?: Database["public"]["Enums"]["tipo_ativo"]
          titular_document?: string | null
          titular_name?: string | null
          titular_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          arquivo_nome?: string
          arquivo_path?: string
          arquivo_tamanho?: number | null
          created_at?: string
          descricao?: string | null
          error_message?: string | null
          hash_sha256?: string | null
          id?: string
          nome_ativo?: string
          project_id?: string | null
          status?: Database["public"]["Enums"]["registro_status"]
          tipo_ativo?: Database["public"]["Enums"]["tipo_ativo"]
          titular_document?: string | null
          titular_name?: string | null
          titular_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registros_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      transacoes_blockchain: {
        Row: {
          block_number: number | null
          confirmations: number | null
          confirmed_at: string | null
          created_at: string
          gas_used: number | null
          id: string
          network: string
          proof_data: string | null
          registro_id: string
          timestamp_blockchain: string | null
          timestamp_method:
            | Database["public"]["Enums"]["timestamp_method"]
            | null
          tx_hash: string
        }
        Insert: {
          block_number?: number | null
          confirmations?: number | null
          confirmed_at?: string | null
          created_at?: string
          gas_used?: number | null
          id?: string
          network?: string
          proof_data?: string | null
          registro_id: string
          timestamp_blockchain?: string | null
          timestamp_method?:
            | Database["public"]["Enums"]["timestamp_method"]
            | null
          tx_hash: string
        }
        Update: {
          block_number?: number | null
          confirmations?: number | null
          confirmed_at?: string | null
          created_at?: string
          gas_used?: number | null
          id?: string
          network?: string
          proof_data?: string | null
          registro_id?: string
          timestamp_blockchain?: string | null
          timestamp_method?:
            | Database["public"]["Enums"]["timestamp_method"]
            | null
          tx_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "transacoes_blockchain_registro_id_fkey"
            columns: ["registro_id"]
            isOneToOne: true
            referencedRelation: "registros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_blockchain_registro_id_fkey"
            columns: ["registro_id"]
            isOneToOne: true
            referencedRelation: "registros_verificacao_publica"
            referencedColumns: ["id"]
          },
        ]
      }
      user_consents: {
        Row: {
          accepted_at: string
          document_type: string
          document_version: string
          id: string
          ip_address: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string
          document_type: string
          document_version: string
          id?: string
          ip_address?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string
          document_type?: string
          document_version?: string
          id?: string
          ip_address?: string | null
          user_id?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
      registros_verificacao_publica: {
        Row: {
          arquivo_nome: string | null
          created_at: string | null
          hash_sha256: string | null
          id: string | null
          nome_ativo: string | null
          status: Database["public"]["Enums"]["registro_status"] | null
          tipo_ativo: Database["public"]["Enums"]["tipo_ativo"] | null
        }
        Insert: {
          arquivo_nome?: string | null
          created_at?: string | null
          hash_sha256?: string | null
          id?: string | null
          nome_ativo?: string | null
          status?: Database["public"]["Enums"]["registro_status"] | null
          tipo_ativo?: Database["public"]["Enums"]["tipo_ativo"] | null
        }
        Update: {
          arquivo_nome?: string | null
          created_at?: string | null
          hash_sha256?: string | null
          id?: string | null
          nome_ativo?: string | null
          status?: Database["public"]["Enums"]["registro_status"] | null
          tipo_ativo?: Database["public"]["Enums"]["tipo_ativo"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_credits: {
        Args: { p_credits: number; p_plan_type: string; p_user_id: string }
        Returns: boolean
      }
      add_credits_admin: {
        Args: {
          p_admin_id: string
          p_amount: number
          p_reason: string
          p_user_id: string
        }
        Returns: Json
      }
      add_credits_atomic: {
        Args: {
          p_amount: number
          p_is_subscription?: boolean
          p_metadata?: Json
          p_reason: string
          p_reference_id: string
          p_reference_type: string
          p_user_id: string
        }
        Returns: Json
      }
      adjust_credit_atomic: {
        Args: {
          p_admin_id: string
          p_new_balance: number
          p_reason: string
          p_user_id: string
        }
        Returns: Json
      }
      check_duplicate_hash: {
        Args: { p_hash: string; p_user_id: string }
        Returns: Json
      }
      consume_credit: { Args: { p_user_id: string }; Returns: boolean }
      consume_credit_atomic: {
        Args: { p_reason?: string; p_registro_id: string; p_user_id: string }
        Returns: Json
      }
      consume_credit_safe: {
        Args: { p_registro_id: string; p_user_id: string }
        Returns: Json
      }
      get_ledger_balance: { Args: { p_user_id: string }; Returns: number }
      get_payment_user_id: {
        Args: { p_asaas_payment_id: string }
        Returns: string
      }
      get_project_registros_count: {
        Args: { _project_id: string }
        Returns: number
      }
      get_subscription_user_id: {
        Args: { p_asaas_subscription_id: string }
        Returns: string
      }
      get_user_admin_role: { Args: { _user_id: string }; Returns: string }
      handle_partner_approval: {
        Args: { p_action: string; p_admin_id: string; p_user_id: string }
        Returns: Json
      }
      handle_payment_refund: {
        Args: { p_asaas_payment_id: string; p_refund_amount?: number }
        Returns: Json
      }
      has_active_business_plan: { Args: { _user_id: string }; Returns: boolean }
      has_any_admin_role: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      reconcile_credit_balance: { Args: { p_user_id: string }; Returns: Json }
      refund_credit_atomic: {
        Args: {
          p_admin_id: string
          p_amount: number
          p_reason: string
          p_reference_id: string
          p_user_id: string
        }
        Returns: Json
      }
      release_credits_from_payment: {
        Args: {
          p_asaas_payment_id: string
          p_credits: number
          p_is_subscription?: boolean
          p_plan_type: string
          p_user_id: string
        }
        Returns: Json
      }
      update_subscription_status: {
        Args: {
          p_asaas_subscription_id: string
          p_next_billing_date?: string
          p_status: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "user"
        | "super_admin"
        | "suporte"
        | "financeiro"
        | "auditor"
      credit_operation: "ADD" | "CONSUME" | "REFUND" | "ADJUST" | "EXPIRE"
      registro_status: "pendente" | "processando" | "confirmado" | "falhou"
      timestamp_method: "OPEN_TIMESTAMP" | "BYTESTAMP" | "SMART_CONTRACT"
      tipo_ativo:
        | "marca"
        | "logotipo"
        | "obra_autoral"
        | "documento"
        | "outro"
        | "imagem"
        | "video"
        | "audio"
        | "codigo"
        | "planilha"
        | "evidencia"
        | "pdf"
        | "texto"
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
      app_role: [
        "admin",
        "user",
        "super_admin",
        "suporte",
        "financeiro",
        "auditor",
      ],
      credit_operation: ["ADD", "CONSUME", "REFUND", "ADJUST", "EXPIRE"],
      registro_status: ["pendente", "processando", "confirmado", "falhou"],
      timestamp_method: ["OPEN_TIMESTAMP", "BYTESTAMP", "SMART_CONTRACT"],
      tipo_ativo: [
        "marca",
        "logotipo",
        "obra_autoral",
        "documento",
        "outro",
        "imagem",
        "video",
        "audio",
        "codigo",
        "planilha",
        "evidencia",
        "pdf",
        "texto",
      ],
    },
  },
} as const
