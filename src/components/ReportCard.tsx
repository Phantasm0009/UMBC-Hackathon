import { Report } from '@/lib/supabase'
import { DisasterIcon, getDisasterColor, getDisasterBgClass } from '@/components/Icons'
import { formatDistanceToNow } from 'date-fns'

interface ReportCardProps {
  report: Report
  onClick?: () => void
  className?: string
}

export const ReportCard = ({ report, onClick, className = '' }: ReportCardProps) => {
  const getSeverityColor = (severity?: Report['severity']) => {
    // If admin assigned severity exists, use it; otherwise map confidence score
    if (severity) {
      switch (severity) {
        case 'critical': return 'text-red-700 bg-red-100 border-red-200'
        case 'high': return 'text-red-600 bg-red-50 border-red-200'
        case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
        case 'low': return 'text-gray-600 bg-gray-50 border-gray-200'
        default: return 'text-gray-600 bg-gray-50 border-gray-200'
      }
    }
    
    // Fallback to confidence-based coloring
    const confidence = report.confidence_score || 0
    if (confidence >= 0.8) return 'text-red-700 bg-red-100 border-red-200'
    if (confidence >= 0.6) return 'text-orange-600 bg-orange-50 border-orange-200'
    return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  }

  const getStatusColor = (status?: Report['status']) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  // Only show if approved and has alert type
  if (report.status !== 'approved' || !report.alert_type) {
    return null
  }

  return (
    <div
      className={`${getDisasterBgClass(report.alert_type)} border-2 rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] touch-manipulation relative ${className}`}
      onClick={onClick}
      style={{ 
        borderColor: getDisasterColor(report.alert_type),
        minHeight: '120px'
      }}
    >
      {/* Report Type Badge */}
      <div className="absolute top-2 right-2">
        {report.admin_created ? (
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            🏛️ Admin
          </span>
        ) : (
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-800 border border-green-200">
            👤 Citizen
          </span>
        )}
      </div>

      <div className="flex items-start justify-between mb-3 pr-16">
        <div className="flex items-center space-x-2">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white border-2 border-white shadow-lg"
            style={{ backgroundColor: getDisasterColor(report.alert_type) }}
          >
            <DisasterIcon type={report.alert_type} size={20} />
          </div>
          <div>
            <div className="font-bold text-gray-900 capitalize flex items-center space-x-2">
              <span>{report.alert_type} Report</span>
            </div>
            <div className="flex items-center space-x-2 mt-1 flex-wrap">
              {/* Show admin-assigned severity if available - make it prominent */}
              {report.severity && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full border-2 ${getSeverityColor(report.severity)} shadow-sm`}>
                  🚨 {report.severity.toUpperCase()} PRIORITY
                </span>
              )}
              
              {/* Show AI confidence - smaller if severity exists */}
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${getSeverityColor(report.severity || undefined)}`}>
                {report.confidence_score ? `${Math.round(report.confidence_score * 100)}%` : 'AI'} Confidence
              </span>
              
              {/* Show status */}
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(report.status)}`}>
                {report.status?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-gray-800 text-sm mb-3 line-clamp-2 leading-relaxed">
        {report.text_report || 'No description available'}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center space-x-1">
          <span>📍</span>
          <span className="truncate max-w-32">{report.location_text || 'Location provided'}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>⏱️</span>
          <span>{formatDistanceToNow(new Date(report.created_at))} ago</span>
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        Source: {report.admin_created ? 'Official Admin Report' : 'Citizen Report'}
      </div>
    </div>
  )
}