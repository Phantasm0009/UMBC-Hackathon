'use client'

import { Alert } from '@/lib/supabase'
import { DisasterIcon } from './Icons'
import { generateAlertMessage } from '@/lib/ai'

interface EmergencyTickerProps {
  alerts: Alert[]
  className?: string
}

export const EmergencyTicker = ({ alerts, className = '' }: EmergencyTickerProps) => {
  // Filter to show only critical and high severity alerts
  const urgentAlerts = alerts.filter(alert => 
    alert.status === 'active' && ['critical', 'high'].includes(alert.severity)
  )

  if (urgentAlerts.length === 0) {
    return null
  }

  return (
    <div className={`bg-red-600 text-white py-2 overflow-hidden ${className}`}>
      <div className="relative">
        <div className="flex items-center">
          <div className="bg-white text-red-600 px-3 py-1 font-bold text-sm rounded-r-lg mr-4 flex-shrink-0">
            🚨 EMERGENCY ALERTS
          </div>
          <div className="animate-scroll-left whitespace-nowrap">
            {urgentAlerts.map((alert, index) => (
              <span key={alert.id} className="inline-flex items-center mr-8">
                <DisasterIcon 
                  type={alert.type} 
                  className="mr-2 flex-shrink-0" 
                  size={16} 
                />
                <span className="text-sm font-medium">
                  {generateAlertMessage(alert)}
                </span>
                {index < urgentAlerts.length - 1 && (
                  <span className="mx-4 text-red-300">•</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}