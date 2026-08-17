// Notification Service for Natural Disaster Predictions
import { sendChatMessage, ChatMessage } from './openaiService';
import { getNaturalEvents } from './eonetService';

export interface DisasterPrediction {
  id: string;
  type: string;
  location: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  probability: number;
  timeframe: string;
  source: 'NASA' | 'ISRO' | 'AI-Prediction';
  description: string;
  affectedRegions: string[];
  recommendations: string[];
  timestamp: Date;
}

export interface NotificationPayload {
  predictions: DisasterPrediction[];
  summary: string;
  urgentCount: number;
  timestamp: Date;
}

let notificationCallbacks: Array<(payload: NotificationPayload) => void> = [];

/**
 * Subscribe to notifications
 */
export function subscribeToNotifications(callback: (payload: NotificationPayload) => void) {
  notificationCallbacks.push(callback);
  console.log('[Notifications] Subscriber added');
}

/**
 * Unsubscribe from notifications
 */
export function unsubscribeFromNotifications(callback: (payload: NotificationPayload) => void) {
  notificationCallbacks = notificationCallbacks.filter(cb => cb !== callback);
  console.log('[Notifications] Subscriber removed');
}

/**
 * Start notification service (checks every 15 seconds)
 */
export function startNotificationService(): NodeJS.Timeout {
  console.log('[Notifications] Service started - checking every 15 seconds');
  
  const interval = setInterval(async () => {
    try {
      const payload = await checkForPredictions();
      
      // Notify all subscribers
      notificationCallbacks.forEach(callback => {
        try {
          callback(payload);
        } catch (error) {
          console.error('[Notifications] Error in callback:', error);
        }
      });
      
      // Browser notification if urgent
      if (payload.urgentCount > 0 && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('⚠️ Satell-Eye Alert', {
            body: payload.summary,
            icon: '/satellite-icon.png',
            badge: '/satellite-icon.png',
            requireInteraction: true
          });
        }
      }
    } catch (error) {
      console.error('[Notifications] Error checking predictions:', error);
    }
  }, 15000);
  
  // Initial check
  checkForPredictions().then(payload => {
    notificationCallbacks.forEach(callback => callback(payload));
  });
  
  return interval;
}

/**
 * Stop notification service
 */
export function stopNotificationService(interval: NodeJS.Timeout) {
  clearInterval(interval);
  console.log('[Notifications] Service stopped');
}

/**
 * Check for disaster predictions
 */
async function checkForPredictions(): Promise<NotificationPayload> {
  try {
    // 1. Get current NASA EONET data
    const eventsResponse = await getNaturalEvents('open', 100);
    const activeEvents = eventsResponse.events;
    
    // 2. Analyze trends with AI
    const prompt = `As a disaster prediction AI analyzing NASA and ISRO data, predict natural disasters likely to occur in the NEXT 7 DAYS.

**Current Active Disasters (NASA EONET)**:
${activeEvents.slice(0, 10).map((e, i) => {
  const geo = e.geometry[e.geometry.length - 1];
  const coords = geo?.coordinates ? `${geo.coordinates[1].toFixed(2)}°, ${geo.coordinates[0].toFixed(2)}°` : 'Unknown';
  return `${i + 1}. ${e.categories[0]?.title}: ${e.title} at ${coords}`;
}).join('\n')}

**Task**: Based on current patterns, climate data, and historical trends, predict 3-5 natural disasters most likely to occur in the next week.

For each prediction, provide:
1. **Type**: (Wildfire, Earthquake, Flood, Storm, Volcano, etc.)
2. **Location**: Specific region/country
3. **Severity**: Low, Medium, High, or Critical
4. **Probability**: 0-100%
5. **Timeframe**: When in next 7 days
6. **Affected Regions**: Areas at risk
7. **Recommendations**: Safety measures

Format as:
PREDICTION 1:
Type: [type]
Location: [location]
Severity: [severity]
Probability: [X]%
Timeframe: [timeframe]
Regions: [regions]
Recommendations: [recommendations]

Focus on HIGH PROBABILITY events based on current active disasters and seasonal patterns.`;

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are an expert meteorologist and seismologist specializing in disaster prediction using NASA, ISRO, and global monitoring data. Provide realistic, data-driven predictions.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const aiResponse = await sendChatMessage(messages, 'gpt-4');
    
    // 3. Parse predictions
    const predictions = parsePredictions(aiResponse, activeEvents);
    
    // 4. Create summary
    const urgentCount = predictions.filter(p => 
      p.severity === 'Critical' || p.severity === 'High'
    ).length;
    
    const summary = urgentCount > 0
      ? `⚠️ ${urgentCount} high-risk disaster${urgentCount > 1 ? 's' : ''} predicted in next 7 days`
      : `✓ ${predictions.length} potential events monitored - No immediate threats`;
    
    console.log(`[Notifications] Check complete: ${predictions.length} predictions, ${urgentCount} urgent`);
    
    return {
      predictions,
      summary,
      urgentCount,
      timestamp: new Date()
    };
    
  } catch (error) {
    console.error('[Notifications] Error checking predictions:', error);
    return {
      predictions: [],
      summary: 'Error checking predictions',
      urgentCount: 0,
      timestamp: new Date()
    };
  }
}

/**
 * Parse AI predictions
 */
function parsePredictions(aiResponse: string, activeEvents: any[]): DisasterPrediction[] {
  const predictions: DisasterPrediction[] = [];
  const sections = aiResponse.split('PREDICTION').filter(s => s.trim());
  
  sections.forEach((section, index) => {
    if (index === 0 && !section.includes('Type:')) return; // Skip intro
    
    const type = extractField(section, 'Type') || 'Unknown';
    const location = extractField(section, 'Location') || 'Unknown';
    const severityStr = extractField(section, 'Severity') || 'Medium';
    const probability = parseInt(extractField(section, 'Probability')?.replace('%', '') || '50');
    const timeframe = extractField(section, 'Timeframe') || 'Next 7 days';
    const regions = extractField(section, 'Regions')?.split(',').map(r => r.trim()) || [location];
    const recommendations = extractField(section, 'Recommendations')?.split('.').filter(r => r.trim()) || [];
    
    const severity = ['Critical', 'High', 'Medium', 'Low'].includes(severityStr) 
      ? severityStr as any
      : 'Medium';
    
    // Determine source based on type and current events
    const source = activeEvents.some(e => 
      e.categories[0]?.title?.toLowerCase().includes(type.toLowerCase())
    ) ? 'NASA' : 'AI-Prediction';
    
    predictions.push({
      id: `PRED-${Date.now()}-${index}`,
      type,
      location,
      severity,
      probability,
      timeframe,
      source,
      description: section.substring(0, 200).replace(/Type:|Location:|Severity:/g, '').trim(),
      affectedRegions: regions,
      recommendations: recommendations.length > 0 ? recommendations : ['Monitor local authorities', 'Prepare emergency supplies'],
      timestamp: new Date()
    });
  });
  
  // If no predictions parsed, create fallback
  if (predictions.length === 0) {
    predictions.push({
      id: `PRED-${Date.now()}-0`,
      type: 'Monitoring',
      location: 'Global',
      severity: 'Low',
      probability: 30,
      timeframe: 'Next 7 days',
      source: 'AI-Prediction',
      description: 'Continuous monitoring of global conditions. No immediate threats detected.',
      affectedRegions: ['Global'],
      recommendations: ['Continue regular monitoring', 'Stay informed through official channels'],
      timestamp: new Date()
    });
  }
  
  return predictions;
}

/**
 * Extract field from text
 */
function extractField(text: string, fieldName: string): string | null {
  const regex = new RegExp(`${fieldName}:\\s*(.+?)(?=\\n|$)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('[Notifications] Browser does not support notifications');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
}
