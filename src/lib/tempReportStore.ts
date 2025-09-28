// Temporary in-memory store for reports during development
// This simulates a database when Supabase RLS blocks insertions

import { Report } from './supabase'

// In-memory store (will reset when server restarts, but useful for testing)
let tempReports: Report[] = []

export const tempReportStore = {
  // Add a new report to the temporary store
  addReport(report: Report) {
    tempReports.push(report)
    console.log(`Added report to temp store: ${report.id}`)
  },

  // Get all reports from temporary store
  getReports(): Report[] {
    return [...tempReports] // Return a copy
  },

  // Update report status in temporary store
  updateReportStatus(id: string, status: Report['status'], severity?: 'low' | 'medium' | 'high' | 'critical') {
    const reportIndex = tempReports.findIndex(r => r.id === id)
    if (reportIndex !== -1) {
      const updateData: Partial<Report> = { status }
      if (severity) {
        updateData.severity = severity
      }
      tempReports[reportIndex] = { ...tempReports[reportIndex], ...updateData }
      console.log(`Updated report ${id} status to ${status}${severity ? ` with severity ${severity}` : ''}`)
      return tempReports[reportIndex]
    }
    return null
  },

  // Clear the temporary store
  clear() {
    tempReports = []
    console.log('Cleared temp report store')
  },

  // Get count
  getCount(): number {
    return tempReports.length
  }
}