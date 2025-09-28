'use client'

import { useState, useCallback } from 'react'
import { Alert, Report } from '@/lib/supabase'

interface EmergencyModeHook {
  isEmergencyMode: boolean
  shouldShowEmergencyMode: boolean
  shouldShowNotification: boolean
  emergencyModeShown: boolean
  closeEmergencyMode: () => void
  closeNotification: () => void
  resetEmergencyMode: () => void
  checkEmergencyStatus: (alerts: Alert[], reports: Report[]) => boolean
}

export const useEmergencyMode = (): EmergencyModeHook => {
  const [isEmergencyMode, setIsEmergencyMode] = useState(false)
  const [emergencyModeShown, setEmergencyModeShown] = useState(false)
  const [notificationShown, setNotificationShown] = useState(false)
  const [lastEmergencyCheck, setLastEmergencyCheck] = useState<string>('')

  // Check if we're on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  // Function to check if there are critical/high priority incidents
  const checkEmergencyStatus = useCallback((alerts: Alert[], reports: Report[]): boolean => {
    // Check for critical or high severity alerts
    const criticalAlerts = alerts.filter(alert => 
      alert.status === 'active' && 
      (alert.severity === 'critical' || alert.severity === 'high')
    )
    
    // Check for critical or high severity approved reports
    const criticalReports = reports.filter(report => 
      report.status === 'approved' && 
      (report.severity === 'critical' || report.severity === 'high')
    )
    
    const hasEmergency = criticalAlerts.length > 0 || criticalReports.length > 0
    
    // Create a unique key for this emergency state
    const emergencyKey = `${criticalAlerts.length}-${criticalReports.length}-${
      [...criticalAlerts, ...criticalReports].map(item => item.id).sort().join(',')
    }`
    
    // Only trigger if this is a new emergency situation
    if (hasEmergency && emergencyKey !== lastEmergencyCheck) {
      setIsEmergencyMode(true)
      setLastEmergencyCheck(emergencyKey)
      
      // Reset shown states for new emergency
      setEmergencyModeShown(false)
      setNotificationShown(false)
      
      // Try to trigger browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Emergency Alert', {
          body: 'Critical incident detected in your area',
          icon: '/favicon.ico'
        })
      }
      
      // Try to vibrate on mobile
      if ('vibrator' in navigator || 'webkitVibrate' in navigator) {
        navigator.vibrate?.(200)
      }
      
      return true
    } else if (!hasEmergency) {
      setIsEmergencyMode(false)
      setLastEmergencyCheck('')
    }
    
    return hasEmergency
  }, [lastEmergencyCheck])

  // Close emergency mode (user dismissed it)
  const closeEmergencyMode = useCallback(() => {
    setEmergencyModeShown(true)
  }, [])

  // Close notification (user dismissed it)
  const closeNotification = useCallback(() => {
    setNotificationShown(true)
  }, [])

  // Reset emergency mode state
  const resetEmergencyMode = useCallback(() => {
    setIsEmergencyMode(false)
    setEmergencyModeShown(false)
    setNotificationShown(false)
    setLastEmergencyCheck('')
  }, [])

  // Determine what to show
  const shouldShowEmergencyMode = isMobile && isEmergencyMode && !emergencyModeShown
  const shouldShowNotification = !isMobile && isEmergencyMode && !notificationShown

  return {
    isEmergencyMode,
    shouldShowEmergencyMode,
    shouldShowNotification,
    emergencyModeShown,
    closeEmergencyMode,
    closeNotification,
    resetEmergencyMode,
    checkEmergencyStatus
  }
}