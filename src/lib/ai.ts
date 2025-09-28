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
  
  // AI-driven severity determination based on multiple factors
  let severityScore = 0
  
  // Base severity scoring by disaster type (AI learns patterns)
  const typeSeverityBase = {
    fire: 7,      // Fire is inherently dangerous
    flood: 5,     // Moderate base threat
    storm: 6,     // Weather can escalate quickly  
    outage: 3,    // Usually infrastructure issue
    shelter: 4    // Human displacement concern
  }
  
  severityScore += typeSeverityBase[bestCategory] || 3
  
  // Critical urgency indicators (AI detects emergency language)
  const criticalTerms = ['911', 'emergency', 'help', 'urgent', 'critical', 'severe', 'major', 'massive', 'catastrophic', 'disaster', 'crisis', 'life threatening', 'dangerous', 'trapped', 'casualties', 'injured', 'fatalities', 'death']
  const criticalCount = criticalTerms.filter(term => lowerText.includes(term)).length
  severityScore += criticalCount * 2.5
  
  // High impact indicators (AI recognizes escalation factors)
  const highImpactTerms = ['widespread', 'multiple', 'large', 'huge', 'massive', 'extensive', 'spreading', 'growing', 'escalating', 'worsening', 'overwhelming', 'out of control', 'cannot contain']
  const highImpactCount = highImpactTerms.filter(term => lowerText.includes(term)).length
  severityScore += highImpactCount * 1.8
  
  // Immediate threat indicators (AI detects time-sensitive language)
  const immediateTerms = ['now', 'immediate', 'right now', 'happening now', 'currently', 'active', 'ongoing', 'in progress', 'spreading fast', 'rapidly']
  const immediateCount = immediateTerms.filter(term => lowerText.includes(term)).length
  severityScore += immediateCount * 1.5
  
  // Human impact indicators (AI prioritizes human safety)
  const humanImpactTerms = ['people', 'residents', 'families', 'children', 'elderly', 'hospital', 'school', 'apartment', 'neighborhood', 'community', 'evacuation', 'rescue needed']
  const humanImpactCount = humanImpactTerms.filter(term => lowerText.includes(term)).length
  severityScore += humanImpactCount * 1.3
  
  // Infrastructure impact indicators (AI assesses system-wide effects)
  const infraTerms = ['power grid', 'water system', 'transportation', 'communication', 'hospital', 'emergency services', 'bridge', 'highway', 'airport', 'subway', 'train']
  const infraCount = infraTerms.filter(term => lowerText.includes(term)).length
  severityScore += infraCount * 1.2
  
  // Reduction factors for minor incidents (AI recognizes contained situations)
  const minorTerms = ['minor', 'small', 'slight', 'little', 'light', 'mild', 'contained', 'under control', 'resolved', 'handled', 'managed', 'no injuries', 'no damage']
  const minorCount = minorTerms.filter(term => lowerText.includes(term)).length
  severityScore -= minorCount * 2
  
  // Keyword strength bonus (AI considers classification confidence)
  severityScore += (maxScore / 3)
  
  // Image analysis bonus (AI trusts visual confirmation)
  if (imageUrl) {
    severityScore += 1.5
  }
  
  // AI determines final severity based on calculated score
  let severity: Alert['severity']
  if (severityScore >= 12) {
    severity = 'critical'
  } else if (severityScore >= 8) {
    severity = 'high'  
  } else if (severityScore >= 4) {
    severity = 'medium'
  } else {
    severity = 'low'
  }
  
  // AI safety override: Fire with any emergency language becomes critical
  if (bestCategory === 'fire' && criticalCount > 0) {
    severity = 'critical'
  }
  
  // AI learning: Flood + storm combination increases severity
  if (bestCategory === 'flood' && categoryScores.storm > 2) {
    if (severity === 'medium') severity = 'high'
    if (severity === 'high') severity = 'critical'
  }
  
  // Generate detailed summary
  const generateSummary = (type: Alert['type'], confidence: number, severity: Alert['severity']) => {
    const confidencePercent = Math.round(confidence * 100)
    const severityText = severity === 'critical' ? 'CRITICAL' : severity === 'high' ? 'HIGH PRIORITY' : severity === 'medium' ? 'MODERATE' : 'LOW PRIORITY'
    
    const summaries = {
      fire: `🔥 FIRE INCIDENT DETECTED (${confidencePercent}% confidence) - ${severityText}: Fire/smoke reported. Immediate emergency response required. Fire department and medical teams should be dispatched.`,
      flood: `🌊 FLOOD SITUATION IDENTIFIED (${confidencePercent}% confidence) - ${severityText}: Water-related emergency detected. Monitor water levels and evacuation routes. Rescue teams on standby.`,
      outage: `⚡ POWER OUTAGE REPORTED (${confidencePercent}% confidence) - ${severityText}: Electrical system failure detected. Utility crews notified for restoration efforts. Backup power systems activated.`,
      storm: `🌪️ SEVERE WEATHER DETECTED (${confidencePercent}% confidence) - ${severityText}: Storm activity reported. Weather service alerted. Prepare for potential evacuations and property damage.`,
      shelter: `🏠 EMERGENCY SHELTER REQUEST (${confidencePercent}% confidence) - ${severityText}: Evacuation or housing assistance needed. Emergency management coordinating shelter resources and aid distribution.`
    }
    
    return summaries[type]
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
  
  return `${typeEmojis[alert.type]} ${severityTexts[alert.severity]}: ${alert.description} - ${alert.location_text} (${Math.round(alert.confidence_score * 100)}% confidence)`
}