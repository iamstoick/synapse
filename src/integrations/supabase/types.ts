export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      mysql_connections: {
        Row: {
          created_at: string
          database_name: string | null
          host: string
          id: string
          is_active: boolean
          last_connected_at: string | null
          name: string
          password: string
          port: number
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          database_name?: string | null
          host: string
          id?: string
          is_active?: boolean
          last_connected_at?: string | null
          name: string
          password: string
          port?: number
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          database_name?: string | null
          host?: string
          id?: string
          is_active?: boolean
          last_connected_at?: string | null
          name?: string
          password?: string
          port?: number
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      mysql_metrics: {
        Row: {
          aborted_connects: number | null
          avg_query_time: number | null
          buffer_pool_hit_ratio: number | null
          bytes_received: number | null
          bytes_sent: number | null
          com_delete: number | null
          com_insert: number | null
          com_select: number | null
          com_update: number | null
          connection_id: string
          id: string
          innodb_buffer_pool_read_requests: number | null
          innodb_buffer_pool_reads: number | null
          innodb_buffer_pool_wait_free: number | null
          innodb_deadlocks: number | null
          innodb_log_waits: number | null
          innodb_row_lock_time_avg: number | null
          innodb_row_lock_waits: number | null
          key_buffer_hit_ratio: number | null
          key_read_requests: number | null
          key_reads: number | null
          max_used_connections: number | null
          queries_per_second: number | null
          slow_queries: number | null
          threads_connected: number | null
          threads_running: number | null
          timestamp: string
        }
        Insert: {
          aborted_connects?: number | null
          avg_query_time?: number | null
          buffer_pool_hit_ratio?: number | null
          bytes_received?: number | null
          bytes_sent?: number | null
          com_delete?: number | null
          com_insert?: number | null
          com_select?: number | null
          com_update?: number | null
          connection_id: string
          id?: string
          innodb_buffer_pool_read_requests?: number | null
          innodb_buffer_pool_reads?: number | null
          innodb_buffer_pool_wait_free?: number | null
          innodb_deadlocks?: number | null
          innodb_log_waits?: number | null
          innodb_row_lock_time_avg?: number | null
          innodb_row_lock_waits?: number | null
          key_buffer_hit_ratio?: number | null
          key_read_requests?: number | null
          key_reads?: number | null
          max_used_connections?: number | null
          queries_per_second?: number | null
          slow_queries?: number | null
          threads_connected?: number | null
          threads_running?: number | null
          timestamp?: string
        }
        Update: {
          aborted_connects?: number | null
          avg_query_time?: number | null
          buffer_pool_hit_ratio?: number | null
          bytes_received?: number | null
          bytes_sent?: number | null
          com_delete?: number | null
          com_insert?: number | null
          com_select?: number | null
          com_update?: number | null
          connection_id?: string
          id?: string
          innodb_buffer_pool_read_requests?: number | null
          innodb_buffer_pool_reads?: number | null
          innodb_buffer_pool_wait_free?: number | null
          innodb_deadlocks?: number | null
          innodb_log_waits?: number | null
          innodb_row_lock_time_avg?: number | null
          innodb_row_lock_waits?: number | null
          key_buffer_hit_ratio?: number | null
          key_read_requests?: number | null
          key_reads?: number | null
          max_used_connections?: number | null
          queries_per_second?: number | null
          slow_queries?: number | null
          threads_connected?: number | null
          threads_running?: number | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "mysql_metrics_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "mysql_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      redis_connections: {
        Row: {
          connection_string: string
          created_at: string | null
          host: string | null
          id: string
          is_active: boolean | null
          last_connected_at: string | null
          name: string | null
          password: string | null
          port: number | null
          server_name: string | null
          user_id: string
        }
        Insert: {
          connection_string: string
          created_at?: string | null
          host?: string | null
          id?: string
          is_active?: boolean | null
          last_connected_at?: string | null
          name?: string | null
          password?: string | null
          port?: number | null
          server_name?: string | null
          user_id: string
        }
        Update: {
          connection_string?: string
          created_at?: string | null
          host?: string | null
          id?: string
          is_active?: boolean | null
          last_connected_at?: string | null
          name?: string | null
          password?: string | null
          port?: number | null
          server_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      redis_metrics: {
        Row: {
          aof_base_size: number | null
          aof_current_size: number | null
          avg_response_time: number | null
          cache_hits: number | null
          cache_levels: Json | null
          cache_misses: number | null
          connected_clients: number | null
          connection_id: string | null
          cpu_utilization: number | null
          current_cow_size: number | null
          current_fork_perc: number | null
          db_size: number | null
          evicted_keys: number | null
          expired_keys: number | null
          hit_ratio: number | null
          id: string
          instantaneous_cpu_percentage: number | null
          instantaneous_ops_per_sec: number | null
          last_fork_usec: number | null
          max_clients: number | null
          mem_fragmentation_ratio: number | null
          memory_peak_bytes: number | null
          memory_total_bytes: number | null
          memory_used_bytes: number | null
          memory_wasted: number | null
          operations: Json | null
          rdb_bgsave_in_progress: number | null
          rdb_changes_since_last_save: number | null
          rdb_last_bgsave_time_sec: number | null
          rdb_last_cow_size: number | null
          rdb_last_save_time: number | null
          redis_version: string | null
          rejected_connections: number | null
          slowlog: Json | null
          timestamp: string | null
          total_commands_processed: number | null
          total_connections_received: number | null
          total_forks: number | null
          uptime_in_seconds: number | null
          used_cpu_sys: number | null
          used_cpu_user: number | null
        }
        Insert: {
          aof_base_size?: number | null
          aof_current_size?: number | null
          avg_response_time?: number | null
          cache_hits?: number | null
          cache_levels?: Json | null
          cache_misses?: number | null
          connected_clients?: number | null
          connection_id?: string | null
          cpu_utilization?: number | null
          current_cow_size?: number | null
          current_fork_perc?: number | null
          db_size?: number | null
          evicted_keys?: number | null
          expired_keys?: number | null
          hit_ratio?: number | null
          id?: string
          instantaneous_cpu_percentage?: number | null
          instantaneous_ops_per_sec?: number | null
          last_fork_usec?: number | null
          max_clients?: number | null
          mem_fragmentation_ratio?: number | null
          memory_peak_bytes?: number | null
          memory_total_bytes?: number | null
          memory_used_bytes?: number | null
          memory_wasted?: number | null
          operations?: Json | null
          rdb_bgsave_in_progress?: number | null
          rdb_changes_since_last_save?: number | null
          rdb_last_bgsave_time_sec?: number | null
          rdb_last_cow_size?: number | null
          rdb_last_save_time?: number | null
          redis_version?: string | null
          rejected_connections?: number | null
          slowlog?: Json | null
          timestamp?: string | null
          total_commands_processed?: number | null
          total_connections_received?: number | null
          total_forks?: number | null
          uptime_in_seconds?: number | null
          used_cpu_sys?: number | null
          used_cpu_user?: number | null
        }
        Update: {
          aof_base_size?: number | null
          aof_current_size?: number | null
          avg_response_time?: number | null
          cache_hits?: number | null
          cache_levels?: Json | null
          cache_misses?: number | null
          connected_clients?: number | null
          connection_id?: string | null
          cpu_utilization?: number | null
          current_cow_size?: number | null
          current_fork_perc?: number | null
          db_size?: number | null
          evicted_keys?: number | null
          expired_keys?: number | null
          hit_ratio?: number | null
          id?: string
          instantaneous_cpu_percentage?: number | null
          instantaneous_ops_per_sec?: number | null
          last_fork_usec?: number | null
          max_clients?: number | null
          mem_fragmentation_ratio?: number | null
          memory_peak_bytes?: number | null
          memory_total_bytes?: number | null
          memory_used_bytes?: number | null
          memory_wasted?: number | null
          operations?: Json | null
          rdb_bgsave_in_progress?: number | null
          rdb_changes_since_last_save?: number | null
          rdb_last_bgsave_time_sec?: number | null
          rdb_last_cow_size?: number | null
          rdb_last_save_time?: number | null
          redis_version?: string | null
          rejected_connections?: number | null
          slowlog?: Json | null
          timestamp?: string | null
          total_commands_processed?: number | null
          total_connections_received?: number | null
          total_forks?: number | null
          uptime_in_seconds?: number | null
          used_cpu_sys?: number | null
          used_cpu_user?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "redis_metrics_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "redis_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      redis_reboots: {
        Row: {
          connection_id: string | null
          created_at: string | null
          id: string
          previous_uptime_seconds: number | null
          reboot_time: string | null
        }
        Insert: {
          connection_id?: string | null
          created_at?: string | null
          id?: string
          previous_uptime_seconds?: number | null
          reboot_time?: string | null
        }
        Update: {
          connection_id?: string | null
          created_at?: string | null
          id?: string
          previous_uptime_seconds?: number | null
          reboot_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "redis_reboots_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "redis_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      redis_uptime_history: {
        Row: {
          connection_id: string | null
          id: string
          recorded_at: string
          server_rebooted: boolean | null
          uptime_seconds: number
        }
        Insert: {
          connection_id?: string | null
          id?: string
          recorded_at?: string
          server_rebooted?: boolean | null
          uptime_seconds: number
        }
        Update: {
          connection_id?: string | null
          id?: string
          recorded_at?: string
          server_rebooted?: boolean | null
          uptime_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "redis_uptime_history_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "redis_connections"
            referencedColumns: ["id"]
          },
        ]
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
