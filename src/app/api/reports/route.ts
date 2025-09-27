import { NextRequest, NextResponse } from 'next/server'
import { mockReports } from '@/lib/mockData'
import { classifyData } from '@/lib/ai'
import { supabaseHelpers } from '@/lib/supabase'

// GET /api/reports - Return reports from Supabase if available, otherwise mock data
export async function GET() {
  try {
    // Try to fetch from Supabase first
    try {
      const supabaseReports = await supabaseHelpers.fetchReports()
      console.log('Fetched reports from Supabase:', supabaseReports.length)
      return NextResponse.json(supabaseReports)
    } catch (supabaseError) {
      console.log('Supabase not available, using mock data:', supabaseError)
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 100))
      return NextResponse.json(mockReports)
    }
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}

// POST /api/reports - Create a new report with AI classification
export async function POST(request: NextRequest) {
  try {
    const reportData = await request.json()
    const { text_report, image_url, location_lat, location_lng, location_text } = reportData

    // Use AI to classify the report
    const classification = await classifyData(text_report, image_url)

    // Create report object
    const newReportData = {
      user_id: 'user_citizen', // In a real app, this would come from auth
      text_report,
      image_url,
      location_lat: location_lat || 39.2904,
      location_lng: location_lng || -76.6122,
      location_text: location_text || 'Baltimore, MD',
      alert_type: classification.type,
      confidence_score: classification.confidence,
      status: 'pending' as const,
    }

    // Try to insert into Supabase first
    try {
      const newReport = await supabaseHelpers.insertReport(newReportData)
      console.log('Inserted report into Supabase:', newReport.id)
      
      return NextResponse.json({
        report: newReport,
        classification
      }, { status: 201 })
    } catch (supabaseError) {
      console.log('Supabase not available, returning mock report:', supabaseError)
      // Fallback to mock response
      const mockReport = {
        id: `report_${Date.now()}`,
        ...newReportData,
        created_at: new Date().toISOString()
      }
      
      return NextResponse.json({
        report: mockReport,
        classification
      }, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    )
  }
}