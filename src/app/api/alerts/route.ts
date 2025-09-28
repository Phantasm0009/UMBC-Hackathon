import { NextRequest, NextResponse } from 'next/server'
import { mockAlerts } from '@/lib/mockData'
import { supabaseHelpers } from '@/lib/supabase'
import { broadcastEvent } from '../events/route'

// GET /api/alerts - Return alerts from Supabase if available, otherwise mock data
export async function GET() {
  try {
    // Try to fetch from Supabase first
    try {
      const supabaseAlerts = await supabaseHelpers.fetchAlerts()
      console.log('Fetched alerts from Supabase:', supabaseAlerts.length)
      return NextResponse.json(supabaseAlerts)
    } catch (supabaseError) {
      console.log('Supabase not available, using mock data:', supabaseError)
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 100))
      return NextResponse.json(mockAlerts)
    }
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

// POST /api/alerts - Create a new alert
export async function POST(request: NextRequest) {
  try {
    const alertData = await request.json()
    
    // Try to insert into Supabase first
    try {
      const newAlert = await supabaseHelpers.insertAlert({
        ...alertData,
        created_at: new Date().toISOString()
      })
      console.log('Inserted alert into Supabase:', newAlert.id)
      
      // Broadcast real-time event
      broadcastEvent({
        type: 'alert-created',
        data: newAlert as unknown as Record<string, unknown>,
        timestamp: new Date().toISOString()
      })
      
      return NextResponse.json(newAlert, { status: 201 })
    } catch (supabaseError) {
      console.log('Supabase not available, returning mock alert:', supabaseError)
      // Fallback to mock response
      const mockAlert = {
        id: `alert_${Date.now()}`,
        ...alertData,
        created_at: new Date().toISOString()
      }
      
      // Broadcast real-time event even for mock data
      broadcastEvent({
        type: 'alert-created',
        data: mockAlert as unknown as Record<string, unknown>,
        timestamp: new Date().toISOString()
      })
      
      return NextResponse.json(mockAlert, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}