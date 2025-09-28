'use client'

import { useState } from 'react'
import { Alert } from '@/lib/supabase'
import { AlertCard } from '@/components/AlertCard'
import { DisasterIcon, CheckCircle, X, Plus, MapPin, Trash2 } from '@/components/Icons'
import { LocationAutocomplete } from '@/components/LocationAutocomplete'
import { AdminPasswordGate } from '@/components/AdminPasswordGate'
import { formatDistanceToNow } from 'date-fns'
import { classifyData } from '@/lib/ai'
import { useRealtimeData } from '@/hooks/useRealtimeData'
import Link from 'next/link'

export default function AdminPage() {
  // Use real-time data hook
  const { alerts, reports, isConnected, connectionError, reconnect, loading } = useRealtimeData()
  const [updatingAlert, setUpdatingAlert] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'reports' | 'alerts' | 'create'>('reports')
  const [approvingReport, setApprovingReport] = useState<string | null>(null)
  const [classifying, setClassifying] = useState(false)
  const [aiClassification, setAiClassification] = useState<{
    severity: 'low' | 'medium' | 'high' | 'critical'
    confidence: number
    summary: string
  } | null>(null)
  
  // Admin incident creation state
  const [creatingIncident, setCreatingIncident] = useState(false)
  const [adminIncidentForm, setAdminIncidentForm] = useState({
    description: '',
    location: '',
    imageUrl: '',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    userLocation: null as { lat: number, lng: number } | null
  })

  const handleReportAction = async (reportId: string, action: 'approve' | 'reject') => {
    if (action === 'reject') {
      // For rejection, process immediately
      const newStatus = 'rejected'
      
      try {
        const response = await fetch(`/api/reports/${reportId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus })
        })

        if (response.ok) {
          console.log(`Successfully rejected report ${reportId}`)
          // Real-time system will handle the update automatically
          setApprovingReport(null)
        } else {
          alert('Failed to reject report. Please try again.')
        }
      } catch (error) {
        console.error('Error rejecting report:', error)
        alert('Failed to reject report. Please try again.')
      }
      return
    }
    
    // For approval, first get AI classification
    if (!aiClassification) {
      setClassifying(true)
      try {
        const report = reports.find(r => r.id === reportId)
        if (report && report.text_report) {
          const classification = await classifyData(report.text_report, report.image_url || undefined)
          setAiClassification({
            severity: classification.severity,
            confidence: classification.confidence,
            summary: classification.summary
          })
        }
      } catch (error) {
        console.error('Error classifying report:', error)
        alert('Failed to classify report. Please try again.')
      } finally {
        setClassifying(false)
      }
      return
    }

    // If we have AI classification, proceed with approval
    const newStatus = 'approved'
    const severity = aiClassification.severity
    
    try {
      const requestBody: { status: string; severity?: string } = { status: newStatus }
      if (severity) {
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
        console.log(`Successfully updated report ${reportId} status to ${newStatus} with AI-determined severity ${severity}`)
        
        // Real-time system will handle the update automatically
        
        // Close modal and reset classification
        setApprovingReport(null)
        setAiClassification(null)
      } else {
        console.error('Failed to update report status:', await response.text())
        alert('Failed to update report status. Please try again.')
      }
    } catch (error) {
      console.error('Error updating report status:', error)
      alert('Failed to update report status. Please try again.')
    }
  }

  const handleAlertStatusChange = async (alertId: string, status: Alert['status']) => {
    setUpdatingAlert(alertId)
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        console.log(`Successfully updated alert ${alertId} status to ${status}`)
        // Real-time system will handle the update automatically
      } else {
        console.error('Failed to update alert status:', await response.text())
        alert('Failed to update alert status. Please try again.')
      }
    } catch (error) {
      console.error('Error updating alert status:', error)
      alert('Failed to update alert status. Please try again.')
    } finally {
      setUpdatingAlert(null)
    }
  }

  // Handle alert deletion
  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm('Are you sure you want to delete this alert? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        console.log(`Successfully deleted alert ${alertId}`)
        // Real-time system will handle the update automatically
      } else {
        console.error('Failed to delete alert:', await response.text())
        alert('Failed to delete alert. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting alert:', error)
      alert('Failed to delete alert. Please try again.')
    }
  }

  // Handle report deletion
  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        console.log(`Successfully deleted report ${reportId}`)
        // Real-time system will handle the update automatically
      } else {
        console.error('Failed to delete report:', await response.text())
        alert('Failed to delete report. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting report:', error)
      alert('Failed to delete report. Please try again.')
    }
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
            // Real-time system will handle the update automatically
            
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
    <AdminPasswordGate onAuthenticated={() => {}}>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-red-600">DisasterLens Admin</h1>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-600">Emergency Response Management</p>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                isConnected 
                  ? 'bg-green-50 text-green-700' 
                  : connectionError 
                    ? 'bg-red-50 text-red-700' 
                    : 'bg-yellow-50 text-yellow-700'
              }`}>
                {isConnected ? '🟢 Real-time Active' : connectionError ? '🔴 Connection Lost' : '🟡 Connecting'}
              </span>
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                📊 Live Data: {alerts.length} alerts, {reports.length} reports
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={reconnect}
              disabled={loading}
              className="px-3 py-1 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connecting...' : isConnected ? '✅ Real-time Active' : '🔄 Reconnect'}
            </button>
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
                              <button
                                onClick={() => handleDeleteReport(report.id)}
                                className="p-2 bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors duration-200"
                                title="Delete Report"
                              >
                                <Trash2 size={16} />
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
                        <div className="flex items-center space-x-3 flex-1">
                          <div className={`w-3 h-3 rounded-full ${
                            report.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <span className="text-sm text-gray-700 line-clamp-1 flex-1">
                            {report.text_report}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            report.status === 'approved' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {report.status.toUpperCase()}
                          </span>
                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                            title="Delete Report"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
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
                          disabled={updatingAlert === alert.id}
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                            alert.status === 'active'
                              ? 'bg-red-600 text-white'
                              : 'bg-red-100 text-red-600 hover:bg-red-200'
                          }`}
                        >
                          {updatingAlert === alert.id ? 'Updating...' : 'Active'}
                        </button>
                        <button
                          onClick={() => handleAlertStatusChange(alert.id, 'investigating')}
                          disabled={updatingAlert === alert.id}
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                            alert.status === 'investigating'
                              ? 'bg-yellow-600 text-white'
                              : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                          }`}
                        >
                          {updatingAlert === alert.id ? 'Updating...' : 'Investigating'}
                        </button>
                        <button
                          onClick={() => handleAlertStatusChange(alert.id, 'resolved')}
                          disabled={updatingAlert === alert.id}
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                            alert.status === 'resolved'
                              ? 'bg-green-600 text-white'
                              : 'bg-green-100 text-green-600 hover:bg-green-200'
                          }`}
                        >
                          {updatingAlert === alert.id ? 'Updating...' : 'Resolved'}
                        </button>
                        <button
                          onClick={() => handleDeleteAlert(alert.id)}
                          className="px-3 py-2 bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors duration-200"
                          title="Delete Alert"
                        >
                          <Trash2 size={16} />
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

      {/* AI Classification Confirmation Modal */}
      {approvingReport && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setApprovingReport(null)
            setAiClassification(null)
          }}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">AI Classification & Approval</h3>
              <button
                onClick={() => {
                  setApprovingReport(null)
                  setAiClassification(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              {!aiClassification ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-4 h-4 bg-blue-600 rounded-full flex-shrink-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <h4 className="font-semibold text-blue-900">AI-Powered Classification</h4>
                  </div>
                  <p className="text-blue-800 text-sm">
                    Our AI will automatically analyze the report content and assign the appropriate severity level based on:
                  </p>
                  <ul className="text-blue-700 text-xs mt-2 space-y-1 ml-4">
                    <li>• Emergency keywords and urgency indicators</li>
                    <li>• Scale and scope of the incident</li>
                    <li>• Human impact and safety concerns</li>
                    <li>• Geographic and contextual factors</li>
                  </ul>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle className="text-green-600" size={20} />
                    <h4 className="font-semibold text-green-900">AI Classification Complete</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Severity Level:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        aiClassification.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        aiClassification.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        aiClassification.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {aiClassification.severity.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">AI Confidence:</span>
                      <span className="text-sm font-bold text-green-700">
                        {Math.round(aiClassification.confidence * 100)}%
                      </span>
                    </div>
                    
                    <div className="pt-2 border-t border-green-200">
                      <p className="text-sm text-green-800">{aiClassification.summary}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {classifying && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">AI is analyzing report content...</p>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setApprovingReport(null)
                  setAiClassification(null)
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
              {!aiClassification ? (
                <button
                  onClick={() => handleReportAction(approvingReport, 'approve')}
                  disabled={classifying}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {classifying ? 'Analyzing...' : 'Analyze with AI'}
                </button>
              ) : (
                <button
                  onClick={() => handleReportAction(approvingReport, 'approve')}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Approve as {aiClassification.severity.toUpperCase()}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminPasswordGate>
  )
}