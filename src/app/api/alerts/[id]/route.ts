import { NextRequest, NextResponse } from 'next/server'
import { supabaseHelpers } from '@/lib/supabase'
import { broadcastEvent } from '../../events/route'

// PUT /api/alerts/[id] - Update a specific alert's status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { status } = await request.json()
    
    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing alert ID or status' },
        { status: 400 }
      )
    }

    if (!['active', 'resolved', 'investigating'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be active, resolved, or investigating' },
        { status: 400 }
      )
    }

    // Try to update in Supabase first
    try {
      const updatedAlert = await supabaseHelpers.updateAlertStatus(id, status)
      console.log(`Updated alert ${id} status to ${status} in Supabase`)
      
      // Broadcast real-time event
      broadcastEvent({
        type: 'alert-updated',
        data: updatedAlert as unknown as Record<string, unknown>,
        timestamp: new Date().toISOString()
      })
      
      return NextResponse.json({ alert: updatedAlert })
    } catch (supabaseError) {
      console.log('Supabase not available, update failed:', supabaseError)
      return NextResponse.json(
        { error: 'Failed to update alert in database' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error updating alert status:', error)
    return NextResponse.json(
      { error: 'Failed to update alert status' },
      { status: 500 }
    )
  }
}

// DELETE /api/alerts/[id] - Delete a specific alert
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing alert ID' },
        { status: 400 }
      )
    }

    // Try to delete from Supabase first
    try {
      await supabaseHelpers.deleteAlert(id)
      console.log(`Deleted alert ${id} from Supabase`)
      
      // Broadcast real-time event
      broadcastEvent({
        type: 'alert-deleted',
        data: { id },
        timestamp: new Date().toISOString()
      })
      
      return NextResponse.json({ success: true, message: 'Alert deleted successfully' })
    } catch (supabaseError) {
      console.log('Supabase not available, delete failed:', supabaseError)
      return NextResponse.json(
        { error: 'Failed to delete alert from database' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error deleting alert:', error)
    return NextResponse.json(
      { error: 'Failed to delete alert' },
      { status: 500 }
    )
  }
}