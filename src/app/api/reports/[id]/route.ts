import { NextRequest, NextResponse } from 'next/server'
import { supabaseHelpers } from '@/lib/supabase'
import { tempReportStore } from '@/lib/tempReportStore'
import { broadcastEvent } from '../../events/route'

// PUT /api/reports/[id] - Update a specific report's status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { status, severity } = await request.json()
    
    console.log(`Updating report ${id}: status=${status}, severity=${severity}`)
    
    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing report ID or status' },
        { status: 400 }
      )
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be pending, approved, or rejected' },
        { status: 400 }
      )
    }

    if (severity && !['low', 'medium', 'high', 'critical'].includes(severity)) {
      return NextResponse.json(
        { error: 'Invalid severity. Must be low, medium, high, or critical' },
        { status: 400 }
      )
    }

    // Try to update in Supabase first
    try {
      // Update both status and severity since severity column exists in database
      const updatedReport = await supabaseHelpers.updateReportStatus(id, status, severity)
      console.log(`Updated report ${id} status to ${status}${severity ? ` with severity ${severity}` : ''} in Supabase`)
      
      // Broadcast real-time event
      console.log(`Broadcasting report-updated event for report ${id}`)
      broadcastEvent({
        type: 'report-updated',
        data: updatedReport as unknown as Record<string, unknown>,
        timestamp: new Date().toISOString()
      })
      
      console.log(`Report ${id} successfully updated and broadcasted`)
      return NextResponse.json({ report: updatedReport })
    } catch (supabaseError) {
      console.log('Supabase not available, updating in temp store:', supabaseError)
      
      // Fallback to updating in temporary store (with severity if provided)
      const updatedReport = tempReportStore.updateReportStatus(id, status, severity)
      
      if (!updatedReport) {
        return NextResponse.json(
          { error: 'Report not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ report: updatedReport })
    }
  } catch (error) {
    console.error('Error updating report status:', error)
    return NextResponse.json(
      { error: 'Failed to update report status' },
      { status: 500 }
    )
  }
}

// DELETE /api/reports/[id] - Delete a specific report
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing report ID' },
        { status: 400 }
      )
    }

    // Try to delete from Supabase first
    try {
      await supabaseHelpers.deleteReport(id)
      console.log(`Deleted report ${id} from Supabase`)
      
      // Broadcast real-time event
      broadcastEvent({
        type: 'report-deleted',
        data: { id },
        timestamp: new Date().toISOString()
      })
      
      return NextResponse.json({ success: true, message: 'Report deleted successfully' })
    } catch (supabaseError) {
      console.log('Supabase not available, delete failed:', supabaseError)
      return NextResponse.json(
        { error: 'Failed to delete report from database' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error deleting report:', error)
    return NextResponse.json(
      { error: 'Failed to delete report' },
      { status: 500 }
    )
  }
}