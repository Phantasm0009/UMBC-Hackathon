'use client'

import { useState, useEffect } from 'react'
import { Alert, Report } from '@/lib/supabase'
import { EmergencyTicker } from '@/components/EmergencyTicker'
import { DisasterMap } from '@/components/DisasterMap'
import { FilterControls } from '@/components/FilterControls'
import { SummaryPanel } from '@/components/SummaryPanel'
import { AlertCard } from '@/components/AlertCard'
import { ReportCard } from '@/components/ReportCard'
import { Navigation, MobileNavigation } from '@/components/Navigation'
import { EmergencyModeTest } from '@/components/EmergencyModeTest'
import { useEmergencyMode } from '@/hooks/useEmergencyMode'
import { useRealtimeData } from '@/hooks/useRealtimeData'
import { Menu, X, Filter, DisasterIcon, getDisasterColor } from '@/components/Icons'
import { formatDistanceToNow } from 'date-fns'

export default function DashboardPage() {
  // Use real-time data hook instead of manual data loading
  const { alerts, reports, isConnected, connectionError, reconnect, loading } = useRealtimeData()
  
  const [filters, setFilters] = useState({
    fire: true,
    flood: true,
    outage: true,
    storm: true,
    shelter: true
  })
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false) // Start closed on mobile

  // Emergency mode for mobile
  const {
    checkEmergencyStatus
  } = useEmergencyMode()

  // Check emergency status when data changes
  useEffect(() => {
    checkEmergencyStatus(alerts, reports)
  }, [alerts, reports, checkEmergencyStatus])

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (selectedAlert) setSelectedAlert(null)
        if (selectedReport) setSelectedReport(null)
      }
    }

    document.addEventListener('keydown', handleEscapeKey)
    return () => document.removeEventListener('keydown', handleEscapeKey)
  }, [selectedAlert, selectedReport])

  // Handle filter changes
  const handleFilterChange = (filter: keyof typeof filters, value: boolean) => {
    setFilters(prev => ({ ...prev, [filter]: value }))
  }

  // Handle alert selection
  const handleAlertClick = (alert: Alert) => {
    setSelectedAlert(alert)
    setSelectedReport(null) // Close report modal if open
  }

  // Handle report selection
  const handleReportClick = (report: Report) => {
    setSelectedReport(report)
    setSelectedAlert(null) // Close alert modal if open
  }

  // Development helper functions for testing emergency mode
  const createTestCriticalIncident = async () => {
    const testIncident = {
      text_report: "CRITICAL: Major structure fire with multiple casualties reported downtown",
      location_text: "Downtown Baltimore, MD",
      location_lat: 39.2904,
      location_lng: -76.6122,
      alert_type: "fire",
      admin_created: true,
      pre_approved: true
    }
    
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testIncident)
      })
      
      if (response.ok) {
        const result = await response.json()
        // Update with critical severity
        await fetch(`/api/reports/${result.report.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'approved', severity: 'critical' })
        })
        
        // Real-time system will handle the update automatically
      }
    } catch (error) {
      console.error('Error creating test incident:', error)
    }
  }

  const createTestHighIncident = async () => {
    const testIncident = {
      text_report: "HIGH PRIORITY: Major power outage affecting thousands of residents",
      location_text: "West Baltimore, MD", 
      location_lat: 39.2847,
      location_lng: -76.8483,
      alert_type: "outage",
      admin_created: true,
      pre_approved: true
    }
    
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testIncident)
      })
      
      if (response.ok) {
        const result = await response.json()
        // Update with high severity
        await fetch(`/api/reports/${result.report.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'approved', severity: 'high' })
        })
        
        // Real-time system will handle the update automatically
      }
    } catch (error) {
      console.error('Error creating test incident:', error)
    }
  }

  const clearTestIncidents = () => {
    // Reset to initial data by reloading
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto"></div>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">DisasterLens</h1>
          <p className="text-gray-600 mt-2">Loading emergency data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Emergency Ticker */}
      <EmergencyTicker alerts={alerts} reports={reports} />

      {/* Header */}
        <header className="bg-white border-b-2 border-gray-200 px-4 py-3 lg:py-4 relative z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 lg:space-x-4">
            {/* Mobile & Desktop Sidebar Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-3 lg:p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors duration-150 touch-manipulation"
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              {sidebarOpen ? <X size={20} className="lg:w-6 lg:h-6" /> : <Menu size={20} className="lg:w-6 lg:h-6" />}
            </button>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-red-600">DisasterLens</h1>
              <div className="flex items-center space-x-2">
                <p className="text-xs lg:text-sm text-gray-600 hidden sm:block">Real-time Emergency Response Dashboard</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  isConnected 
                    ? 'bg-green-50 text-green-700' 
                    : connectionError 
                      ? 'bg-red-50 text-red-700' 
                      : 'bg-yellow-50 text-yellow-700'
                }`}>
                  {isConnected ? '🟢 Live' : connectionError ? '🔴 Offline' : '🟡 Connecting'}
                </span>
                {connectionError && (
                  <button
                    onClick={reconnect}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Reconnect
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <Navigation />
          </div>
          
          {/* Stats - Responsive */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            <div className="text-right">
              <div className="text-sm font-bold text-gray-900">{alerts.length}</div>
              <div className="text-xs text-gray-600 hidden sm:block">Total Alerts</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-red-600">
                {alerts.filter(a => a.status === 'active').length}
              </div>
              <div className="text-xs text-gray-600 hidden sm:block">Active</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-blue-600">{reports.length}</div>
              <div className="text-xs text-gray-600 hidden sm:block">Reports</div>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="relative z-10 pt-2 pb-20 md:pb-2 min-h-0">
        <div className="flex h-[calc(100vh-160px)] md:h-[calc(100vh-140px)] lg:h-[calc(100vh-120px)]">
          {/* Mobile Overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-30 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar - Responsive Design */}
          <aside className={`
            ${sidebarOpen ? 'w-80 lg:w-96' : 'w-0'}
            transition-all duration-300 overflow-hidden 
            ${sidebarOpen ? 'bg-white border-r-2 border-gray-200' : 'bg-transparent border-0'}
            h-full
            fixed lg:relative z-40 lg:z-10 flex-shrink-0
          `}>
          <div className="h-full overflow-y-auto">
            {/* Mobile Header - Only show when sidebar is open on mobile */}
            <div className="lg:hidden bg-red-50 border-b border-red-200 p-3 flex items-center justify-between">
              <h2 className="font-bold text-red-800">Emergency Dashboard</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded hover:bg-red-100"
              >
                <X size={20} className="text-red-600" />
              </button>
            </div>

            {/* Sidebar Content with Better Spacing */}
            <div className="p-3 lg:p-4 space-y-4 lg:space-y-6">
              {/* Filter Controls - Compact on Mobile */}
              <div className="bg-white rounded-xl border border-gray-200 p-3 lg:p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Filter className="text-gray-600" size={18} />
                  <h3 className="text-sm lg:text-base font-bold text-gray-900">Filters</h3>
                </div>
                <FilterControls 
                  filters={filters} 
                  onFilterChange={handleFilterChange}
                  className="border-0 p-0 bg-transparent"
                />
              </div>

              {/* Summary Panel - Collapsible on Mobile */}
              <div className="bg-white rounded-xl border border-gray-200">
                <SummaryPanel 
                  alerts={alerts}
                  reports={reports}
                  className="border-0 rounded-xl"
                />
              </div>

              {/* Recent Incidents - Optimized Layout */}
              <div className="bg-white rounded-xl border border-gray-200 p-3 lg:p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm lg:text-base font-bold text-gray-900">Recent Incidents</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {(() => {
                      const alertCount = alerts.filter(alert => filters[alert.type]).length
                      const reportCount = reports.filter(report => 
                        report.status === 'approved' && 
                        report.alert_type && 
                        filters[report.alert_type]
                      ).length
                      return alertCount + reportCount
                    })()}
                  </span>
                </div>
                
                {/* Incident Cards with Responsive Scaling */}
                <div className="space-y-2 max-h-96 lg:max-h-[500px] overflow-y-auto">
                  {(() => {
                    // Combine alerts and approved reports
                    const recentAlerts = alerts
                      .filter(alert => filters[alert.type])
                      .map(alert => ({ type: 'alert' as const, data: alert, timestamp: new Date(alert.created_at) }))
                    
                    const approvedReports = reports
                      .filter(report => 
                        report.status === 'approved' && 
                        report.alert_type && 
                        filters[report.alert_type]
                      )
                      .map(report => ({ type: 'report' as const, data: report, timestamp: new Date(report.created_at) }))
                    
                    // Combine and sort by timestamp (newest first)
                    const allIncidents = [...recentAlerts, ...approvedReports]
                      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                      .slice(0, 8) // Show up to 8 most recent incidents
                    
                    if (allIncidents.length === 0) {
                      return (
                        <div className="text-center py-6 text-gray-500">
                          <div className="text-2xl mb-2">📍</div>
                          <p className="text-sm">No recent incidents</p>
                        </div>
                      )
                    }
                    
                    return allIncidents.map((incident) => {
                      if (incident.type === 'alert') {
                        return (
                          <AlertCard
                            key={`alert-${incident.data.id}`}
                            alert={incident.data}
                            onClick={() => handleAlertClick(incident.data)}
                            className="scale-90 lg:scale-95 hover:scale-95 lg:hover:scale-100 transition-transform"
                          />
                        )
                      } else {
                        return (
                          <ReportCard
                            key={`report-${incident.data.id}`}
                            report={incident.data}
                            onClick={() => handleReportClick(incident.data)}
                            className="scale-90 lg:scale-95 hover:scale-95 lg:hover:scale-100 transition-transform"
                          />
                        )
                      }
                    })
                  })()}
                </div>
                
                {/* Summary Footer */}
                <div className="text-xs text-gray-500 text-center pt-3 mt-3 border-t border-gray-100">
                  {(() => {
                    const alertCount = alerts.filter(alert => filters[alert.type]).length
                    const reportCount = reports.filter(report => 
                      report.status === 'approved' && 
                      report.alert_type && 
                      filters[report.alert_type]
                    ).length
                    return `${alertCount} alerts • ${reportCount} reports`
                  })()}
                </div>
              </div>
            </div>
          </div>
        </aside>

          {/* Main Content - Responsive */}
          <main className="flex-1 min-w-0 p-2 lg:p-4 relative z-10 transition-all duration-300">
            <div className="h-full w-full">
              <DisasterMap
                alerts={alerts}
                reports={reports}
                filters={filters}
                onAlertClick={handleAlertClick}
                onReportClick={handleReportClick}
                className="h-full w-full rounded-lg lg:rounded-xl shadow-sm"
              />
            </div>
          </main>
        </div>
      </div>

      {/* Alert Detail Modal - Mobile Optimized */}
      {selectedAlert && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-end lg:items-center justify-center z-50 p-0 lg:p-4"
          onClick={() => setSelectedAlert(null)}
        >
          <div 
            className="bg-white rounded-t-2xl lg:rounded-2xl p-4 lg:p-6 w-full lg:max-w-md lg:w-full max-h-[90vh] lg:max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Handle Bar */}
            <div className="lg:hidden w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg lg:text-xl font-bold text-gray-900">Alert Details</h3>
              <button
                onClick={() => setSelectedAlert(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 lg:block hidden"
              >
                <X size={20} />
              </button>
            </div>
            
            <AlertCard
              alert={selectedAlert}
              className="mb-4 hover:scale-100"
            />
            
            <div className="space-y-3 text-sm">
              <div className="flex items-start justify-between py-2 border-b border-gray-100">
                <span className="font-semibold text-gray-900">Source:</span>
                <span className="text-gray-700 text-right flex-1 ml-2">{selectedAlert.source}</span>
              </div>
              <div className="flex items-start justify-between py-2 border-b border-gray-100">
                <span className="font-semibold text-gray-900">Coordinates:</span>
                <span className="text-gray-700 text-right flex-1 ml-2 font-mono text-xs">
                  {selectedAlert.location_lat != null && selectedAlert.location_lng != null
                    ? `${selectedAlert.location_lat.toFixed(4)}, ${selectedAlert.location_lng.toFixed(4)}`
                    : 'Location not specified'}
                </span>
              </div>
              <div className="flex items-start justify-between py-2">
                <span className="font-semibold text-gray-900">Created:</span>
                <span className="text-gray-700 text-right flex-1 ml-2">
                  {new Date(selectedAlert.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setSelectedAlert(null)}
              className="lg:hidden w-full mt-6 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Report Detail Modal - Mobile Optimized */}
      {selectedReport && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-end lg:items-center justify-center z-50 p-0 lg:p-4"
          onClick={() => setSelectedReport(null)}
        >
          <div 
            className="bg-white rounded-t-2xl lg:rounded-2xl p-4 lg:p-6 w-full lg:max-w-md lg:w-full max-h-[90vh] lg:max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Handle Bar */}
            <div className="lg:hidden w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
            
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg lg:text-xl font-bold text-gray-900">Report Details</h2>
              <button 
                onClick={() => setSelectedReport(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 lg:block hidden"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Report Header */}
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white flex-shrink-0"
                  style={{ backgroundColor: getDisasterColor(selectedReport.alert_type!) }}
                >
                  <DisasterIcon type={selectedReport.alert_type!} size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 capitalize truncate">
                    {selectedReport.alert_type} Incident
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                      {selectedReport.admin_created ? 'Admin' : 'Approved'}
                    </span>
                    {selectedReport.confidence_score && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {Math.round(selectedReport.confidence_score * 100)}% AI
                      </span>
                    )}
                    {selectedReport.severity && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        selectedReport.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        selectedReport.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        selectedReport.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedReport.severity.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Report Content */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description:</h4>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-gray-800 leading-relaxed">
                    {selectedReport.text_report || 'No description provided'}
                  </p>
                </div>
              </div>

              {/* Report Details - Mobile Friendly */}
              <div className="space-y-3">
                <div className="flex items-start justify-between py-2 border-b border-gray-100">
                  <span className="font-semibold text-gray-900">Location:</span>
                  <span className="text-gray-700 text-right flex-1 ml-2">
                    {selectedReport.location_text || 'Not specified'}
                  </span>
                </div>
                {selectedReport.location_lat && selectedReport.location_lng && (
                  <div className="flex items-start justify-between py-2 border-b border-gray-100">
                    <span className="font-semibold text-gray-900">Coordinates:</span>
                    <span className="text-gray-700 text-right flex-1 ml-2 text-sm">
                      {selectedReport.location_lat.toFixed(4)}, {selectedReport.location_lng.toFixed(4)}
                    </span>
                  </div>
                )}
                <div className="flex items-start justify-between py-2 border-b border-gray-100">
                  <span className="font-semibold text-gray-900">Submitted:</span>
                  <span className="text-gray-700 text-right flex-1 ml-2 text-sm">
                    {formatDistanceToNow(new Date(selectedReport.created_at))} ago
                  </span>
                </div>
                <div className="flex items-start justify-between py-2 border-b border-gray-100">
                  <span className="font-semibold text-gray-900">Status:</span>
                  <span className="flex-1 ml-2 text-right">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 capitalize">
                      {selectedReport.status}
                    </span>
                  </span>
                </div>
                <div className="flex items-start justify-between py-2">
                  <span className="font-semibold text-gray-900">Source:</span>
                  <span className="text-gray-700 text-right flex-1 ml-2">
                    {selectedReport.admin_created ? 'Official Admin Report' : 'Citizen Report'}
                  </span>
                </div>
              </div>

              {/* Image if provided */}
              {selectedReport.image_url && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Attached Image:</h4>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <a 
                      href={selectedReport.image_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <span className="text-lg">📷</span>
                      <span>View Attached Image</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setSelectedReport(null)}
              className="lg:hidden w-full mt-6 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Development Testing Tool */}
      <EmergencyModeTest
        onCreateCriticalIncident={createTestCriticalIncident}
        onCreateHighIncident={createTestHighIncident}
        onClearIncidents={clearTestIncidents}
      />
    </div>
  )
}