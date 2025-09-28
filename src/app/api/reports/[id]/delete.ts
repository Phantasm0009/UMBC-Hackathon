import { NextRequest, NextResponse } from 'next/server'
import { supabaseHelpers } from '@/lib/supabase'

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