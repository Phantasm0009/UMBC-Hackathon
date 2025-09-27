import { Alert, Report } from './supabase'

// Mock alerts data
export const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'fire',
    location_lat: 39.2847,
    location_lng: -76.8483,
    location_text: 'Catonsville, MD',
    source: 'Emergency Services',
    confidence_score: 0.95,
    description: 'Structure fire reported on Main Street. Multiple units responding.',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    severity: 'high',
    status: 'active'
  },
  {
    id: '2',
    type: 'flood',
    location_lat: 39.2904,
    location_lng: -76.6122,
    location_text: 'Baltimore, MD',
    source: 'Weather Service',
    confidence_score: 0.87,
    description: 'Flash flooding in downtown area due to heavy rainfall.',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
    severity: 'medium',
    status: 'active'
  },
  {
    id: '3',
    type: 'outage',
    location_lat: 39.3643,
    location_lng: -76.5431,
    location_text: 'Towson, MD',
    source: 'BGE Utility',
    confidence_score: 0.92,
    description: 'Power outage affecting approximately 2,500 customers.',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    severity: 'medium',
    status: 'investigating'
  },
  {
    id: '4',
    type: 'storm',
    location_lat: 39.1612,
    location_lng: -76.8517,
    location_text: 'Ellicott City, MD',
    source: 'Weather Service',
    confidence_score: 0.78,
    description: 'Severe thunderstorm warning with potential for damaging winds.',
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    severity: 'high',
    status: 'active'
  },
  {
    id: '5',
    type: 'shelter',
    location_lat: 39.2448,
    location_lng: -76.7158,
    location_text: 'Arbutus Community Center',
    source: 'Red Cross',
    confidence_score: 0.99,
    description: 'Emergency shelter opened for displaced residents.',
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 90 minutes ago
    severity: 'medium',
    status: 'active'
  },
  {
    id: '6',
    type: 'fire',
    location_lat: 39.3915,
    location_lng: -76.6107,
    location_text: 'Parkville, MD',
    source: 'Citizen Report',
    confidence_score: 0.65,
    description: 'Possible brush fire near residential area.',
    created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(), // 20 minutes ago
    severity: 'low',
    status: 'investigating'
  }
]

// Mock user reports
export const mockReports: Report[] = [
  {
    id: 'r1',
    user_id: 'user1',
    text_report: 'Large fire visible from my window with heavy smoke. Fire trucks are arriving.',
    location_lat: 39.2847,
    location_lng: -76.8483,
    location_text: 'Catonsville, MD',
    status: 'approved',
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    alert_type: 'fire',
    confidence_score: 0.95
  },
  {
    id: 'r2',
    user_id: 'user2',
    text_report: 'Street flooding on Frederick Road. Cars are struggling to pass through.',
    location_lat: 39.2904,
    location_lng: -76.6122,
    location_text: 'Baltimore, MD',
    status: 'approved',
    created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    alert_type: 'flood',
    confidence_score: 0.87
  },
  {
    id: 'r3',
    user_id: 'user3',
    text_report: 'Power has been out for 20 minutes. Traffic lights are also down.',
    location_lat: 39.3643,
    location_lng: -76.5431,
    location_text: 'Towson, MD',
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    alert_type: 'outage',
    confidence_score: 0.92
  },
  {
    id: 'r4',
    user_id: 'user4',
    text_report: 'Very strong winds and debris flying around. Tree branches falling.',
    location_lat: 39.1612,
    location_lng: -76.8517,
    location_text: 'Ellicott City, MD',
    status: 'approved',
    created_at: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
    alert_type: 'storm',
    confidence_score: 0.78
  }
]

// Mock users
export const mockUsers = [
  {
    id: 'user1',
    email: 'citizen@example.com',
    role: 'citizen' as const,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: 'user2',
    email: 'responder@fire.gov',
    role: 'responder' as const,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
  },
  {
    id: 'user3',
    email: 'admin@disasterlens.com',
    role: 'admin' as const,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString()
  }
]