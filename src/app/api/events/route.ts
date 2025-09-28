// Server-Sent Events (SSE) endpoint for real-time updates
import { NextRequest } from 'next/server'
import { supabaseHelpers } from '@/lib/supabase'

// Keep track of active connections
const connections = new Set<ReadableStreamDefaultController>()

// Event types for real-time updates
export interface RealtimeEvent {
  type: 'alert-created' | 'alert-updated' | 'alert-deleted' | 'report-created' | 'report-updated' | 'report-deleted'
  data: Record<string, unknown> | { [key: string]: unknown }
  timestamp: string
}

// Global function to broadcast events to all connected clients
export const broadcastEvent = (event: RealtimeEvent) => {
  const eventData = `data: ${JSON.stringify(event)}\n\n`
  
  connections.forEach(controller => {
    try {
      controller.enqueue(new TextEncoder().encode(eventData))
    } catch {
      // Remove dead connections
      connections.delete(controller)
    }
  })
  
  console.log(`Broadcasting ${event.type} to ${connections.size} clients`)
}

export async function GET(request: NextRequest) {
  // Set up Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      // Add this connection to our set
      connections.add(controller)
      
      // Send initial connection message
      const initEvent: RealtimeEvent = {
        type: 'alert-created', // Use existing type for compatibility
        data: { message: 'Connected to DisasterLens real-time updates' },
        timestamp: new Date().toISOString()
      }
      
      const eventData = `data: ${JSON.stringify(initEvent)}\n\n`
      controller.enqueue(new TextEncoder().encode(eventData))
      
      // Send current data as initial state
      const sendInitialData = async () => {
        try {
          // Check if controller is still open
          if (connections.has(controller)) {
            // Get current alerts and reports
            const [alerts, reports] = await Promise.all([
              supabaseHelpers.fetchAlerts().catch(() => []),
              supabaseHelpers.fetchReports().catch(() => [])
            ])
            
            // Send initial alerts
            if (alerts.length > 0 && connections.has(controller)) {
              const alertsEvent: RealtimeEvent = {
                type: 'alert-created',
                data: { type: 'initial-alerts', alerts },
                timestamp: new Date().toISOString()
              }
              try {
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(alertsEvent)}\n\n`))
              } catch {
                console.log('Controller closed during initial alerts send')
                connections.delete(controller)
                return
              }
            }
            
            // Send initial reports
            if (reports.length > 0 && connections.has(controller)) {
              const reportsEvent: RealtimeEvent = {
                type: 'report-created',
                data: { type: 'initial-reports', reports },
                timestamp: new Date().toISOString()
              }
              try {
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(reportsEvent)}\n\n`))
              } catch {
                console.log('Controller closed during initial reports send')
                connections.delete(controller)
                return
              }
            }
          }
        } catch (error) {
          console.error('Error sending initial data:', error)
          connections.delete(controller)
        }
      }
      
      sendInitialData()
      
      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        try {
          if (connections.has(controller)) {
            const heartbeatEvent = `data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`
            controller.enqueue(new TextEncoder().encode(heartbeatEvent))
          }
        } catch {
          clearInterval(heartbeat)
          connections.delete(controller)
        }
      }, 30000) // Send heartbeat every 30 seconds
      
      // Clean up on connection close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        connections.delete(controller)
        controller.close()
      })
    },
    
    cancel(controller: ReadableStreamDefaultController) {
      // Clean up when stream is cancelled
      connections.delete(controller)
    }
  })

  // Return SSE response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  })
}