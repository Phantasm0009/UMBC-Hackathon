'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Alert, Report } from '@/lib/supabase'

interface RealtimeEvent {
  type: 'alert-created' | 'alert-updated' | 'alert-deleted' | 'report-created' | 'report-updated' | 'report-deleted' | 'heartbeat'
  data: Record<string, unknown>
  timestamp: string
}

interface UseRealtimeDataReturn {
  alerts: Alert[]
  reports: Report[]
  isConnected: boolean
  connectionError: string | null
  reconnect: () => void
  loading: boolean
}

export const useRealtimeData = (): UseRealtimeDataReturn => {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)

  const handleEvent = useCallback((event: MessageEvent) => {
    try {
      const eventData: RealtimeEvent = JSON.parse(event.data)
      
      // Skip heartbeat events
      if (eventData.type === 'heartbeat') return
      
      console.log('Received real-time event:', eventData.type, eventData.data)
      
      switch (eventData.type) {
        case 'alert-created':
          if (eventData.data.type === 'initial-alerts') {
            // Initial data load
            console.log('Loading initial alerts:', (eventData.data.alerts as Alert[])?.length)
            setAlerts(eventData.data.alerts as Alert[])
            setLoading(false)
          } else {
            // New alert created
            console.log('New alert created:', eventData.data)
            const newAlert = eventData.data as unknown as Alert
            setAlerts(prev => {
              // Avoid duplicates
              if (prev.some(alert => alert.id === newAlert.id)) return prev
              return [newAlert, ...prev]
            })
          }
          break
          
        case 'alert-updated':
          const updatedAlert = eventData.data as unknown as Alert
          setAlerts(prev => prev.map(alert => 
            alert.id === updatedAlert.id ? updatedAlert : alert
          ))
          break
          
        case 'alert-deleted':
          const deletedAlertId = eventData.data.id as string
          setAlerts(prev => prev.filter(alert => alert.id !== deletedAlertId))
          break
          
        case 'report-created':
          if (eventData.data.type === 'initial-reports') {
            // Initial data load
            console.log('Loading initial reports:', (eventData.data.reports as Report[])?.length)
            setReports(eventData.data.reports as Report[])
            setLoading(false)
          } else {
            // New report created
            console.log('New report created:', eventData.data)
            const newReport = eventData.data as unknown as Report
            setReports(prev => {
              // Avoid duplicates
              if (prev.some(report => report.id === newReport.id)) return prev
              return [newReport, ...prev]
            })
          }
          break
          
        case 'report-updated':
          const updatedReport = eventData.data as unknown as Report
          setReports(prev => prev.map(report => 
            report.id === updatedReport.id ? updatedReport : report
          ))
          break
          
        case 'report-deleted':
          const deletedReportId = eventData.data.id as string
          setReports(prev => prev.filter(report => report.id !== deletedReportId))
          break
      }
    } catch (error) {
      console.error('Error parsing SSE event:', error)
    }
  }, [])

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    try {
      console.log('Connecting to real-time events...')
      const eventSource = new EventSource('/api/events')
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        console.log('Real-time connection established')
        setIsConnected(true)
        setConnectionError(null)
        reconnectAttempts.current = 0
      }

      eventSource.onmessage = handleEvent

      eventSource.onerror = () => {
        console.error('Real-time connection error')
        setIsConnected(false)
        eventSource.close()
        
        // Implement exponential backoff for reconnection
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
        setConnectionError(`Connection lost. Reconnecting in ${delay/1000}s...`)
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttempts.current++
          connect()
        }, delay)
      }
    } catch (error) {
      console.error('Failed to create EventSource:', error)
      setConnectionError('Failed to establish real-time connection')
    }
  }, [handleEvent])

  const reconnect = useCallback(() => {
    reconnectAttempts.current = 0
    connect()
  }, [connect])

  // Load initial data fallback (in case SSE fails)
  const loadFallbackData = useCallback(async () => {
    if (!isConnected && loading) {
      try {
        console.log('Loading fallback data via API...')
        const [alertsResponse, reportsResponse] = await Promise.all([
          fetch('/api/alerts'),
          fetch('/api/reports')
        ])

        if (alertsResponse.ok) {
          const alertsData = await alertsResponse.json()
          setAlerts(alertsData)
        }

        if (reportsResponse.ok) {
          const reportsData = await reportsResponse.json()
          setReports(reportsData)
        }

        setLoading(false)
      } catch (error) {
        console.error('Error loading fallback data:', error)
        // Load mock data as final fallback
        try {
          const { mockAlerts, mockReports } = await import('@/lib/mockData')
          setAlerts(mockAlerts)
          setReports(mockReports)
          setLoading(false)
        } catch (mockError) {
          console.error('Error loading mock data:', mockError)
        }
      }
    }
  }, [isConnected, loading])

  useEffect(() => {
    // Start connection
    connect()
    
    // Fallback data loading timeout
    const fallbackTimeout = setTimeout(() => {
      loadFallbackData()
    }, 3000) // Wait 3 seconds for real-time connection

    return () => {
      // Cleanup
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      clearTimeout(fallbackTimeout)
    }
  }, [connect, loadFallbackData])

  return {
    alerts,
    reports,
    isConnected,
    connectionError,
    reconnect,
    loading
  }
}