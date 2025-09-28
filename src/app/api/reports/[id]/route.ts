import { NextRequest, NextResponse } from 'next/server'
import { supabaseHelpers } from '@/lib/supabase'
import { tempReportStore } from '@/lib/tempReportStore'

// PUT /api/reports/[id] - Update a specific report's status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { status, severity } = await request.json()
    
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