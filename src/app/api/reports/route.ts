import { NextRequest, NextResponse } from 'next/server'
import { mockReports } from '@/lib/mockData'
import { classifyData } from '@/lib/ai'
import { supabaseHelpers } from '@/lib/supabase'
import { tempReportStore } from '@/lib/tempReportStore'

// GET /api/reports - Return reports from Supabase if available, otherwise mock data
export async function GET() {
  try {
    // Try to fetch from Supabase first
    try {
      const supabaseReports = await supabaseHelpers.fetchReports()
      console.log('Fetched reports from Supabase:', supabaseReports.length)
      
      // Combine Supabase reports with temporary reports
      const tempReports = tempReportStore.getReports()
      const allReports = [...supabaseReports, ...tempReports]
      
      return NextResponse.json(allReports)
    } catch (supabaseError) {
      console.log('Supabase not available, using mock + temp data:', supabaseError)
      // Fallback to mock data + temporary reports
      await new Promise(resolve => setTimeout(resolve, 100))
      const tempReports = tempReportStore.getReports()
      const allReports = [...mockReports, ...tempReports]
      
      return NextResponse.json(allReports)
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
    const { 
      text_report, 
      image_url, 
      location_lat, 
      location_lng, 
      location_text,
      alert_type,
      admin_created = false,
      pre_approved = false
    } = reportData

    // Use AI to classify the report (unless alert_type is provided for admin reports)
    const classification = alert_type ? 
      { type: alert_type, confidence: 1.0, severity: 'medium', summary: text_report } :
      await classifyData(text_report, image_url)

    // Get a default citizen user ID from the database or use a fixed UUID
    let userId: string
    
    try {
      // Try to get a real citizen user from the database
      userId = await supabaseHelpers.getDefaultCitizenUserId()
    } catch (userError) {
      console.log('Could not fetch user, using default UUID:', userError)
      userId = 'b8d2b5c0-1234-4567-8901-123456789abc' // Default fallback UUID
    }

    // Create report object
    const newReportData = {
      user_id: userId,
      text_report,
      image_url,
      location_lat: location_lat || 39.2904,
      location_lng: location_lng || -76.6122,
      location_text: location_text || 'Baltimore, MD',
      alert_type: classification.type,
      confidence_score: classification.confidence,
      status: pre_approved ? 'approved' as const : 'pending' as const,
      admin_created: admin_created || false,
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
      console.log('Supabase not available, storing in temp and returning mock report:', supabaseError)
      // Fallback to mock response and store in temp
      const mockReport = {
        id: `report_${Date.now()}`,
        ...newReportData,
        created_at: new Date().toISOString()
      }
      
      // Add to temporary store so it shows up in admin panel
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tempReportStore.addReport(mockReport as unknown as any)
      
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