'use client'

import { Alert, Report } from '@/lib/supabase'
import { generateAlertMessage, summarizeReports } from '@/lib/ai'
import { DisasterIcon, Bell, AlertTriangle } from './Icons'
import { useEffect, useState } from 'react'

interface SummaryPanelProps {
  alerts: Alert[]
  reports?: Report[]
  className?: string
}

export const SummaryPanel = ({ alerts, reports = [], className = '' }: SummaryPanelProps) => {
  const [aiSummary, setAiSummary] = useState<{
    summary: string
    keyPoints: string[]
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
  } | null>(null)

  useEffect(() => {
    if (reports.length > 0) {
      summarizeReports(reports).then(setAiSummary)
    }
  }, [reports])

  // Get active alerts
  const activeAlerts = alerts.filter(alert => alert.status === 'active')
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical')
  const highPriorityAlerts = activeAlerts.filter(alert => ['critical', 'high'].includes(alert.severity))

  // Count by type
  const alertCounts = activeAlerts.reduce((acc, alert) => {
    acc[alert.type] = (acc[alert.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-200'
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-200'
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200'
      case 'low': return 'text-green-700 bg-green-100 border-green-200'
      default: return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  return (
    <div className={`bg-white rounded-2xl border-2 border-gray-200 p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Situation Summary</h2>
        <div className="flex items-center space-x-2">
          <Bell className="text-red-600" size={20} />
          <span className="text-sm font-medium text-gray-600">Live Updates</span>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="text-red-600" size={20} />
            <h3 className="text-lg font-bold text-red-900">Critical Alerts ({criticalAlerts.length})</h3>
          </div>
          <div className="space-y-2">
            {criticalAlerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="text-sm text-red-800">
                {generateAlertMessage(alert)}
              </div>
            ))}
            {criticalAlerts.length > 3 && (
              <div className="text-xs text-red-600 font-medium">
                +{criticalAlerts.length - 3} more critical alerts
              </div>
            )}
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{activeAlerts.length}</div>
          <div className="text-sm text-gray-600">Active Alerts</div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{highPriorityAlerts.length}</div>
          <div className="text-sm text-red-600">High Priority</div>
        </div>
      </div>

      {/* Alert Types Breakdown */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">Active by Type</h3>
        <div className="space-y-2">
          {Object.entries(alertCounts).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DisasterIcon 
                  type={type as 'fire' | 'flood' | 'outage' | 'storm' | 'shelter'} 
                  size={16} 
                  className="text-gray-600" 
                />
                <span className="text-sm font-medium text-gray-900 capitalize">{type}</span>
              </div>
              <span className="text-sm font-bold text-gray-700">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Summary */}
      {aiSummary && (
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-lg font-bold text-gray-900 mb-3">AI Analysis</h3>
          
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-3 ${getRiskColor(aiSummary.riskLevel)}`}>
            Risk Level: {aiSummary.riskLevel.toUpperCase()}
          </div>
          
          <p className="text-sm text-gray-700 mb-3">
            {aiSummary.summary}
          </p>
          
          <div className="space-y-1">
            {aiSummary.keyPoints.map((point, index) => (
              <div key={index} className="text-xs text-gray-600 flex items-start space-x-2">
                <span className="text-red-600 mt-1">•</span>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Recent Activity</h3>
        <div className="space-y-3">
          {activeAlerts.slice(0, 5).map((alert) => (
            <div key={alert.id} className="flex items-start space-x-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${alert.severity === 'critical' ? '#EF4444' : '#6B7280'}` }}
              >
                <DisasterIcon type={alert.type} size={14} className="text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-900 line-clamp-2">
                  {alert.description}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500">{alert.location_text}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{Math.round(alert.confidence_score * 100)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}