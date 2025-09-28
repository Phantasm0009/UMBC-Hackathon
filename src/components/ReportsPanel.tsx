'use client'

import { Report } from '@/lib/supabase'
import { Clock, MapPin, Users } from '@/components/Icons'

interface ReportsPanelProps {
  reports: Report[]
  className?: string
}

export const ReportsPanel = ({ reports, className = '' }: ReportsPanelProps) => {
  // Get recent reports, prioritizing pending ones
  const recentReports = reports
    .sort((a, b) => {
      // Sort by status first (pending first), then by created_at
      if (a.status === 'pending' && b.status !== 'pending') return -1
      if (a.status !== 'pending' && b.status === 'pending') return 1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    .slice(0, 5) // Show only 5 most recent

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'pending': return 'text-orange-600 bg-orange-100 border-orange-200'
      case 'approved': return 'text-green-600 bg-green-100 border-green-200'
      case 'rejected': return 'text-red-600 bg-red-100 border-red-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getStatusText = (status: Report['status']) => {
    switch (status) {
      case 'pending': return 'Pending Review'
      case 'approved': return 'Approved'
      case 'rejected': return 'Rejected'
      default: return 'Unknown'
    }
  }

  if (reports.length === 0) {
    return (
      <div className={`bg-white rounded-2xl border-2 border-gray-200 p-6 ${className}`}>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Reports</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <Users size={48} className="mx-auto" />
          </div>
          <p className="text-gray-600">No citizen reports yet</p>
          <p className="text-sm text-gray-500 mt-1">Reports from citizens will appear here</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-2xl border-2 border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Recent Reports</h3>
        <div className="text-sm font-medium text-gray-600">
          {reports.filter(r => r.status === 'pending').length} pending
        </div>
      </div>

      <div className="space-y-4">
        {recentReports.map((report) => (
          <div
            key={report.id}
            className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-sm text-gray-800 line-clamp-2 mb-2">
                  {report.text_report}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <MapPin size={12} />
                    <span>{report.location_text}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock size={12} />
                    <span>
                      {new Date(report.created_at).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="ml-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}
                >
                  {getStatusText(report.status)}
                </span>
              </div>
            </div>
            
            {report.alert_type && report.confidence_score && (
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                <div className="text-xs text-gray-600">
                  Classified as: <span className="font-medium capitalize">{report.alert_type}</span>
                </div>
                <div className="text-xs text-gray-600">
                  Confidence: <span className="font-medium">{Math.round(report.confidence_score * 100)}%</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {reports.length > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View all {reports.length} reports →
          </button>
        </div>
      )}
    </div>
  )
}