'use client'

import dynamic from 'next/dynamic'
import { Alert } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { DisasterIcon, getDisasterColor } from './Icons'
import { formatDistanceToNow } from 'date-fns'

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

interface DisasterMapProps {
  alerts: Alert[]
  className?: string
  onAlertClick?: (alert: Alert) => void
  filters?: {
    fire: boolean
    flood: boolean
    outage: boolean
    storm: boolean
    shelter: boolean
  }
}

export const DisasterMap = ({ 
  alerts, 
  className = '', 
  onAlertClick,
  filters = { fire: true, flood: true, outage: true, storm: true, shelter: true }
}: DisasterMapProps) => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Load Leaflet CSS
    if (typeof document !== 'undefined') {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css'
      link.integrity = 'sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=='
      link.crossOrigin = ''
      
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        document.head.appendChild(link)
      }
    }
  }, [])

  if (!isClient) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-2xl ${className}`} style={{ height: '400px' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading map...</p>
        </div>
      </div>
    )
  }

  // Filter alerts based on active filters
  const filteredAlerts = alerts.filter(alert => filters[alert.type])

  // Default center (Baltimore area)
  const defaultCenter: [number, number] = [39.2904, -76.6122]
  const defaultZoom = 11

  return (
    <div className={`rounded-2xl overflow-hidden border-2 border-gray-200 ${className}`}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        className="leaflet-container"
        maxZoom={18}
        minZoom={3}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          subdomains={['a', 'b', 'c']}
        />
        
        {filteredAlerts.map((alert) => (
          <Marker
            key={alert.id}
            position={[alert.location_lat, alert.location_lng]}
            eventHandlers={{
              click: () => onAlertClick?.(alert)
            }}
          >
            <Popup maxWidth={300} minWidth={250}>
              <div className="p-2">
                <div className="flex items-center space-x-2 mb-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: getDisasterColor(alert.type) }}
                  >
                    <DisasterIcon type={alert.type} size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 capitalize">
                      {alert.type} Alert
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                        alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                        alert.status === 'active' ? 'bg-red-100 text-red-800' :
                        alert.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {alert.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                  {alert.description}
                </p>
                
                <div className="text-xs text-gray-600 space-y-1 border-t pt-2">
                  <div className="flex items-center space-x-2">
                    <span>📍</span>
                    <span>{alert.location_text}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>⏱️</span>
                    <span>{formatDistanceToNow(new Date(alert.created_at))} ago</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>🎯</span>
                    <span>{Math.round(alert.confidence_score * 100)}% confidence</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>📊</span>
                    <span>Source: {alert.source}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}