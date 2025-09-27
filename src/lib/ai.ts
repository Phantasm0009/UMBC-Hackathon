// AI Service for disaster classification and report summarization
// Currently using mock data - integrate with Gemini API later

import { Alert, Report } from './supabase'

export interface ClassificationResult {
  type: Alert['type']
  confidence: number
  severity: Alert['severity']
  summary: string
}

export interface SummaryResult {
  summary: string
  keyPoints: string[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

/**
 * Classify disaster data using AI (currently mocked)
 * TODO: Integrate with Gemini API
 */
export async function classifyData(text: string, imageUrl?: string): Promise<ClassificationResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Mock classification based on keywords
  let type: Alert['type'] = 'outage'
  let severity: Alert['severity'] = 'medium'
  let confidence = 0.7
  
  const lowerText = text.toLowerCase()
  
  // TODO: Use imageUrl for image analysis when Gemini API is integrated
  if (imageUrl) {
    // Future: Image analysis would happen here
    confidence += 0.1 // Boost confidence if image provided
  }
  
  if (lowerText.includes('fire') || lowerText.includes('smoke') || lowerText.includes('burning')) {
    type = 'fire'
    severity = 'high'
    confidence = 0.9
  } else if (lowerText.includes('flood') || lowerText.includes('water') || lowerText.includes('rain')) {
    type = 'flood'
    severity = 'medium'
    confidence = 0.8
  } else if (lowerText.includes('power') || lowerText.includes('electricity') || lowerText.includes('outage')) {
    type = 'outage'
    severity = 'low'
    confidence = 0.75
  } else if (lowerText.includes('storm') || lowerText.includes('wind') || lowerText.includes('hurricane')) {
    type = 'storm'
    severity = 'high'
    confidence = 0.85
  } else if (lowerText.includes('shelter') || lowerText.includes('evacuation') || lowerText.includes('safe')) {
    type = 'shelter'
    severity = 'medium'
    confidence = 0.6
  }
  
  const summaries = {
    fire: `🔥 Fire incident detected with ${Math.round(confidence * 100)}% confidence. Immediate attention required.`,
    flood: `🌊 Flooding situation identified with ${Math.round(confidence * 100)}% confidence. Monitor water levels.`,
    outage: `⚡ Power outage reported with ${Math.round(confidence * 100)}% confidence. Utility crews notified.`,
    storm: `🌪️ Storm activity detected with ${Math.round(confidence * 100)}% confidence. Weather alert issued.`,
    shelter: `🏠 Emergency shelter request with ${Math.round(confidence * 100)}% confidence. Resources being allocated.`
  }
  
  return {
    type,
    confidence,
    severity,
    summary: summaries[type]
  }
}

/**
 * Summarize multiple reports using AI (currently mocked)
 * TODO: Integrate with Gemini API
 */
export async function summarizeReports(reports: Report[]): Promise<SummaryResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800))
  
  if (reports.length === 0) {
    return {
      summary: "No reports to analyze",
      keyPoints: [],
      riskLevel: 'low'
    }
  }
  
  const reportTypes = reports.map(r => r.alert_type).filter(Boolean)
  const locations = reports.map(r => r.location_text)
  
  const typeCount = reportTypes.reduce((acc: Record<string, number>, type) => {
    if (type) acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})
  
  const mostCommonType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0]
  
  let riskLevel: SummaryResult['riskLevel'] = 'low'
  if (reports.length > 10) riskLevel = 'critical'
  else if (reports.length > 5) riskLevel = 'high'
  else if (reports.length > 2) riskLevel = 'medium'
  
  const summary = mostCommonType 
    ? `${reports.length} reports received, primarily ${mostCommonType[0]} incidents (${mostCommonType[1]} reports). Areas affected: ${locations.slice(0, 3).join(', ')}${locations.length > 3 ? '...' : ''}.`
    : `${reports.length} diverse reports received from multiple locations.`
  
  const keyPoints = [
    `Total reports: ${reports.length}`,
    `Most affected areas: ${locations.slice(0, 2).join(', ')}`,
    `Primary incident type: ${mostCommonType?.[0] || 'Mixed'}`,
    `Risk assessment: ${riskLevel.toUpperCase()}`
  ]
  
  return {
    summary,
    keyPoints,
    riskLevel
  }
}

/**
 * Generate emergency alert message
 */
export function generateAlertMessage(alert: Alert): string {
  const typeEmojis = {
    fire: '🔥',
    flood: '🌊',
    outage: '⚡',
    storm: '🌪️',
    shelter: '🏠'
  }
  
  const severityTexts = {
    low: 'Advisory',
    medium: 'Watch',
    high: 'Warning',
    critical: 'EMERGENCY'
  }
  
  return `${typeEmojis[alert.type]} ${severityTexts[alert.severity]}: ${alert.description} - ${alert.location_text} (${Math.round(alert.confidence_score * 100)}% confidence)`
}