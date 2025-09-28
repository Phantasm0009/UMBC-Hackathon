'use client'

import { useState } from 'react'
import { AlertTriangle } from '@/components/Icons'

interface EmergencyModeTestProps {
  onCreateCriticalIncident: () => void
  onCreateHighIncident: () => void
  onClearIncidents: () => void
}

export const EmergencyModeTest = ({ 
  onCreateCriticalIncident, 
  onCreateHighIncident, 
  onClearIncidents 
}: EmergencyModeTestProps) => {
  const [isVisible, setIsVisible] = useState(false)

  // Only show in development environment
  if (process.env.NODE_ENV !== 'development') return null

  return (
    <>
      {/* Debug Toggle Button - Fixed position */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-[9998] bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-colors duration-200 md:hidden"
        title="Emergency Mode Test (Dev Only)"
      >
        <AlertTriangle size={20} />
      </button>

      {/* Debug Panel */}
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-end justify-center p-4">
          <div className="bg-white rounded-t-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Emergency Test</h3>
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  onCreateCriticalIncident()
                  setIsVisible(false)
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                🚨 Create Critical Incident
              </button>
              
              <button
                onClick={() => {
                  onCreateHighIncident()
                  setIsVisible(false)
                }}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                ⚠️ Create High Priority Incident
              </button>
              
              <button
                onClick={() => {
                  onClearIncidents()
                  setIsVisible(false)
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                🧹 Clear Test Incidents
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-4 text-center">
              Development only - creates test emergency incidents
            </p>
          </div>
        </div>
      )}
    </>
  )
}