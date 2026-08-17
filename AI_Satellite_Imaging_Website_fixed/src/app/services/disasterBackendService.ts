// Backend Service for Real-Time Disaster Monitoring
import { NaturalEvent, getNaturalEvents, EventCategory } from './eonetService';
import { sendChatMessage, ChatMessage, createJarvisSystemPrompt } from './openaiService';

// OpenWeatherMap Configuration
const OPENWEATHER_API_KEY = '5a6767576022513f19159042457788e6';
const KEY_LOCATIONS = [
  { name: 'Phoenix, USA', lat: 33.4484, lon: -112.0740 },
  { name: 'Karachi, Pakistan', lat: 24.8607, lon: 67.0011 },
  { name: 'Bangkok, Thailand', lat: 13.7563, lon: 100.5018 },
  { name: 'Buenos Aires, Argentina', lat: -34.6037, lon: -58.3816 },
  { name: 'Kinshasa, DR Congo', lat: -4.4419, lon: 15.2663 },
  { name: 'Seoul, South Korea', lat: 37.5665, lon: 126.9780 },
  { name: 'Bogotá, Colombia', lat: 4.7110, lon: -74.0721 },
  { name: 'Johannesburg, South Africa', lat: -26.2041, lon: 28.0473 },
  { name: 'Baghdad, Iraq', lat: 33.3152, lon: 44.3661 },
  { name: 'Lima, Peru', lat: -12.0464, lon: -77.0428 },
  { name: 'Kuala Lumpur, Malaysia', lat: 3.1390, lon: 101.6869 },
  { name: 'Tehran, Iran', lat: 35.6892, lon: 51.3890 },
  { name: 'Ho Chi Minh City, Vietnam', lat: 10.8231, lon: 106.6297 },
  { name: 'Riyadh, Saudi Arabia', lat: 24.7136, lon: 46.6753 },
  { name: 'Auckland, New Zealand', lat: -36.8485, lon: 174.7633 },
  { name: 'Casablanca, Morocco', lat: 33.5731, lon: -7.5898 },
  { name: 'Atlanta, USA', lat: 33.7490, lon: -84.3880 },
  { name: 'Taipei, Taiwan', lat: 25.0330, lon: 121.5654 },
  { name: 'Yangon, Myanmar', lat: 16.8661, lon: 96.1951 },
  { name: 'Montreal, Canada', lat: 45.5017, lon: -73.5673 },
  { name: 'Addis Ababa, Ethiopia', lat: 9.0320, lon: 38.7469 },
  { name: 'Chengdu, China', lat: 30.5728, lon: 104.0668 },
  { name: 'Perth, Australia', lat: -31.9505, lon: 115.8605 },
  { name: 'Quito, Ecuador', lat: -0.1807, lon: -78.4678 },
  { name: 'Stockholm, Sweden', lat: 59.3293, lon: 18.0686 }
];

export interface DisasterUpdate {
  newEvents: NaturalEvent[];
  updatedEvents: NaturalEvent[];
  allEvents: NaturalEvent[];
  aiSummary: string;
  timestamp: Date;
  changeDetected: boolean;
}

let previousEventIds = new Set<string>();
let lastUpdateTime = new Date();

/**
 * Fetch severe weather events from OpenWeatherMap
 */
async function getOpenWeatherEvents(): Promise<NaturalEvent[]> {
    const events: NaturalEvent[] = [];
    
    // We can't fetch global alerts easily without paid plan, so we check key strategic points
    const promises = KEY_LOCATIONS.map(async (loc) => {
        try {
            const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${loc.lat}&lon=${loc.lon}&appid=${OPENWEATHER_API_KEY}&units=metric`);
            if (!res.ok) return null;
            const data = await res.json();
            
            // Filter for significant weather only
            // Codes: 2xx (Thunderstorm), 3xx (Drizzle), 5xx (Rain), 6xx (Snow), 7xx (Atmosphere), 800 (Clear), 80x (Clouds)
            // We only care about 2xx (Thunderstorm), 502-504 (Heavy Rain), 602 (Heavy Snow), 781 (Tornado), etc.
            const weatherId = data.weather[0].id;
            let category: EventCategory | null = null;
            
            if (weatherId >= 200 && weatherId < 300) category = { id: 'severeStorms', title: 'Severe Storms' };
            else if (weatherId === 781) category = { id: 'severeStorms', title: 'Tornado' };
            else if (weatherId >= 502 && weatherId <= 504) category = { id: 'floods', title: 'Floods' }; // Heavy rain potential
            else if (weatherId === 602) category = { id: 'snow', title: 'Severe Snow' };
            else if (data.wind.speed > 20) category = { id: 'severeStorms', title: 'High Winds' }; // > 20m/s is strong
            
            if (category) {
                return {
                    id: `OWM-${data.id}-${Date.now()}`, // Unique ID
                    title: `${category.title} in ${loc.name}`,
                    description: `Real-time weather alert: ${data.weather[0].description}. Temp: ${data.main.temp}°C, Wind: ${data.wind.speed}m/s.`,
                    link: `https://openweathermap.org/city/${data.id}`,
                    categories: [category],
                    sources: [{ id: 'OpenWeatherMap', url: 'https://openweathermap.org/' }],
                    geometry: [{
                        date: new Date().toISOString(),
                        type: 'Point',
                        coordinates: [loc.lon, loc.lat],
                        magnitudeValue: data.wind.speed,
                        magnitudeUnit: 'm/s'
                    }],
                    closed: null
                } as NaturalEvent;
            }
        } catch (e) {
            console.warn(`Failed to fetch OpenWeather for ${loc.name}`, e);
        }
        return null;
    });

    const results = await Promise.all(promises);
    return results.filter((e): e is NaturalEvent => e !== null);
}

/**
 * Backend refresh service - checks for new disasters every 30 seconds
 * Uses AI to analyze and summarize changes
 */
export async function refreshDisasterData(): Promise<DisasterUpdate> {
  try {
    // Parallel fetch: EONET + OpenWeatherMap
    const [eonetResponse, owmEvents] = await Promise.all([
        getNaturalEvents('open', 300),
        getOpenWeatherEvents()
    ]);

    const allEvents = [...eonetResponse.events, ...owmEvents];
    const currentEventIds = new Set(allEvents.map(e => e.id));
    
    // Detect new events
    const newEvents = allEvents.filter(event => !previousEventIds.has(event.id));
    
    // Detect updated events (events that existed but might have new geometry)
    const updatedEvents = allEvents.filter(event => {
      if (newEvents.find(e => e.id === event.id)) return false; // Skip new events
      return previousEventIds.has(event.id) && event.geometry.length > 0;
    });
    
    const changeDetected = newEvents.length > 0 || updatedEvents.length > 0;
    
    // Generate AI summary if changes detected
    let aiSummary = '';
    if (changeDetected) {
      aiSummary = await generateAIChangeSummary(newEvents, updatedEvents, allEvents);
    } else {
      aiSummary = `No new disasters detected. Monitoring ${allEvents.length} active events globally.`;
    }
    
    // Update tracking
    previousEventIds = currentEventIds;
    lastUpdateTime = new Date();
    
    console.log(`[Backend Refresh] New: ${newEvents.length}, Updated: ${updatedEvents.length}, Total: ${allEvents.length}`);
    
    return {
      newEvents,
      updatedEvents,
      allEvents,
      aiSummary,
      timestamp: lastUpdateTime,
      changeDetected
    };
  } catch (error) {
    console.error('Error in disaster backend refresh:', error);
    return {
      newEvents: [],
      updatedEvents: [],
      allEvents: [],
      aiSummary: 'Error refreshing disaster data. Retrying...',
      timestamp: new Date(),
      changeDetected: false
    };
  }
}

/**
 * Generate AI-powered summary of changes
 */
async function generateAIChangeSummary(
  newEvents: NaturalEvent[],
  updatedEvents: NaturalEvent[],
  allEvents: NaturalEvent[]
): Promise<string> {
  try {
    if (newEvents.length === 0 && updatedEvents.length === 0) {
      return `Monitoring ${allEvents.length} active disasters. No new events in the last 30 seconds.`;
    }
    
    // Create summary for AI
    let summary = '';
    
    if (newEvents.length > 0) {
      summary += `NEW EVENTS (${newEvents.length}):\n`;
      newEvents.slice(0, 3).forEach((e, idx) => {
        const geo = e.geometry[e.geometry.length - 1];
        const coords = geo?.coordinates ? `${geo.coordinates[1].toFixed(2)}°N, ${geo.coordinates[0].toFixed(2)}°E` : 'Unknown';
        summary += `${idx + 1}. ${e.categories[0]?.title || 'Event'}: ${e.title} at ${coords}\n`;
      });
    }
    
    if (updatedEvents.length > 0) {
      summary += `\nUPDATED EVENTS (${updatedEvents.length}):\n`;
      updatedEvents.slice(0, 2).forEach((e, idx) => {
        summary += `${idx + 1}. ${e.categories[0]?.title || 'Event'}: ${e.title} - Activity continues\n`;
      });
    }
    
    const prompt = `As JARVIS disaster monitoring AI, analyze this data and provide a brief alert (max 150 chars):

${summary}

Total active disasters: ${allEvents.length}

Format: "⚠️ [New/Updated count] - [Brief description with urgency level]"
Example: "⚠️ 3 new disasters detected - Major wildfire in California, flooding in Asia. URGENT monitoring."`;
    
    const messages: ChatMessage[] = [
      createJarvisSystemPrompt(),
      { role: 'user', content: prompt }
    ];
    
    const aiResponse = await sendChatMessage(messages, 'gpt-4');
    return aiResponse;
    
  } catch (error) {
    console.error('Error generating AI summary:', error);
    
    // Fallback summary
    if (newEvents.length > 0) {
      const categories = newEvents.map(e => e.categories[0]?.title || 'Event').slice(0, 2).join(', ');
      return `⚠️ ${newEvents.length} NEW disaster${newEvents.length > 1 ? 's' : ''} detected: ${categories}. Monitoring closely.`;
    } else {
      return `🔄 ${updatedEvents.length} event${updatedEvents.length > 1 ? 's' : ''} updated. Total active: ${allEvents.length}`;
    }
  }
}

/**
 * Get the severity level of an event
 */
export function getEventSeverity(event: NaturalEvent): 'Critical' | 'High' | 'Medium' | 'Low' {
  const categoryId = event.categories[0]?.id || '';
  const geometry = event.geometry[event.geometry.length - 1];
  const magnitude = geometry?.magnitudeValue;
  
  // Critical severity categories
  if (categoryId === 'earthquakes' && magnitude && magnitude > 6.5) return 'Critical';
  if (categoryId === 'volcanoes') return 'Critical';
  if (categoryId === 'severeStorms' && magnitude && magnitude > 150) return 'Critical';
  
  // High severity
  if (categoryId === 'earthquakes' && magnitude && magnitude > 5.0) return 'High';
  if (categoryId === 'wildfires' && magnitude && magnitude > 50000) return 'High';
  if (categoryId === 'floods') return 'High';
  
  // Medium severity
  if (categoryId === 'wildfires') return 'Medium';
  if (categoryId === 'landslides') return 'Medium';
  if (categoryId === 'severeStorms') return 'Medium';
  
  return 'Low';
}

/**
 * Get severity color
 */
export function getSeverityColor(severity: 'Critical' | 'High' | 'Medium' | 'Low'): string {
  switch (severity) {
    case 'Critical': return '#ff0000';
    case 'High': return '#ff6600';
    case 'Medium': return '#ffaa00';
    case 'Low': return '#00ffff';
  }
}

/**
 * Initialize backend monitoring
 */
export function initializeBackend() {
  console.log('[Disaster Backend] Initialized - 30-second refresh cycle active');
}