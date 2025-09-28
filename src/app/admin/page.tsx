'use client'

import { useState, useEffect } from 'react'
import { Alert, Report } from '@/lib/supabase'
import { AlertCard } from '@/components/AlertCard'
import { DisasterIcon, CheckCircle, X, Plus, MapPin } from '@/components/Icons'
import { LocationAutocomplete } from '@/components/LocationAutocomplete'
import { formatDistanceToNow } from 'date-fns'
import { classifyData } from '@/lib/ai'
import Link from 'next/link'

export default function AdminPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'reports' | 'alerts' | 'create'>('reports')
  const [approvingReport, setApprovingReport] = useState<string | null>(null)
  const [selectedSeverity, setSelectedSeverity] = useState<'low' | 'medium' | 'high'>('medium')
  
  // Admin incident creation state
  const [creatingIncident, setCreatingIncident] = useState(false)
  const [adminIncidentForm, setAdminIncidentForm] = useState({
    description: '',
    location: '',
    imageUrl: '',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    userLocation: null as { lat: number, lng: number } | null
  })

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

  const handleReportAction = async (reportId: string, action: 'approve' | 'reject', severity?: 'low' | 'medium' | 'high') => {
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    
    try {
      // Update status via API to ensure persistence
      const requestBody: { status: string; severity?: string } = { status: newStatus }
      if (action === 'approve' && severity) {
        requestBody.severity = severity
      }
      
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (response.ok) {
        // Update local state only after successful API call
        setReports(prev => prev.map(report => 
          report.id === reportId 
            ? { ...report, status: newStatus, ...(severity && { severity }) }
            : report
        ))
        console.log(`Successfully updated report ${reportId} status to ${newStatus}${severity ? ` with severity ${severity}` : ''}`)
        
        // Close approval modal
        setApprovingReport(null)
      } else {
        console.error('Failed to update report status:', await response.text())
        alert('Failed to update report status. Please try again.')
      }
    } catch (error) {
      console.error('Error updating report status:', error)
      alert('Failed to update report status. Please try again.')
    }
  }

  const handleAlertStatusChange = (alertId: string, status: Alert['status']) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status }
        : alert
    ))
  }

  // Handle admin incident creation
  const handleCreateAdminIncident = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminIncidentForm.description.trim()) return

    setCreatingIncident(true)
    
    try {
      // Use AI to classify the incident
      const classification = await classifyData(adminIncidentForm.description, adminIncidentForm.imageUrl)
      
      // Create admin incident - directly as approved with admin flag
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text_report: adminIncidentForm.description,
          image_url: adminIncidentForm.imageUrl || undefined,
          location_lat: adminIncidentForm.userLocation?.lat || 39.2904,
          location_lng: adminIncidentForm.userLocation?.lng || -76.6122,
          location_text: adminIncidentForm.location || 'Baltimore, MD',
          alert_type: classification.type, // Use AI classification result
          admin_created: true, // Flag to identify admin-created incidents
          pre_approved: true // Skip approval process
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        // If we have an admin-created flag, update the report to approved status immediately
        if (result.report) {
          const updateResponse = await fetch(`/api/reports/${result.report.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: 'approved',
              severity: adminIncidentForm.severity
            })
          })
          
          if (updateResponse.ok) {
            // Refresh reports list
            const reportsResponse = await fetch('/api/reports')
            if (reportsResponse.ok) {
              const reportsData = await reportsResponse.json()
              setReports(reportsData)
            }
            
            // Reset form
            setAdminIncidentForm({
              description: '',
              location: '',
              imageUrl: '',
              severity: 'medium',
              userLocation: null
            })
            
            // Switch to reports tab to see the new incident
            setActiveTab('reports')
            
            alert('✅ Admin incident created successfully!')
          }
        }
      } else {
        throw new Error('Failed to create admin incident')
      }
    } catch (error) {
      console.error('Error creating admin incident:', error)
      alert('❌ Failed to create admin incident. Please try again.')
    } finally {
      setCreatingIncident(false)
    }
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
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors duration-200 flex items-center justify-center space-x-2 ${
                activeTab === 'create'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Plus size={16} />
              <span>Create Admin Incident</span>
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
                                onClick={() => setApprovingReport(report.id)}
                                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                                title="Approve Report with Severity"
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
            ) : activeTab === 'alerts' ? (
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
            ) : (
              /* Admin Incident Creation */
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Create Admin Incident</h3>
                  <p className="text-gray-600">Create an official incident report that bypasses the approval process</p>
                </div>

                <form onSubmit={handleCreateAdminIncident} className="space-y-6">
                  {/* Description Field */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                      Incident Description *
                    </label>
                    <textarea
                      id="description"
                      rows={4}
                      value={adminIncidentForm.description}
                      onChange={(e) => setAdminIncidentForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-0 transition-colors duration-200"
                      placeholder="Describe the emergency situation..."
                      required
                    />
                  </div>

                  {/* Location Field */}
                  <div>
                    <label htmlFor="location" className="block text-sm font-semibold text-gray-900 mb-2">
                      Location
                    </label>
                    <LocationAutocomplete
                      value={adminIncidentForm.location}
                      onChange={(location, coordinates) => {
                        setAdminIncidentForm(prev => ({
                          ...prev,
                          location,
                          userLocation: coordinates || null
                        }))
                      }}
                      placeholder="Enter incident location..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-0 transition-colors duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition((position) => {
                            setAdminIncidentForm(prev => ({
                              ...prev,
                              userLocation: {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude
                              },
                              location: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
                            }))
                          })
                        }
                      }}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                    >
                      <MapPin size={16} />
                      <span>Use Current Location</span>
                    </button>
                  </div>

                  {/* Severity Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Initial Severity Level
                    </label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {[
                        { value: 'low', label: 'Low', color: 'gray', desc: 'Minor incident' },
                        { value: 'medium', label: 'Medium', color: 'yellow', desc: 'Standard response' },
                        { value: 'high', label: 'High', color: 'orange', desc: 'Urgent attention' },
                        { value: 'critical', label: 'Critical', color: 'red', desc: 'Emergency response' }
                      ].map((severity) => (
                        <button
                          key={severity.value}
                          type="button"
                          onClick={() => setAdminIncidentForm(prev => ({ ...prev, severity: severity.value as 'low' | 'medium' | 'high' | 'critical' }))}
                          className={`p-3 rounded-lg border-2 text-center transition-colors duration-200 ${
                            adminIncidentForm.severity === severity.value
                              ? `border-${severity.color}-500 bg-${severity.color}-50`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-sm font-semibold">{severity.label}</div>
                          <div className="text-xs text-gray-600">{severity.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Image URL Field */}
                  <div>
                    <label htmlFor="imageUrl" className="block text-sm font-semibold text-gray-900 mb-2">
                      Image URL (Optional)
                    </label>
                    <input
                      type="url"
                      id="imageUrl"
                      value={adminIncidentForm.imageUrl}
                      onChange={(e) => setAdminIncidentForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-0 transition-colors duration-200"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={creatingIncident || !adminIncidentForm.description.trim()}
                      className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      {creatingIncident ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Creating Incident...</span>
                        </>
                      ) : (
                        <>
                          <Plus size={20} />
                          <span>Create Admin Incident</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <div className="text-blue-600 mt-0.5">ℹ️</div>
                      <div className="text-sm text-blue-800">
                        <strong>Admin Incidents:</strong> Bypass the approval process and are immediately visible on the dashboard with an &ldquo;Admin&rdquo; tag.
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Severity Selection Modal */}
      {approvingReport && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setApprovingReport(null)}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Set Emergency Severity</h3>
              <button
                onClick={() => setApprovingReport(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <p className="text-gray-700">Choose the severity level for this approved report:</p>
              
              <div className="space-y-3">
                {[
                  { value: 'low', label: 'Low Priority', color: 'bg-gray-100 text-gray-800 border-gray-300', description: 'Minor issues, non-urgent' },
                  { value: 'medium', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', description: 'Moderate concern, requires attention' },
                  { value: 'high', label: 'High Priority', color: 'bg-red-100 text-red-800 border-red-300', description: 'Serious threat, immediate response needed' }
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedSeverity === option.value 
                        ? `${option.color} border-opacity-100` 
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="severity"
                      value={option.value}
                      checked={selectedSeverity === option.value}
                      onChange={(e) => setSelectedSeverity(e.target.value as 'low' | 'medium' | 'high')}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setApprovingReport(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReportAction(approvingReport, 'approve', selectedSeverity)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Approve with {selectedSeverity.charAt(0).toUpperCase() + selectedSeverity.slice(1)} Priority
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}