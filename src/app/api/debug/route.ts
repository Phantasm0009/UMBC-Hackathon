import { NextResponse } from 'next/server'
import { supabaseHelpers } from '@/lib/supabase'

// GET /api/debug - Show current data counts for debugging
export async function GET() {
  try {
    const [alerts, reports] = await Promise.all([
      supabaseHelpers.fetchAlerts().catch(() => []),
      supabaseHelpers.fetchReports().catch(() => [])
    ])
    
    const pendingReports = reports.filter(r => r.status === 'pending')
    const approvedReports = reports.filter(r => r.status === 'approved')
    const activeAlerts = alerts.filter(a => a.status === 'active')
    
    return NextResponse.json({
      alerts: {
        total: alerts.length,
        active: activeAlerts.length,
        by_severity: {
          critical: alerts.filter(a => a.severity === 'critical').length,
          high: alerts.filter(a => a.severity === 'high').length,
          medium: alerts.filter(a => a.severity === 'medium').length,
          low: alerts.filter(a => a.severity === 'low').length,
        }
      },
      reports: {
        total: reports.length,
        pending: pendingReports.length,
        approved: approvedReports.length,
        rejected: reports.filter(r => r.status === 'rejected').length
      },
      sample_alerts: alerts.slice(0, 2).map(a => ({
        id: a.id,
        type: a.type,
        severity: a.severity,
        status: a.status,
        description: a.description?.substring(0, 50) + '...'
      })),
      sample_reports: reports.slice(0, 2).map(r => ({
        id: r.id,
        status: r.status,
        alert_type: r.alert_type,
        text_report: r.text_report?.substring(0, 50) + '...'
      }))
    })
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({ error: 'Failed to fetch debug data' }, { status: 500 })
  }
}