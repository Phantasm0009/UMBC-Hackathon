'use client'

import dynamic from 'next/dynamic'
import { Alert, Report } from '@/lib/supabase'
import { useEffect, useState, useRef } from 'react'
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
  reports?: Report[]
  className?: string
  onAlertClick?: (alert: Alert) => void
  onReportClick?: (report: Report) => void
  filters?: {
    fire: boolean
    flood: boolean
    outage: boolean
    storm: boolean
    shelter: boolean
  }
}

// Custom icon creation function using dynamic import - SIMPLE MAP PINS
const createColoredIcon = (color: string, isReport = false, disasterType?: string) => {
  if (typeof window === 'undefined') return null
  
  // Check if Leaflet is available
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leaflet = (window as any).L
  if (!leaflet || !leaflet.divIcon) return null
  
  // Get appropriate emergency icon based on disaster type
  const getEmergencyIcon = (type?: string) => {
    switch (type) {
      case 'fire': return '🔥'
      case 'flood': return '🌊'
      case 'outage': return '⚡'
      case 'storm': return '🌪️'
      case 'shelter': return '🏠'
      default: return '⚠️'
    }
  }
  
  const emergencyIcon = getEmergencyIcon(disasterType)
  
  try {
    const iconHtml = `
      <div style="
        background: ${color};
        width: 25px;
        height: 25px;
        border-radius: 50% 50% 50% 0;
        border: 3px solid #ffffff;
        box-shadow: 0 2px 10px rgba(0,0,0,0.4);
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        ${isReport ? 'border-style: dashed;' : ''}
      ">
        <div style="
          color: white;
          font-size: 14px;
          transform: rotate(45deg);
          text-shadow: 0 1px 2px rgba(0,0,0,0.7);
        ">${emergencyIcon}</div>
      </div>
    `
    
    return leaflet.divIcon({
      html: iconHtml,
      className: 'simple-map-pin',
      iconSize: [25, 25],
      iconAnchor: [12, 25], // Point of the pin touches the location
      popupAnchor: [0, -25]
    })
  } catch (error) {
    console.warn('Error creating colored icon:', error)
    return null
  }
}

// Safe zone icon - SIMPLE SAFE ZONE PIN
const createSafeZoneIcon = () => {
  if (typeof window === 'undefined') return null
  
  // Check if Leaflet is available
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leaflet = (window as any).L
  if (!leaflet || !leaflet.divIcon) return null
  
  try {
    const iconHtml = `
      <div style="
        background: #10B981;
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        border: 3px solid #ffffff;
        box-shadow: 0 2px 10px rgba(0,0,0,0.4);
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: safeZonePulse 2s infinite;
      ">
        <div style="
          color: white;
          font-size: 16px;
          transform: rotate(45deg);
          text-shadow: 0 1px 2px rgba(0,0,0,0.7);
        ">🏥</div>
      </div>
      
      <style>
        @keyframes safeZonePulse {
          0%, 100% { transform: scale(1) rotate(-45deg); }
          50% { transform: scale(1.1) rotate(-45deg); }
        }
      </style>
    `
    
    return leaflet.divIcon({
      html: iconHtml,
      className: 'simple-safe-pin',
      iconSize: [30, 30],
      iconAnchor: [15, 30], // Point of the pin touches the location
      popupAnchor: [0, -30]
    })
  } catch (error) {
    console.warn('Error creating safe zone icon:', error)
    return null
  }
}

export const DisasterMap = ({ 
  alerts, 
  reports = [],
  className = '', 
  onAlertClick,
  onReportClick,
  filters = { fire: true, flood: true, outage: true, storm: true, shelter: true }
}: DisasterMapProps) => {
  const [safeZoneLocation, setSafeZoneLocation] = useState<[number, number] | null>(null)
  const [nearbyEmergencies, setNearbyEmergencies] = useState<Alert[]>([])
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    // Wait for Leaflet to be fully loaded
    const checkLeaflet = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof window !== 'undefined' && (window as any).L && (window as any).L.divIcon) {
        console.log('Leaflet is ready!')
      } else {
        setTimeout(checkLeaflet, 100)
      }
    }
    
    checkLeaflet()
    
    // Add custom CSS for markers and ensure proper map sizing
    if (typeof document !== 'undefined' && !document.querySelector('#disaster-map-styles')) {
      const style = document.createElement('style')
      style.id = 'disaster-map-styles'
      style.textContent = `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        .safe-zone-marker {
          animation: pulse 2s infinite;
        }
        .custom-disaster-marker {
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }
        .leaflet-container {
          height: 100% !important;
          width: 100% !important;
        }
        .leaflet-control-container .leaflet-top.leaflet-left {
          top: 10px;
          left: 10px;
        }
        
        /* Fix marker positioning during zoom */
        .emergency-sign-marker,
        .emergency-shelter-marker {
          position: relative !important;
          transform-origin: center center !important;
        }
        
        /* Ensure markers stay centered on their coordinates */
        .leaflet-marker-icon {
          margin-left: 0 !important;
          margin-top: 0 !important;
        }
        
        .leaflet-div-icon {
          background: transparent !important;
          border: none !important;
        }
      `
      document.head.appendChild(style)
    }

    // Add window resize handler to ensure map stays responsive
    const handleResize = () => {
      if (mapRef.current && mapRef.current.invalidateSize) {
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize()
          }
        }, 100)
      }
    }

    window.addEventListener('resize', handleResize)

    // Delay map initialization to ensure DOM is ready
    const timer = setTimeout(() => {
      console.log('Map initialization timer completed')
    }, 100)

    // Cleanup function to help prevent Leaflet errors
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
      
      try {
        // Clean up any remaining leaflet elements
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const leaflet = (window as any).L
        if (leaflet && leaflet.DomUtil && leaflet.DomUtil.remove) {
          // Clean up any remaining leaflet elements
          const leafletContainers = document.querySelectorAll('.leaflet-container')
          leafletContainers.forEach((container: Element) => {
            try {
              // Force cleanup of any marker-related events
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const mapElement = container as any
              if (mapElement._leaflet_id) {
                delete mapElement._leaflet_id
              }
            } catch {
              // Ignore cleanup errors
            }
          })
        }
      } catch {
        // Ignore cleanup errors to prevent console spam
      }
    }
  }, [])

  // Check for nearby emergencies when alerts or filters change
  useEffect(() => {
    const filteredAlerts = alerts.filter(alert => filters[alert.type])
    
    if (filteredAlerts.length > 0) {
      // Check for nearby emergencies (within 5km radius of Baltimore center)
      const baltimoreCenter = [39.2904, -76.6122]
      const nearbyRadius = 0.05 // roughly 5km in degrees
      
      const nearby = filteredAlerts.filter(alert => {
        const distance = Math.sqrt(
          Math.pow(alert.location_lat - baltimoreCenter[0], 2) + 
          Math.pow(alert.location_lng - baltimoreCenter[1], 2)
        )
        return distance <= nearbyRadius && (alert.severity === 'critical' || alert.severity === 'high')
      })
      
      setNearbyEmergencies(nearby)
    } else {
      setNearbyEmergencies([])
    }
  }, [alerts, filters])

  const filteredAlerts = alerts.filter(alert => filters[alert.type])

  // Baltimore area center
  const defaultCenter: [number, number] = [39.2904, -76.6122]
  const defaultZoom = 11

  const findNearestSafeZone = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userLat = position.coords.latitude
        const userLng = position.coords.longitude
        
        // Mock safe zones (in real app, this would come from API)
        const safeZones = [
          { name: 'Baltimore Convention Center', lat: 39.2860, lng: -76.6080 },
          { name: 'M&T Bank Stadium', lat: 39.2780, lng: -76.6227 },
          { name: 'Inner Harbor Emergency Center', lat: 39.2864, lng: -76.6099 },
        ]
        
        // Find nearest safe zone (simple distance calculation)
        let nearestZone = safeZones[0]
        let minDistance = Math.sqrt(
          Math.pow(userLat - safeZones[0].lat, 2) + 
          Math.pow(userLng - safeZones[0].lng, 2)
        )
        
        safeZones.forEach(zone => {
          const distance = Math.sqrt(
            Math.pow(userLat - zone.lat, 2) + 
            Math.pow(userLng - zone.lng, 2)
          )
          if (distance < minDistance) {
            minDistance = distance
            nearestZone = zone
          }
        })
        
        // Set the safe zone marker
        setSafeZoneLocation([nearestZone.lat, nearestZone.lng])
        
        // Show notification
        const estimatedTime = Math.max(5, Math.round(minDistance * 1000)) // Mock time calculation
        alert(`🚨 Nearest Safe Zone Found!\n\n📍 ${nearestZone.name}\n⏱️ Estimated arrival: ${estimatedTime} minutes\n\n✅ Safe zone marker added to map!`)
      }, () => {
        // Fallback to default safe zone if location access denied
        const defaultSafeZone: [number, number] = [39.2860, -76.6080] // Baltimore Convention Center
        setSafeZoneLocation(defaultSafeZone)
        alert(`🚨 Using Default Safe Zone\n\n📍 Baltimore Convention Center\n⏱️ Please enable location services for personalized routing\n\n✅ Safe zone marker added to map!`)
      })
    } else {
      alert('❌ Geolocation not supported by this browser.')
    }
  }

  return (
    <div className={`rounded-2xl overflow-hidden border-2 border-gray-200 relative h-full ${className}`}>
      {/* Emergency Near You Banner */}
      {nearbyEmergencies.length > 0 && (
        <div className="absolute top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-red-600 to-red-700 text-white p-3 shadow-2xl">
          <div className="flex items-center justify-center space-x-3 animate-pulse">
            <div className="text-2xl animate-bounce">🚨</div>
            <div className="text-center">
              <div className="text-lg font-black uppercase tracking-wider">
                ⚠️ {nearbyEmergencies.length} EMERGENCY{nearbyEmergencies.length > 1 ? 'IES' : ''} NEAR YOU ⚠️
              </div>
              <div className="text-sm font-medium opacity-90">
                {nearbyEmergencies.map(e => e.type.toUpperCase()).join(' • ')} - Take Immediate Action!
              </div>
            </div>
            <div className="text-2xl animate-bounce">🚨</div>
          </div>
        </div>
      )}

      <div className="h-full w-full">
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: '100%', width: '100%' }}
          className="leaflet-container h-full w-full"
          maxZoom={18}
          minZoom={3}
          whenReady={() => {
            // Force map resize and invalidation after initialization
            setTimeout(() => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const leaflet = (window as any).L
              if (leaflet) {
                const containers = document.querySelectorAll('.leaflet-container')
                containers.forEach((container: Element) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const mapInstance = (container as any)._leaflet_map
                  if (mapInstance && mapInstance.invalidateSize) {
                    mapRef.current = mapInstance
                    mapInstance.invalidateSize()
                    
                    // Add zoom event handler to maintain marker positions
                    mapInstance.on('zoomstart', () => {
                      // Prepare markers for zoom
                      const markers = container.querySelectorAll('.leaflet-marker-icon')
                      markers.forEach((marker: Element) => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (marker as any).style.transition = 'none'
                      })
                    })
                    
                    mapInstance.on('zoomend', () => {
                      // Re-enable transitions after zoom
                      setTimeout(() => {
                        const markers = container.querySelectorAll('.leaflet-marker-icon')
                        markers.forEach((marker: Element) => {
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          (marker as any).style.transition = 'all 0.2s ease'
                        })
                      }, 100)
                    })
                  }
                })
              }
            }, 100)
            
            // Additional resize after DOM stabilization
            setTimeout(() => {
              if (mapRef.current && mapRef.current.invalidateSize) {
                mapRef.current.invalidateSize()
              }
            }, 500)
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
            subdomains={['a', 'b', 'c']}
          />
        
        {/* Colored Alert Markers */}
        {filteredAlerts.map((alert) => {
          const customIcon = createColoredIcon(getDisasterColor(alert.type), false, alert.type)
          if (!customIcon) {
            console.warn('Failed to create icon for alert:', alert.id, alert.type)
            return null
          }
          
          return (
            <Marker
              key={alert.id}
              position={[alert.location_lat, alert.location_lng]}
              icon={customIcon}
              eventHandlers={{
                click: (e) => {
                  console.log('Alert marker clicked:', alert.id, alert.type)
                  onAlertClick?.(alert)
                  // Force popup to open
                  const target = e.target
                  if (target && target.openPopup) {
                    target.openPopup()
                  }
                }
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
          )
        })}

        {/* Colored Report Markers - Only show approved reports */}
        {reports
          .filter(report => 
            report.status === 'approved' && 
            report.alert_type && 
            filters[report.alert_type] &&
            report.location_lat && 
            report.location_lng
          )
          .map((report) => {
            const customIcon = createColoredIcon(getDisasterColor(report.alert_type!), true, report.alert_type!)
            if (!customIcon) {
              console.warn('Failed to create icon for report:', report.id, report.alert_type)
              return null
            }
            
            return (
              <Marker
                key={`report-${report.id}`}
                position={[report.location_lat, report.location_lng]}
                icon={customIcon}
                eventHandlers={{
                  click: (e) => {
                    console.log('Report marker clicked:', report.id, report.alert_type)
                    onReportClick?.(report)
                    // Force popup to open
                    const target = e.target
                    if (target && target.openPopup) {
                      target.openPopup()
                    }
                  }
                }}
              >
                <Popup maxWidth={300} minWidth={250}>
                  <div className="p-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-lg"
                        style={{ backgroundColor: getDisasterColor(report.alert_type!) }}
                      >
                        <DisasterIcon type={report.alert_type!} size={16} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 capitalize">
                          {report.alert_type} Report
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                            👤 Citizen Report
                          </span>
                          {report.severity && (
                            <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                              report.severity === 'high' ? 'bg-red-100 text-red-800' :
                              report.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              🚨 {report.severity} Priority
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                      {report.text_report}
                    </p>
                    
                    <div className="text-xs text-gray-600 space-y-1 border-t pt-2">
                      <div className="flex items-center space-x-2">
                        <span>📍</span>
                        <span>{report.location_text || 'Location provided'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>⏱️</span>
                        <span>{formatDistanceToNow(new Date(report.created_at))} ago</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>🤖</span>
                        <span>AI Analysis: {Math.round((report.confidence_score || 0.75) * 100)}%</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>✅</span>
                        <span>Status: {report.status}</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}

        {/* Safe Zone Marker */}
        {safeZoneLocation && (() => {
          const safeZoneIcon = createSafeZoneIcon()
          if (!safeZoneIcon) {
            console.warn('Failed to create safe zone icon')
            return null
          }
          return (
            <Marker
              position={safeZoneLocation}
              icon={safeZoneIcon}
              eventHandlers={{
                click: (e) => {
                  console.log('Safe zone marker clicked')
                  // Force popup to open
                  const target = e.target
                  if (target && target.openPopup) {
                    target.openPopup()
                  }
                }
              }}
            >
              <Popup maxWidth={250} minWidth={200}>
                <div className="p-2 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <span className="text-2xl">🏥</span>
                    <h3 className="font-bold text-green-700">Safe Zone</h3>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    Emergency evacuation point with medical facilities and shelter.
                  </p>
                  <div className="text-xs text-green-600 font-medium">
                    ✅ Safe to approach
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })()}
        </MapContainer>
      </div>

      {/* Map Legend - Positioned at top-left */}
      <div className={`absolute ${nearbyEmergencies.length > 0 ? 'top-20' : 'top-4'} left-4 bg-white rounded-lg border-2 border-gray-200 p-3 shadow-xl z-50 max-w-[220px]`}>
        <h4 className="text-sm font-semibold text-gray-800 mb-2">🗺️ Map Legend</h4>
        
        <div className="space-y-2">
          <div className="space-y-1">
            {Object.entries(filters).map(([type, enabled]) => (
              enabled && (
                <div key={type} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: getDisasterColor(type as Alert['type']) }}
                  />
                  <span className="text-xs text-gray-700 capitalize">{type}</span>
                  <span className="text-xs text-gray-500">
                    ({filteredAlerts.filter(a => a.type === type).length})
                  </span>
                </div>
              )
            ))}
          </div>
          <div className="border-t border-gray-200 pt-2">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-3 h-3 bg-red-500 border border-white shadow-sm" style={{ borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg) scale(0.8)' }} />
              <span className="text-xs text-gray-700">Official Alerts</span>
            </div>
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-3 h-3 bg-blue-500 border-2 border-white shadow-sm" style={{ borderRadius: '50% 50% 50% 0', borderStyle: 'dashed', transform: 'rotate(-45deg) scale(0.8)' }} />
              <span className="text-xs text-gray-700">Citizen Reports</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-sm" />
              <span className="text-xs text-gray-700">Safe Zones</span>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Routing Panel - Moved to top right, below map controls */}
      <div className={`absolute ${nearbyEmergencies.length > 0 ? 'top-32' : 'top-20'} right-4 bg-red-600 text-white rounded-lg p-3 shadow-xl z-50`} style={{ pointerEvents: 'auto' }}>
        <h4 className="text-sm font-semibold mb-2">🚨 Emergency Routes</h4>
        <button 
          className="text-xs bg-white text-red-600 px-3 py-2 rounded hover:bg-gray-100 transition-colors font-medium"
          onClick={findNearestSafeZone}
        >
          🏥 Find Nearest Safe Zone
        </button>
        {safeZoneLocation && (
          <button 
            className="text-xs bg-white text-red-600 px-3 py-1 rounded hover:bg-gray-100 transition-colors font-medium mt-2 block w-full"
            onClick={() => setSafeZoneLocation(null)}
          >
            Clear Marker
          </button>
        )}
      </div>
    </div>
  )
}