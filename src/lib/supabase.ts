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

// Sample Data for Development and Testing
export const samplePlaces = [
  {
    id: 1,
    name: "Baltimore Inner Harbor",
    lat: 39.2864,
    lng: -76.6081,
    type: "waterfront",
    population: "high_density"
  },
  {
    id: 2,
    name: "UMBC Campus",
    lat: 39.2540,
    lng: -76.7134,
    type: "university",
    population: "medium_density"
  },
  {
    id: 3,
    name: "BWI Airport",
    lat: 39.1754,
    lng: -76.6683,
    type: "transportation",
    population: "high_density"
  },
  {
    id: 4,
    name: "Fells Point Historic District",
    lat: 39.2838,
    lng: -76.5924,
    type: "historic",
    population: "medium_density"
  },
  {
    id: 5,
    name: "Fort McHenry National Monument",
    lat: 39.2637,
    lng: -76.5802,
    type: "monument",
    population: "low_density"
  },
  {
    id: 6,
    name: "Johns Hopkins Hospital",
    lat: 39.2970,
    lng: -76.5929,
    type: "medical",
    population: "high_density"
  },
  {
    id: 7,
    name: "Camden Yards Stadium",
    lat: 39.2837,
    lng: -76.6218,
    type: "sports",
    population: "variable_density"
  },
  {
    id: 8,
    name: "Patapsco Valley State Park",
    lat: 39.2315,
    lng: -76.7656,
    type: "park",
    population: "low_density"
  },
  {
    id: 9,
    name: "Downtown Baltimore Business District",
    lat: 39.2904,
    lng: -76.6122,
    type: "business",
    population: "high_density"
  },
  {
    id: 10,
    name: "Dundalk Marine Terminal",
    lat: 39.2406,
    lng: -76.5333,
    type: "industrial",
    population: "medium_density"
  }
]

export const sampleIncidents: Alert[] = [
  {
    id: "alert_001",
    type: "fire",
    location_lat: 39.2864,
    location_lng: -76.6081,
    location_text: "Baltimore Inner Harbor - Pier 5",
    source: "Baltimore Fire Department",
    confidence_score: 0.95,
    description: "🔥 CRITICAL: Large warehouse fire spreading rapidly at Inner Harbor Pier 5. Multiple fire companies responding. Smoke visible across downtown. Immediate evacuation of nearby buildings in progress. Wind pushing flames toward tourist areas.",
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    severity: "critical",
    status: "active"
  },
  {
    id: "alert_002",
    type: "outage",
    location_lat: 39.2540,
    location_lng: -76.7134,
    location_text: "UMBC Campus - Academic Buildings",
    source: "BGE Utilities",
    confidence_score: 0.92,
    description: "⚡ HIGH PRIORITY: Major power outage affecting UMBC campus. Transformer explosion reported near library. 8,000+ students and staff affected. Emergency generators activated for critical systems. Repair crews on site.",
    created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(), // 20 minutes ago
    severity: "high",
    status: "investigating"
  },
  {
    id: "alert_003",
    type: "storm",
    location_lat: 39.1754,
    location_lng: -76.6683,
    location_text: "BWI Airport - Terminal Areas",
    source: "National Weather Service",
    confidence_score: 0.96,
    description: "🌪️ CRITICAL: Severe thunderstorm with 80+ mph winds approaching BWI Airport. Tornado watch in effect. All flights grounded. Terminal evacuation to secure areas. Massive hail reported. Emergency shelters activated.",
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    severity: "critical",
    status: "active"
  },
  {
    id: "alert_004",
    type: "shelter",
    location_lat: 39.2838,
    location_lng: -76.5924,
    location_text: "Fells Point Historic District",
    source: "Baltimore Emergency Management",
    confidence_score: 0.91,
    description: "🏠 HIGH PRIORITY: Emergency evacuation of historic waterfront buildings due to structural damage from recent storm. 200+ residents need temporary shelter. Red Cross setting up emergency housing at nearby community center.",
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
    severity: "high",
    status: "active"
  },
  {
    id: "alert_005",
    type: "fire",
    location_lat: 39.2637,
    location_lng: -76.5802,
    location_text: "Fort McHenry National Monument - Visitor Center",
    source: "National Park Service",
    confidence_score: 0.78,
    description: "🔥 MODERATE: Small grass fire contained near Fort McHenry visitor parking area. Fire department responded quickly. No structural damage. Visitor center temporarily closed as precaution. Reopening expected this afternoon.",
    created_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(), // 2 hours ago
    severity: "medium",
    status: "resolved"
  },
  {
    id: "alert_006",
    type: "outage",
    location_lat: 39.2970,
    location_lng: -76.5929,
    location_text: "Johns Hopkins Hospital - Main Campus",
    source: "Hospital Security",
    confidence_score: 0.89,
    description: "⚡ MODERATE: Partial power outage in Johns Hopkins Hospital east wing. Backup systems functioning normally. Non-critical services temporarily suspended. Utility crews working to restore full power within 2 hours.",
    created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(), // 1.5 hours ago
    severity: "medium",
    status: "investigating"
  },
  {
    id: "alert_007",
    type: "storm",
    location_lat: 39.2837,
    location_lng: -76.6218,
    location_text: "Camden Yards Stadium - Parking Lots",
    source: "Stadium Operations",
    confidence_score: 0.73,
    description: "🌪️ LOW PRIORITY: Minor wind damage in Camden Yards parking areas. Some signage down and debris scattered. No injuries reported. Cleanup crew dispatched. Tonight's game proceeding as scheduled.",
    created_at: new Date(Date.now() - 180 * 60 * 1000).toISOString(), // 3 hours ago
    severity: "low",
    status: "resolved"
  },
  {
    id: "alert_008",
    type: "flood",
    location_lat: 39.2315,
    location_lng: -76.7656,
    location_text: "Patapsco Valley State Park - Cascade Falls Trail",
    source: "Maryland State Parks",
    confidence_score: 0.88,
    description: "� HIGH PRIORITY: Flash flood warning - Patapsco River overflowing due to heavy rainfall. Trail access roads flooded. Several hikers stranded on high ground. Water rescue teams deployed. Park closed indefinitely.",
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
    severity: "high",
    status: "active"
  },
  {
    id: "alert_009",
    type: "flood",
    location_lat: 39.2904,
    location_lng: -76.6122,
    location_text: "Downtown Baltimore Business District - Light Street",
    source: "Baltimore City Department of Transportation",
    confidence_score: 0.82,
    description: "🌊 MODERATE: Street flooding on Light Street due to blocked storm drains. Several intersections have standing water. Traffic rerouted through alternate routes. Maintenance crews clearing drains. Expected resolution in 1-2 hours.",
    created_at: new Date(Date.now() - 150 * 60 * 1000).toISOString(), // 2.5 hours ago
    severity: "medium",
    status: "investigating"
  },
  {
    id: "alert_010",
    type: "shelter",
    location_lat: 39.2406,
    location_lng: -76.5333,
    location_text: "Dundalk Marine Terminal - Worker Areas",
    source: "Port Authority",
    confidence_score: 0.67,
    description: "🏠 LOW PRIORITY: Temporary shelter setup for port workers during shift change due to heavy rain. Covered break areas opened. Workers staying dry and safe. Normal operations resuming as weather clears.",
    created_at: new Date(Date.now() - 240 * 60 * 1000).toISOString(), // 4 hours ago
    severity: "low",
    status: "resolved"
  }
]