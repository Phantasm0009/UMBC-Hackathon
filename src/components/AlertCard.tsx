import { Alert } from '@/lib/supabase'
import { DisasterIcon, getDisasterColor, getDisasterBgClass, Clock, MapPin } from './Icons'
import { formatDistanceToNow } from 'date-fns'

interface AlertCardProps {
  alert: Alert
  onClick?: () => void
  className?: string
}

export const AlertCard = ({ alert, onClick, className = '' }: AlertCardProps) => {
  const getSeverityColor = (severity?: Alert['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-200'
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusColor = (status?: Alert['status']) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-100'
      case 'investigating': return 'text-yellow-600 bg-yellow-100'
      case 'resolved': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div
      className={`${getDisasterBgClass(alert.type || 'outage')} border-2 rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${className}`}
      onClick={onClick}
      style={{ borderColor: getDisasterColor(alert.type || 'outage') }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: getDisasterColor(alert.type || 'outage') }}
          >
            <DisasterIcon type={alert.type || 'outage'} size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 capitalize">
              {alert.type || 'Unknown'} Alert
            </h3>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(alert.severity)}`}>
                {alert.severity?.toUpperCase() || 'UNKNOWN'}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(alert.status)}`}>
                {alert.status?.toUpperCase() || 'UNKNOWN'}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">
            {Math.round((alert.confidence_score || 0) * 100)}%
          </div>
          <div className="text-xs text-gray-600">confidence</div>
        </div>
      </div>

      <p className="text-gray-800 text-sm mb-3 line-clamp-2">
        {alert.description || 'No description available'}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center space-x-1">
          <MapPin size={12} />
          <span>{alert.location_text || 'Unknown location'}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock size={12} />
          <span>
            {alert.created_at ? formatDistanceToNow(new Date(alert.created_at)) : '0 minutes'} ago
          </span>
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        Source: {alert.source || 'Unknown'}
      </div>
    </div>
  )
}