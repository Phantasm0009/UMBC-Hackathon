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
  
  const lowerText = text.toLowerCase()
  
  // Advanced keyword detection with scoring system
  const categoryScores = {
    fire: 0,
    flood: 0,
    outage: 0,
    storm: 0,
    shelter: 0
  }
  
  // FIRE DETECTION - Enhanced with more comprehensive keywords
  const fireKeywords = {
    high: ['fire', 'burning', 'flames', 'smoke', 'explosion', 'blast', 'ignite', 'combustion', 'inferno', 'blaze', 'arson', 'burnt', 'ash', 'charred', 'scorch'],
    medium: ['heat', 'hot', 'embers', 'spark', 'soot', 'smoky', 'smolder', 'thermal', 'wildfire', 'house fire', 'structure fire', 'forest fire', 'vehicle fire'],
    low: ['warm', 'heating', 'furnace', 'oven', 'stove', 'fireplace', 'campfire', 'bbq', 'grill']
  }
  
  // FLOOD DETECTION - Enhanced with water-related terms
  const floodKeywords = {
    high: ['flood', 'flooding', 'tsunami', 'overflow', 'inundate', 'deluge', 'torrent', 'flash flood', 'dam break', 'levee breach', 'storm surge'],
    medium: ['water', 'rain', 'storm', 'downpour', 'precipitation', 'monsoon', 'hurricane', 'typhoon', 'cyclone', 'drainage', 'riverbank', 'creek', 'stream'],
    low: ['wet', 'damp', 'moist', 'puddle', 'leak', 'drip', 'splash', 'shower']
  }
  
  // POWER/OUTAGE DETECTION - Enhanced with electrical terms
  const outageKeywords = {
    high: ['power outage', 'blackout', 'electrical failure', 'grid failure', 'power grid', 'transformer', 'power line', 'electrical emergency', 'no electricity', 'power cut'],
    medium: ['electricity', 'outage', 'power', 'electrical', 'utility', 'generator', 'substation', 'transmission', 'distribution', 'voltage', 'circuit'],
    low: ['electric', 'energy', 'plug', 'outlet', 'wire', 'cable', 'switch', 'fuse', 'breaker']
  }
  
  // STORM DETECTION - Enhanced with weather terms
  const stormKeywords = {
    high: ['hurricane', 'tornado', 'typhoon', 'cyclone', 'severe storm', 'thunderstorm', 'hail storm', 'ice storm', 'blizzard', 'nor\'easter', 'derecho'],
    medium: ['storm', 'wind', 'gust', 'gale', 'tempest', 'squall', 'thunder', 'lightning', 'hail', 'sleet', 'snow', 'ice', 'weather emergency'],
    low: ['windy', 'breezy', 'cloudy', 'overcast', 'drizzle', 'mist', 'fog']
  }
  
  // SHELTER DETECTION - Enhanced with emergency/safety terms
  const shelterKeywords = {
    high: ['evacuation', 'evacuate', 'emergency shelter', 'safe house', 'refuge', 'sanctuary', 'displacement', 'homeless', 'displaced', 'relocation'],
    medium: ['shelter', 'safe', 'safety', 'rescue', 'assistance', 'aid', 'help', 'support', 'emergency housing', 'temporary housing', 'relief'],
    low: ['house', 'home', 'building', 'facility', 'accommodation', 'lodging', 'housing']
  }
  
  // Calculate scores for each category
  const allKeywords = { fire: fireKeywords, flood: floodKeywords, outage: outageKeywords, storm: stormKeywords, shelter: shelterKeywords }
  
  for (const [category, keywords] of Object.entries(allKeywords)) {
    for (const [priority, words] of Object.entries(keywords)) {
      const multiplier = priority === 'high' ? 3 : priority === 'medium' ? 2 : 1
      for (const word of words) {
        if (lowerText.includes(word)) {
          categoryScores[category as keyof typeof categoryScores] += multiplier
          // Bonus for exact phrase matches
          if (lowerText.includes(word + ' ')) {
            categoryScores[category as keyof typeof categoryScores] += 0.5
          }
        }
      }
    }
  }
  
  // Advanced contextual analysis
  // Fire context boosters
  if (lowerText.match(/\b(911|emergency|help|urgent|danger|critical|evacuate|casualties|injured|trapped)\b/)) {
    if (categoryScores.fire > 0) categoryScores.fire += 2
    if (categoryScores.flood > 0) categoryScores.flood += 1.5
    if (categoryScores.storm > 0) categoryScores.storm += 1.5
  }
  
  // Location context boosters
  if (lowerText.match(/\b(building|house|home|apartment|office|school|hospital|mall|store|restaurant)\b/)) {
    if (categoryScores.fire > 0) categoryScores.fire += 1
    if (categoryScores.outage > 0) categoryScores.outage += 1
  }
  
  if (lowerText.match(/\b(street|road|highway|bridge|tunnel|intersection|downtown|neighborhood)\b/)) {
    if (categoryScores.flood > 0) categoryScores.flood += 1
    if (categoryScores.outage > 0) categoryScores.outage += 1
    if (categoryScores.storm > 0) categoryScores.storm += 1
  }
  
  // Find the category with the highest score
  let bestCategory: Alert['type'] = 'outage'
  let maxScore = 0
  for (const [category, score] of Object.entries(categoryScores)) {
    if (score > maxScore) {
      maxScore = score
      bestCategory = category as Alert['type']
    }
  }
  
  // Calculate confidence based on score and text analysis
  let confidence = Math.min(0.95, Math.max(0.3, (maxScore / 10) + 0.4))
  
  // Boost confidence for image analysis (simulated)
  if (imageUrl) {
    confidence = Math.min(0.98, confidence + 0.15)
  }
  
  // AI-driven severity determination based on description content analysis
  let severityScore = 0
  
  // PRIMARY: Description content severity indicators (most important)
  const severityIndicators = {
    critical: ['critical', 'emergency', 'urgent', 'immediate', 'life threatening', 'death', 'deaths', 'fatalities', 'casualties', 'massive', 'catastrophic', 'devastating', 'destruction', 'collapsed', 'explosion', 'evacuate immediately', 'trapped', 'screaming', 'help', 'rescue', 'spreading rapidly', 'out of control', 'major', 'severe', 'extreme', 'dangerous', 'threat', 'serious'],
    high: ['important', 'significant', 'injured', 'injuries', 'damage', 'affected', 'multiple', 'many people', 'evacuate', 'evacuating', 'blocked', 'closed', 'impassable', 'rising', 'worsening', 'growing', 'expanding', 'active', 'happening', 'currently', 'ongoing', 'now', 'right now'],
    medium: ['concern', 'issue', 'problem', 'moderate', 'some', 'disruption', 'limited', 'localized', 'area', 'neighborhood', 'warning', 'alert', 'notice'],
    low: ['minor', 'small', 'contained', 'controlled', 'resolved', 'cleared', 'fixed', 'repaired', 'restored', 'normal', 'routine', 'scheduled', 'planned', 'maintenance', 'test', 'drill', 'false alarm']
  }
  
  // Score based on description content (primary factor) - INCREASED WEIGHTS
  const criticalTerms = severityIndicators.critical.filter(term => lowerText.includes(term))
  const highTerms = severityIndicators.high.filter(term => lowerText.includes(term))
  const mediumTerms = severityIndicators.medium.filter(term => lowerText.includes(term))
  const lowTerms = severityIndicators.low.filter(term => lowerText.includes(term))
  
  // Weight description content heavily - ADJUSTED WEIGHTS
  severityScore += criticalTerms.length * 6    // Critical terms = +6 each (increased from 4)
  severityScore += highTerms.length * 3        // High terms = +3 each (increased from 2.5)  
  severityScore += mediumTerms.length * 1.5    // Medium terms = +1.5 each (increased from 1)
  severityScore -= lowTerms.length * 4         // Low terms = -4 each (increased penalty)
  
  // EMERGENCY KEYWORDS BOOST - Major boost for immediate response terms
  const emergencyKeywords = ['emergency', 'urgent', 'immediate', 'help', 'rescue', 'critical', 'danger', 'threat']
  const emergencyCount = emergencyKeywords.filter(term => lowerText.includes(term)).length
  severityScore += emergencyCount * 4 // Major boost for emergency language
  
  // Text urgency analysis
  const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0)
  const avgSentenceLength = sentences.length > 0 ? sentences.reduce((acc, s) => acc + s.length, 0) / sentences.length : 0
  
  // Shorter, more urgent sentences often indicate higher severity
  if (avgSentenceLength < 50 && sentences.length > 1) {
    severityScore += 2 // Urgent, fragmented communication
  }
  
  // Exclamation marks and caps indicate urgency
  const exclamationCount = (text.match(/!/g) || []).length
  const capsWordsCount = (text.match(/\b[A-Z]{2,}\b/g) || []).length
  
  severityScore += Math.min(exclamationCount * 0.5, 2) // Max +2 for exclamations
  severityScore += Math.min(capsWordsCount * 0.3, 1.5) // Max +1.5 for caps
  
  // Numbers indicating scale/impact
  const numberMatches = text.match(/\b\d+\b/g) || []
  const hasLargeNumbers = numberMatches.some(n => parseInt(n) > 100)
  if (hasLargeNumbers) {
    severityScore += 1.5 // Large numbers suggest scale
  }
  
  // Time-sensitive language
  const timeUrgency = ['now', 'immediately', 'right now', 'happening', 'currently', 'active', 'ongoing']
  const urgentTimeCount = timeUrgency.filter(term => lowerText.includes(term)).length
  severityScore += urgentTimeCount * 2 // Increased from 1.2
  
  // SECONDARY: Category consideration with better weights
  const categoryBonus = {
    fire: 2,      // Fire gets higher bonus (was 1)
    flood: 2,     // Flood gets higher bonus (was 1)  
    storm: 1,     // Storm gets modest bonus (was 0.5)
    outage: 0.5,  // Outage small bonus (was 0)
    shelter: 1    // Shelter gets small bonus (was 0)
  }
  severityScore += categoryBonus[bestCategory] || 0
  
  // Image analysis bonus (AI trusts visual confirmation)
  if (imageUrl) {
    severityScore += 2 // Increased from 1.5
  }

  // AI determines final severity based on calculated score - LOWERED THRESHOLDS
  let severity: Alert['severity']
  if (severityScore >= 8) {      // Lowered from 12
    severity = 'critical'
  } else if (severityScore >= 5) { // Lowered from 8
    severity = 'high'  
  } else if (severityScore >= 2) { // Lowered from 4
    severity = 'medium'
  } else {
    severity = 'low'
  }
  
  // Debug logging for severity scoring
  console.log('🤖 AI Classification Debug:', {
    text: text.substring(0, 100) + '...',
    criticalTermsFound: criticalTerms,
    highTermsFound: highTerms.slice(0, 3), // Show first 3
    emergencyCount,
    urgentTimeCount,
    category: bestCategory,
    categoryBonus: categoryBonus[bestCategory],
    finalScore: severityScore,
    assignedSeverity: severity
  })
  
  // AI safety override: Fire with critical terms becomes critical
  if (bestCategory === 'fire' && criticalTerms.length > 0) {
    severity = 'critical'
  }
  
  // AI learning: Flood + storm combination increases severity
  if (bestCategory === 'flood' && categoryScores.storm > 2) {
    if (severity === 'medium') severity = 'high'
    if (severity === 'high') severity = 'critical'
  }
  
  // Generate detailed summary that matches the severity level
  const generateSummary = (type: Alert['type'], confidence: number, severity: Alert['severity']) => {
    const confidencePercent = Math.round(confidence * 100)
    
    // Response urgency text that matches severity level
    const responseTexts = {
      critical: 'IMMEDIATE ACTION REQUIRED',
      high: 'URGENT RESPONSE NEEDED', 
      medium: 'TIMELY RESPONSE RECOMMENDED',
      low: 'ROUTINE RESPONSE SUFFICIENT'
    }
    
    // Action descriptions that match severity
    const actionTexts = {
      fire: {
        critical: 'Immediate emergency response required. Fire department and medical teams must be dispatched NOW.',
        high: 'Fire department response needed urgently. Medical standby recommended.',
        medium: 'Fire department should respond promptly. Monitor situation closely.',
        low: 'Fire department can respond routinely. No immediate danger expected.'
      },
      flood: {
        critical: 'Emergency evacuation may be needed. Rescue teams must mobilize immediately.',
        high: 'Monitor water levels urgently. Evacuation routes should be prepared.',
        medium: 'Track water levels and prepare resources. Moderate flood risk.',
        low: 'Monitor situation routinely. Low flood impact expected.'
      },
      outage: {
        critical: 'Critical infrastructure affected. Emergency power restoration required.',
        high: 'Significant service disruption. Prioritize restoration efforts.',
        medium: 'Utility crews should respond promptly. Moderate service impact.',
        low: 'Routine maintenance response. Minimal service disruption expected.'
      },
      storm: {
        critical: 'Severe weather emergency. Immediate shelter and evacuation preparation.',
        high: 'Dangerous weather conditions. Prepare for potential evacuations.',
        medium: 'Monitor weather closely. Prepare resources as needed.',
        low: 'Routine weather monitoring. Limited impact expected.'
      },
      shelter: {
        critical: 'Emergency shelter needed immediately. Mass displacement event.',
        high: 'Urgent housing assistance required. Multiple people affected.',
        medium: 'Shelter resources should be coordinated. Moderate assistance needed.',
        low: 'Routine assistance available. Limited shelter needs.'
      }
    }
    
    const severityLabel = severity === 'critical' ? 'CRITICAL' : severity === 'high' ? 'HIGH PRIORITY' : severity === 'medium' ? 'MODERATE PRIORITY' : 'LOW PRIORITY'
    
    const typeEmoji = {
      fire: '🔥',
      flood: '🌊', 
      outage: '⚡',
      storm: '🌪️',
      shelter: '🏠'
    }
    
    return `${typeEmoji[type]} ${type.toUpperCase()} INCIDENT (${confidencePercent}% confidence) - ${severityLabel}: ${actionTexts[type][severity]} ${responseTexts[severity]}.`
  }
  
  return {
    type: bestCategory,
    confidence,
    severity,
    summary: generateSummary(bestCategory, confidence, severity)
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
  
  return `${typeEmojis[alert.type]} ${severityTexts[alert.severity]}: ${alert.description} - ${alert.location_text} (${Math.round((alert.confidence_score || 0) * 100)}% confidence)`
}