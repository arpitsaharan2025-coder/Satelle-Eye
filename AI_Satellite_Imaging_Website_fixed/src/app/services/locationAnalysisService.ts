// Location Analysis Service using OpenAI
import { sendChatMessage, ChatMessage } from './openaiService';
import { getNaturalEvents } from './eonetService';

export interface LocationAnalysis {
  location: {
    latitude: number;
    longitude: number;
    placeName?: string;
  };
  safetyAssessment: {
    overallSafety: 'Safe' | 'Moderate' | 'Risky' | 'Dangerous';
    safetyScore: number;
    reasoning: string;
  };
  urbanExpansion: {
    currentUrbanization: string;
    expansionTrend: string;
    lastMajorExpansion: string;
    populationGrowth: string;
  };
  naturalDisasterRisk: {
    nearbyEvents: Array<{
      type: string;
      distance: string;
      severity: string;
    }>;
    historicalRisk: string;
    futureRisk: string;
  };
  environmentalFactors: {
    climate: string;
    terrain: string;
    waterSources: string;
    vegetation: string;
  };
  recommendations: string[];
  aiAnalysis: string;
  timestamp: Date;
}

/**
 * Analyze a specific location using OpenAI and NASA data
 */
export async function analyzeLocation(
  latitude: number,
  longitude: number
): Promise<LocationAnalysis> {
  try {
    console.log(`[Location Analysis] Analyzing: ${latitude}, ${longitude}`);

    // 1. Fetch nearby natural disasters from NASA EONET
    const eventsResponse = await getNaturalEvents('open', 100);
    const nearbyEvents = eventsResponse.events
      .filter(event => {
        const geometry = event.geometry[event.geometry.length - 1];
        if (!geometry || geometry.type !== 'Point') return false;
        
        const [lon, lat] = geometry.coordinates;
        const distance = calculateDistance(latitude, longitude, lat, lon);
        return distance < 500; // Within 500km
      })
      .map(event => {
        const geometry = event.geometry[event.geometry.length - 1];
        const [lon, lat] = geometry.coordinates;
        const distance = calculateDistance(latitude, longitude, lat, lon);
        
        return {
          type: event.categories[0]?.title || 'Unknown',
          distance: `${distance.toFixed(0)} km`,
          severity: event.categories[0]?.id || 'unknown',
          title: event.title
        };
      })
      .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
      .slice(0, 5);

    // 2. Create comprehensive prompt for OpenAI
    const prompt = `As an AI location analyst, analyze this geographic location:
    
📍 **Coordinates**: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E

🌍 **Nearby Natural Disasters (NASA EONET Data)**:
${nearbyEvents.length > 0 ? nearbyEvents.map((e, i) => `${i + 1}. ${e.type}: ${e.title} - ${e.distance} away`).join('\n') : 'No active disasters within 500km'}

**Please provide a comprehensive analysis including:**

1. **Safety Assessment**: Is this location safe for habitation? Rate overall safety (Safe/Moderate/Risky/Dangerous) and provide reasoning.

2. **Urban Expansion**: Based on coordinates, analyze:
   - Current level of urbanization
   - Historical urban expansion trends in this region
   - Last major expansion period (estimate based on geographic knowledge)
   - Population growth patterns

3. **Natural Disaster Risk**:
   - Historical natural disaster risk for this region
   - Future risk assessment considering climate change
   - Specific threats (earthquakes, floods, storms, etc.)

4. **Environmental Factors**:
   - Climate classification
   - Terrain characteristics
   - Water source availability
   - Vegetation patterns

5. **Recommendations**: 3-5 specific recommendations for this location

Provide detailed, specific analysis based on geographic knowledge and the provided NASA data.`;

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are an expert geographer and urban planner specializing in location analysis, disaster risk assessment, and urban development trends. Provide detailed, accurate assessments based on geographic data.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    // 3. Get AI analysis
    const aiResponse = await sendChatMessage(messages, 'gpt-4');

    // 4. Parse and structure the response
    const analysis: LocationAnalysis = {
      location: {
        latitude,
        longitude,
        placeName: await getPlaceName(latitude, longitude)
      },
      safetyAssessment: {
        overallSafety: extractSafety(aiResponse),
        safetyScore: calculateSafetyScore(nearbyEvents, aiResponse),
        reasoning: extractSection(aiResponse, 'Safety Assessment')
      },
      urbanExpansion: {
        currentUrbanization: extractInfo(aiResponse, 'urbanization'),
        expansionTrend: extractInfo(aiResponse, 'expansion'),
        lastMajorExpansion: extractInfo(aiResponse, 'last major expansion'),
        populationGrowth: extractInfo(aiResponse, 'population growth')
      },
      naturalDisasterRisk: {
        nearbyEvents: nearbyEvents.map(e => ({
          type: e.type,
          distance: e.distance,
          severity: e.severity
        })),
        historicalRisk: extractInfo(aiResponse, 'historical'),
        futureRisk: extractInfo(aiResponse, 'future risk')
      },
      environmentalFactors: {
        climate: extractInfo(aiResponse, 'climate'),
        terrain: extractInfo(aiResponse, 'terrain'),
        waterSources: extractInfo(aiResponse, 'water'),
        vegetation: extractInfo(aiResponse, 'vegetation')
      },
      recommendations: extractRecommendations(aiResponse),
      aiAnalysis: aiResponse,
      timestamp: new Date()
    };

    console.log('[Location Analysis] Analysis complete');
    return analysis;

  } catch (error) {
    console.error('[Location Analysis] Error:', error);
    throw error;
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Get place name from coordinates (simplified)
 */
async function getPlaceName(lat: number, lon: number): Promise<string> {
  // In production, use a reverse geocoding API
  return `Location ${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`;
}

/**
 * Extract safety rating from AI response
 */
function extractSafety(response: string): 'Safe' | 'Moderate' | 'Risky' | 'Dangerous' {
  const lower = response.toLowerCase();
  if (lower.includes('dangerous')) return 'Dangerous';
  if (lower.includes('risky')) return 'Risky';
  if (lower.includes('moderate')) return 'Moderate';
  return 'Safe';
}

/**
 * Calculate safety score
 */
function calculateSafetyScore(nearbyEvents: any[], aiResponse: string): number {
  let score = 100;
  
  // Deduct points for nearby events
  nearbyEvents.forEach(event => {
    const distance = parseFloat(event.distance);
    if (distance < 100) score -= 20;
    else if (distance < 250) score -= 10;
    else if (distance < 500) score -= 5;
  });
  
  // Adjust based on AI assessment
  const lower = aiResponse.toLowerCase();
  if (lower.includes('dangerous')) score -= 30;
  else if (lower.includes('risky')) score -= 15;
  else if (lower.includes('safe')) score += 10;
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Extract a section from AI response
 */
function extractSection(response: string, sectionName: string): string {
  const lines = response.split('\n');
  let inSection = false;
  let section = '';
  
  for (const line of lines) {
    if (line.toLowerCase().includes(sectionName.toLowerCase())) {
      inSection = true;
      continue;
    }
    if (inSection && line.match(/^\d+\./)) {
      break;
    }
    if (inSection && line.trim()) {
      section += line + ' ';
    }
  }
  
  return section.trim() || 'No specific information available';
}

/**
 * Extract specific information
 */
function extractInfo(response: string, keyword: string): string {
  const lines = response.split('\n');
  for (const line of lines) {
    if (line.toLowerCase().includes(keyword.toLowerCase())) {
      return line.replace(/^[-*\d.]+/, '').trim();
    }
  }
  return 'Information not available';
}

/**
 * Extract recommendations
 */
function extractRecommendations(response: string): string[] {
  const lines = response.split('\n');
  const recommendations: string[] = [];
  let inRecommendations = false;
  
  for (const line of lines) {
    if (line.toLowerCase().includes('recommendation')) {
      inRecommendations = true;
      continue;
    }
    if (inRecommendations && line.match(/^[-*\d.]/)) {
      const cleaned = line.replace(/^[-*\d.]+/, '').trim();
      if (cleaned) recommendations.push(cleaned);
    }
  }
  
  return recommendations.length > 0 ? recommendations : [
    'Conduct thorough geological survey before development',
    'Implement disaster preparedness plans',
    'Monitor local weather and seismic activity',
    'Ensure adequate infrastructure for emergency response'
  ];
}
