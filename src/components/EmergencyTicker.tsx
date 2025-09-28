'use client'

import { Alert, Report } from '@/lib/supabase'
import { AlertTriangle } from '@/components/Icons'

interface EmergencyTickerProps {
  alerts: Alert[]
  reports?: Report[]
  className?: string
}

export const EmergencyTicker = ({ alerts, reports = [], className = '' }: EmergencyTickerProps) => {
  // Combine alerts and approved reports into a single array of recent events
  const allEvents = [
    // Add active alerts
    ...alerts
      .filter(alert => alert.status === 'active')
      .map(alert => ({
        id: alert.id,
        type: alert.type,
        message: alert.description,
        location: alert.location_text,
        severity: alert.severity,
        timestamp: new Date(alert.created_at),
        source: 'alert' as const
      })),
    
    // Add approved reports
    ...reports
      .filter(report => report.status === 'approved' && report.alert_type)
      .map(report => ({
        id: report.id,
        type: report.alert_type!,
        message: report.text_report,
        location: report.location_text,
        severity: report.severity || 'medium',
        timestamp: new Date(report.created_at),
        source: 'report' as const,
        admin_created: report.admin_created || false
      }))
  ]

  // Sort by timestamp (most recent first) and take top 3
  const recentEvents = allEvents
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 3)

  if (recentEvents.length === 0) {
    return (
      <div className={`bg-green-50 border-b-2 border-green-200 px-4 py-2 ${className}`}>
        <div className="flex items-center justify-center text-green-700">
          <span className="text-sm font-medium">✅ No active emergencies at this time</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-red-600 border-b-2 border-red-700 px-4 py-2 overflow-hidden ${className}`}>
      <div className="flex items-center space-x-2">
        <AlertTriangle className="text-white animate-pulse flex-shrink-0" size={16} />
        <div className="text-white text-sm font-medium uppercase tracking-wide">
          EMERGENCY ALERTS
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="animate-scroll-left whitespace-nowrap">
            {recentEvents.map((event, index) => (
              <span key={event.id} className="text-white">
                {index > 0 && ' • '}
                <span className="font-semibold uppercase">{event.type}</span>
                {' '}
                <span className="capitalize">{event.severity}</span>
                {' - '}
                {event.message?.slice(0, 100)}
                {event.message && event.message.length > 100 && '...'}
                {' '}
                <span className="text-red-200">
                  ({event.location}) {event.source === 'report' && event.admin_created && '[ADMIN]'}
                  {event.source === 'report' && !event.admin_created && '[CITIZEN]'}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}