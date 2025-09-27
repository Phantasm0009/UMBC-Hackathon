import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key_abcdef123456'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
      
      const { data, error } = await supabase
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
  async updateReportStatus(id: string, status: Report['status']): Promise<Report> {
    try {
      if (!hasRealSupabase()) {
        throw new Error('No real Supabase credentials')
      }
      
      const { data, error } = await supabase
        .from('reports')
        .update({ status })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data as Report
    } catch (error) {
      console.error('Error updating report status:', error)
      throw error
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
  created_at: string
  alert_type?: 'fire' | 'flood' | 'outage' | 'storm' | 'shelter'
  confidence_score?: number
}