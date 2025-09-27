'use client'

import { useState, useEffect } from 'react'
import { Alert } from '@/lib/supabase'
import { EmergencyTicker } from '@/components/EmergencyTicker'
import { DisasterMap } from '@/components/DisasterMap'
import { FilterControls } from '@/components/FilterControls'
import { SummaryPanel } from '@/components/SummaryPanel'
import { AlertCard } from '@/components/AlertCard'
import { Navigation } from '@/components/Navigation'
import { Menu, X } from '@/components/Icons'

export default function DashboardPage() {
  // State management
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [filters, setFilters] = useState({
    fire: true,
    flood: true,
    outage: true,
    storm: true,
    shelter: true
  })
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)

  // Load data from API (which handles Supabase fallback to mock data)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/alerts')
        if (response.ok) {
          const data = await response.json()
          setAlerts(data)
        } else {
          console.error('Failed to fetch alerts, using mock data')
          // Fallback to imported mock data
          const { mockAlerts } = await import('@/lib/mockData')
          setAlerts(mockAlerts)
        }
      } catch (error) {
        console.error('Error loading alerts:', error)
        // Fallback to imported mock data
        const { mockAlerts } = await import('@/lib/mockData')
        setAlerts(mockAlerts)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedAlert) {
        setSelectedAlert(null)
      }
    }

    document.addEventListener('keydown', handleEscapeKey)
    return () => document.removeEventListener('keydown', handleEscapeKey)
  }, [selectedAlert])

  // Handle filter changes
  const handleFilterChange = (filter: keyof typeof filters, value: boolean) => {
    setFilters(prev => ({ ...prev, [filter]: value }))
  }

  // Handle alert selection
  const handleAlertClick = (alert: Alert) => {
    setSelectedAlert(alert)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto"></div>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">DisasterLens</h1>
          <p className="text-gray-600 mt-2">Loading emergency data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Emergency Ticker */}
      <EmergencyTicker alerts={alerts} />

      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div>
              <h1 className="text-2xl font-bold text-red-600">DisasterLens</h1>
              <p className="text-sm text-gray-600">Real-time Emergency Response Dashboard</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <Navigation />
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-bold text-gray-900">{alerts.length}</div>
              <div className="text-xs text-gray-600">Total Alerts</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-red-600">
                {alerts.filter(a => a.status === 'active').length}
              </div>
              <div className="text-xs text-gray-600">Active</div>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${
          sidebarOpen ? 'w-80' : 'w-0'
        } transition-all duration-300 overflow-hidden bg-white border-r-2 border-gray-200 h-[calc(100vh-140px)]`}>
          <div className="p-4 space-y-6 h-full overflow-y-auto">
            {/* Filter Controls */}
            <FilterControls 
              filters={filters} 
              onFilterChange={handleFilterChange}
            />

            {/* Summary Panel */}
            <SummaryPanel 
              alerts={alerts}
            />

            {/* Recent Alerts List */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900">Recent Alerts</h3>
              {alerts
                .filter(alert => filters[alert.type])
                .slice(0, 5)
                .map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onClick={() => handleAlertClick(alert)}
                    className="scale-90"
                  />
                ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4">
          <div className="h-[calc(100vh-180px)]">
            <DisasterMap
              alerts={alerts}
              filters={filters}
              onAlertClick={handleAlertClick}
              className="h-full"
            />
          </div>
        </main>
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedAlert(null)}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-md w-full max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Alert Details</h3>
              <button
                onClick={() => setSelectedAlert(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <AlertCard
              alert={selectedAlert}
              className="mb-4"
            />
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-semibold text-gray-900">Source:</span>
                <span className="ml-2 text-gray-700">{selectedAlert.source}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">Coordinates:</span>
                <span className="ml-2 text-gray-700">
                  {selectedAlert.location_lat.toFixed(4)}, {selectedAlert.location_lng.toFixed(4)}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">Created:</span>
                <span className="ml-2 text-gray-700">
                  {new Date(selectedAlert.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}