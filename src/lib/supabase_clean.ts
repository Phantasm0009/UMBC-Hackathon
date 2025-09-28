import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key_abcdef123456'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client that can bypass RLS (for server-side operations)
export const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase // fallback to regular client if no service key

// Check if we have real Supabase credentials
export const hasRealSupabase = () => {
  return supabaseUrl !== 'https://dummy-project.supabase.co' && 
         supabaseAnonKey !== 'dummy_key_abcdef123456'
}

// Supabase helper functions
export const supabaseHelpers = {
  // Fetch alerts from Supabase
  async fetchAlerts(): Promise<Alert[]> {
    try {
      if (!hasRealSupabase()) {
        throw new Error('No real Supabase credentials')
      }
      
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (error) throw error
      
      return data.map(alert => ({
        ...alert,
        location_lat: alert.latitude || alert.location_lat,
        location_lng: alert.longitude || alert.location_lng,
      })) as Alert[]
    } catch (error) {
      console.error('Error fetching alerts from Supabase:', error)
      throw error
    }
  },

  // Fetch reports from Supabase
  async fetchReports(): Promise<Report[]> {
    try {
      if (!hasRealSupabase()) {
        throw new Error('No real Supabase credentials')
      }
      
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      
      if (error) throw error
      return data as Report[]
    } catch (error) {
      console.error('Error fetching reports from Supabase:', error)
      throw error
    }
  },

  // Insert new alert
  async insertAlert(alert: Omit<Alert, 'id' | 'created_at'>): Promise<Alert> {
    try {
      if (!hasRealSupabase()) {
        throw new Error('No real Supabase credentials')
      }
      
      const { data, error } = await supabase
        .from('alerts')
        .insert([{
          ...alert,
          latitude: alert.location_lat,
          longitude: alert.location_lng,
        }])
        .select()
        .single()
      
      if (error) throw error
      
      return {
        ...data,
        location_lat: data.latitude || data.location_lat,
        location_lng: data.longitude || data.location_lng,
      } as Alert
    } catch (error) {
      console.error('Error inserting alert to Supabase:', error)
      throw error
    }
  },

  // Insert new report
  async insertReport(report: Omit<Report, 'id' | 'created_at'>): Promise<Report> {
    try {
      if (!hasRealSupabase()) {
        throw new Error('No real Supabase credentials')
      }
      
      // Use admin client to bypass RLS for report creation
      const client = supabaseServiceRoleKey ? supabaseAdmin : supabase
      const { data, error } = await client
        .from('reports')
        .insert([report])
        .select()
        .single()
      
      if (error) throw error
      return data as Report
    } catch (error) {
      console.error('Error inserting report to Supabase:', error)
      throw error
    }
  },

  // Update report status
  async updateReportStatus(id: string, status: Report['status'], severity?: 'low' | 'medium' | 'high' | 'critical'): Promise<Report> {
    try {
      if (!hasRealSupabase()) {
        throw new Error('No real Supabase credentials')
      }
      
      // Use admin client to bypass RLS for updates (same as inserts)
      const client = supabaseServiceRoleKey ? supabaseAdmin : supabase
      
      // Update both status and severity if provided
      const updateData: { status: Report['status']; severity?: string } = { status }
      if (severity) {
        updateData.severity = severity
      }
      
      const { data, error } = await client
        .from('reports')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data as Report
    } catch (error) {
      console.error('Error updating report status:', error)
      throw error
    }
  },

  // Get a default citizen user ID for anonymous reports
  async getDefaultCitizenUserId(): Promise<string> {
    try {
      if (!hasRealSupabase()) {
        return 'b8d2b5c0-1234-4567-8901-123456789abc' // Default fallback UUID
      }
      
      const client = supabaseServiceRoleKey ? supabaseAdmin : supabase
      const { data: users, error } = await client
        .from('users')
        .select('id')
        .eq('role', 'citizen')
        .limit(1)
      
      if (error || !users || users.length === 0) {
        return 'b8d2b5c0-1234-4567-8901-123456789abc' // Default fallback UUID
      }
      
      return users[0].id
    } catch (error) {
      console.log('Error getting citizen user ID, using fallback:', error)
      return 'b8d2b5c0-1234-4567-8901-123456789abc' // Default fallback UUID
    }
  }
}

// Database Types
export interface Alert {
  id: string
  type: 'fire' | 'flood' | 'outage' | 'storm' | 'shelter'
  location_lat: number
  location_lng: number
  location_text: string
  source: string
  confidence_score: number
  description: string
  created_at: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'resolved' | 'investigating'
}

export interface User {
  id: string
  email: string
  role: 'responder' | 'citizen' | 'admin'
  created_at: string
}

export interface Report {
  id: string
  user_id: string
  image_url?: string
  text_report: string
  location_lat: number
  location_lng: number
  location_text: string
  status: 'pending' | 'approved' | 'rejected'
  severity?: 'low' | 'medium' | 'high' | 'critical'
  created_at: string
  alert_type?: 'fire' | 'flood' | 'outage' | 'storm' | 'shelter'
  confidence_score?: number
  admin_created?: boolean
}