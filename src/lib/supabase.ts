import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      locations: {
        Row: {
          id: string
          label: string
          country_code: string
          state: string | null
          city: string | null
          lat: number
          lng: number
          created_at: string
        }
        Insert: {
          id?: string
          label: string
          country_code: string
          state?: string | null
          city?: string | null
          lat: number
          lng: number
          created_at?: string
        }
        Update: {
          id?: string
          label?: string
          country_code?: string
          state?: string | null
          city?: string | null
          lat?: number
          lng?: number
          created_at?: string
        }
      }
    }
  }
}