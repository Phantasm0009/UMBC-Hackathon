'use client'

import { useState, useEffect } from 'react'
import { Alert, Report } from '@/lib/supabase'
import { AlertCard } from '@/components/AlertCard'
import { DisasterIcon, CheckCircle, X } from '@/components/Icons'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

export default function AdminPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'reports' | 'alerts'>('reports')

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Load alerts from API
        const alertsResponse = await fetch('/api/alerts')
        if (alertsResponse.ok) {
          const alertsData = await alertsResponse.json()
          setAlerts(alertsData)
        }

        // Load reports from API
        const reportsResponse = await fetch('/api/reports')
        if (reportsResponse.ok) {
          const reportsData = await reportsResponse.json()
          setReports(reportsData)
        }
      } catch (error) {
        console.error('Error loading data:', error)
        // Fallback to mock data
        const { mockAlerts, mockReports } = await import('@/lib/mockData')
        setAlerts(mockAlerts)
        setReports(mockReports)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleReportAction = (reportId: string, action: 'approve' | 'reject') => {
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, status: action === 'approve' ? 'approved' : 'rejected' }
        : report
    ))
  }

  const handleAlertStatusChange = (alertId: string, status: Alert['status']) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status }
        : alert
    ))
  }

  const pendingReports = reports.filter(r => r.status === 'pending')
  const processedReports = reports.filter(r => r.status !== 'pending')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto"></div>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Loading Admin Panel...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-red-600">DisasterLens Admin</h1>
            <p className="text-sm text-gray-600">Emergency Response Management</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              href="/report"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
            >
              Report Portal →
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-red-600">{alerts.filter(a => a.status === 'active').length}</div>
            <div className="text-sm text-gray-600 mt-1">Active Alerts</div>
          </div>
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600">{pendingReports.length}</div>
            <div className="text-sm text-gray-600 mt-1">Pending Reports</div>
          </div>
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-green-600">
              {reports.filter(r => r.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Approved Reports</div>
          </div>
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-gray-600">
              {alerts.filter(a => ['critical', 'high'].includes(a.severity)).length}
            </div>
            <div className="text-sm text-gray-600 mt-1">High Priority</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
          <div className="flex border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors duration-200 ${
                activeTab === 'reports'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Citizen Reports ({pendingReports.length} pending)
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors duration-200 ${
                activeTab === 'alerts'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Alert Management ({alerts.length} total)
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'reports' ? (
              <div className="space-y-6">
                {/* Pending Reports */}
                {pendingReports.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Pending Review ({pendingReports.length})
                    </h3>
                    <div className="space-y-4">
                      {pendingReports.map((report) => (
                        <div key={report.id} className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start space-x-3">
                              {report.alert_type && (
                                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                                  <DisasterIcon type={report.alert_type} className="text-white" size={20} />
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  Report #{report.id}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {formatDistanceToNow(new Date(report.created_at))} ago
                                </div>
                                {report.confidence_score && (
                                  <div className="text-xs text-gray-600">
                                    AI Confidence: {Math.round(report.confidence_score * 100)}%
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleReportAction(report.id, 'approve')}
                                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                                title="Approve Report"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() => handleReportAction(report.id, 'reject')}
                                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                                title="Reject Report"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-700 mb-2">{report.text_report}</p>
                          
                          <div className="text-xs text-gray-600 space-y-1">
                            <div>📍 {report.location_text}</div>
                            {report.image_url && (
                              <div>🖼️ Photo attached: {report.image_url}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Processed Reports */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Recent Decisions ({processedReports.length})
                  </h3>
                  <div className="space-y-2">
                    {processedReports.slice(0, 10).map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            report.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <span className="text-sm text-gray-700 line-clamp-1">
                            {report.text_report}
                          </span>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          report.status === 'approved' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {report.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Alert Management */
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="space-y-3">
                      <AlertCard alert={alert} />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAlertStatusChange(alert.id, 'active')}
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                            alert.status === 'active'
                              ? 'bg-red-600 text-white'
                              : 'bg-red-100 text-red-600 hover:bg-red-200'
                          }`}
                        >
                          Active
                        </button>
                        <button
                          onClick={() => handleAlertStatusChange(alert.id, 'investigating')}
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                            alert.status === 'investigating'
                              ? 'bg-yellow-600 text-white'
                              : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                          }`}
                        >
                          Investigating
                        </button>
                        <button
                          onClick={() => handleAlertStatusChange(alert.id, 'resolved')}
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                            alert.status === 'resolved'
                              ? 'bg-green-600 text-white'
                              : 'bg-green-100 text-green-600 hover:bg-green-200'
                          }`}
                        >
                          Resolved
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}