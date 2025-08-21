export type Database = {
  public: {
    Tables: {
      weddings: {
        Row: {
          id: string
          slug: string
          couple_names: string
          wedding_date: string | null
          theme_color: string
          is_active: boolean
          created_at: string
          updated_at: string
          metadata: Record<string, any>
        }
        Insert: {
          id?: string
          slug: string
          couple_names: string
          wedding_date?: string | null
          theme_color?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
          metadata?: Record<string, any>
        }
        Update: {
          id?: string
          slug?: string
          couple_names?: string
          wedding_date?: string | null
          theme_color?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
          metadata?: Record<string, any>
        }
      }
      wedding_guests: {
        Row: {
          id: string
          wedding_id: string
          first_name: string
          last_name: string
          full_name: string
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wedding_id: string
          first_name: string
          last_name: string
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wedding_id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      memories: {
        Row: {
          id: string
          wedding_id: string
          guest_id: string | null
          guest_name: string | null
          memory_text: string
          memory_type: 'bride' | 'groom' | 'both'
          group_id: string | null
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'failed_permanent'
          ai_category: string | null
          ai_summary: string | null
          category: string | null
          category_confidence: number | null
          categorization_metadata: Record<string, any> | null
          retry_count: number
          processing_started_at: string | null
          processing_completed_at: string | null
          processing_error: string | null
          created_at: string
          updated_at: string
          metadata: Record<string, any>
        }
        Insert: {
          id?: string
          wedding_id: string
          guest_id?: string | null
          guest_name?: string | null
          memory_text: string
          memory_type?: 'bride' | 'groom' | 'both'
          group_id?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'failed_permanent'
          ai_category?: string | null
          ai_summary?: string | null
          category?: string | null
          category_confidence?: number | null
          categorization_metadata?: Record<string, any> | null
          retry_count?: number
          processing_started_at?: string | null
          processing_completed_at?: string | null
          processing_error?: string | null
          created_at?: string
          updated_at?: string
          metadata?: Record<string, any>
        }
        Update: {
          id?: string
          wedding_id?: string
          guest_id?: string | null
          guest_name?: string | null
          memory_text?: string
          memory_type?: 'bride' | 'groom' | 'both'
          group_id?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'failed_permanent'
          ai_category?: string | null
          ai_summary?: string | null
          category?: string | null
          category_confidence?: number | null
          categorization_metadata?: Record<string, any> | null
          retry_count?: number
          processing_started_at?: string | null
          processing_completed_at?: string | null
          processing_error?: string | null
          created_at?: string
          updated_at?: string
          metadata?: Record<string, any>
        }
      }
      memory_photos: {
        Row: {
          id: string
          memory_id: string
          storage_path: string
          url: string
          thumbnail_url: string | null
          width: number | null
          height: number | null
          size_bytes: number | null
          mime_type: string | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          memory_id: string
          storage_path: string
          url: string
          thumbnail_url?: string | null
          width?: number | null
          height?: number | null
          size_bytes?: number | null
          mime_type?: string | null
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          memory_id?: string
          storage_path?: string
          url?: string
          thumbnail_url?: string | null
          width?: number | null
          height?: number | null
          size_bytes?: number | null
          mime_type?: string | null
          display_order?: number
          created_at?: string
        }
      }
      memory_groups: {
        Row: {
          id: string
          wedding_id: string
          title: string
          summary: string | null
          memory_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wedding_id: string
          title: string
          summary?: string | null
          memory_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wedding_id?: string
          title?: string
          summary?: string | null
          memory_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      memory_embeddings: {
        Row: {
          id: string
          memory_id: string
          qdrant_point_id: string
          embedding_model: string
          created_at: string
        }
        Insert: {
          id?: string
          memory_id: string
          qdrant_point_id: string
          embedding_model?: string
          created_at?: string
        }
        Update: {
          id?: string
          memory_id?: string
          qdrant_point_id?: string
          embedding_model?: string
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}