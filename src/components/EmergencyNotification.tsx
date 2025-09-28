'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, X } from '@/components/Icons'

interface EmergencyNotificationProps {
  show: boolean
  onClose: () => void
  message: string
}

export const EmergencyNotification = ({ show, onClose, message }: EmergencyNotificationProps) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(onClose, 300) // Wait for animation to complete
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  if (!show) return null

  return (
    <div className={`fixed top-4 left-4 right-4 z-[9997] transition-all duration-300 ${
      visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
    }`}>
      <div className="bg-red-600 text-white p-4 rounded-lg shadow-lg mx-auto max-w-sm animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle size={20} className="animate-pulse flex-shrink-0" />
            <p className="text-sm font-medium flex-1">{message}</p>
          </div>
          <button
            onClick={() => {
              setVisible(false)
              setTimeout(onClose, 300)
            }}
            className="p-1 hover:bg-red-700 rounded transition-colors duration-200 flex-shrink-0 ml-2"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}