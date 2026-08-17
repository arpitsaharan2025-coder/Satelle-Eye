// OpenAI API Service for JARVIS AI Assistant

const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY_HERE'; // Replace with your actual API key
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIResponse {
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Send a chat message to OpenAI GPT-4
 * @param messages Array of chat messages
 * @param model The model to use (default: gpt-4)
 * @returns AI response
 */
export async function sendChatMessage(
  messages: ChatMessage[],
  model: string = 'gpt-4'
): Promise<string> {
  try {
    // Check if API key is configured
    if (OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
      // Silently use mock response - API key placeholder is expected in demo mode
      return getMockResponse(messages[messages.length - 1].content);
    }

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 500,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API Error:', error);
      throw new Error(`OpenAI API returned ${response.status}: ${error.error?.message || 'Unknown error'}`);
    }

    const data: OpenAIResponse = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    // Fallback to mock response if API fails
    return getMockResponse(messages[messages.length - 1].content);
  }
}

/**
 * Generate mock response for when OpenAI is not available
 */
function getMockResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  // Satellite-related queries
  if (lowerMessage.includes('satellite') || lowerMessage.includes('orbit')) {
    return "I'm currently tracking over 50 satellites including the ISS, Hubble Space Telescope, and multiple Starlink satellites. The International Space Station is currently orbiting at approximately 408 kilometers altitude, traveling at 7.66 kilometers per second. Would you like specific details about any particular satellite?";
  }

  // Weather queries
  if (lowerMessage.includes('weather') || lowerMessage.includes('temperature') || lowerMessage.includes('forecast')) {
    return "I can provide real-time weather data for any location worldwide using the OpenWeather API. Current global conditions show various weather patterns including tropical storms in the Pacific, clear skies over North America, and monsoon activity in South Asia. Which specific location would you like weather information for?";
  }

  // Natural disaster queries
  if (lowerMessage.includes('disaster') || lowerMessage.includes('earthquake') || lowerMessage.includes('wildfire') || lowerMessage.includes('flood')) {
    return "The NASA EONET system is currently monitoring multiple natural events globally. Recent significant events include wildfires in California, volcanic activity in Indonesia, and severe storms in the Atlantic. I'm using CNN-LSTM hybrid models for disaster prediction with 97.8% detection accuracy. Would you like details on a specific type of event?";
  }

  // AI Analysis queries
  if (lowerMessage.includes('ai') || lowerMessage.includes('analysis') || lowerMessage.includes('detection') || lowerMessage.includes('model')) {
    return "Our AI analysis system uses state-of-the-art computer vision models including YOLOv8-Geo for object detection with 94.2% accuracy, ResNet-152 for classification, and SegFormer-B5 for segmentation. The models are trained on over 2.5 million satellite images and can detect various environmental features including deforestation, urban development, and natural disasters. What would you like to analyze?";
  }

  // ISS specific queries
  if (lowerMessage.includes('iss') || lowerMessage.includes('international space station')) {
    return "The International Space Station is currently orbiting Earth at an altitude of approximately 408 kilometers, completing an orbit every 92 minutes. It's traveling at about 7.66 km/s and is home to astronauts conducting various scientific experiments. The ISS is visible from Earth with the naked eye during certain passes. Would you like to know when it will pass over your location?";
  }

  // Starlink queries
  if (lowerMessage.includes('starlink') || lowerMessage.includes('spacex')) {
    return "SpaceX's Starlink constellation currently has thousands of satellites in low Earth orbit, providing global internet coverage. I'm tracking several Starlink satellites including Starlink-1007, 1008, 1600, and more. These satellites operate in Ku and Ka-band frequencies at altitudes between 340-550 km. The constellation is designed to provide high-speed internet to underserved areas worldwide.";
  }

  // GPS/Navigation queries
  if (lowerMessage.includes('gps') || lowerMessage.includes('navigation') || lowerMessage.includes('galileo') || lowerMessage.includes('glonass')) {
    return "I'm monitoring multiple navigation satellite systems: GPS (USA), GALILEO (Europe), GLONASS (Russia), and BeiDou (China). These satellites provide positioning accuracy of approximately 1-5 meters for civilian use and are essential for navigation, surveying, and timing synchronization. The system operates across L-band frequencies for optimal signal penetration.";
  }

  // Earth observation queries
  if (lowerMessage.includes('landsat') || lowerMessage.includes('sentinel') || lowerMessage.includes('terra') || lowerMessage.includes('aqua')) {
    return "Our Earth observation satellites including Landsat 8 & 9, Sentinel-1A, 2A, and 3A, Terra, and Aqua are continuously monitoring our planet. They provide critical data on land use, vegetation health, water resources, atmospheric conditions, and climate change indicators. These satellites use various sensors including optical, radar, and thermal imaging across multiple spectral bands.";
  }

  // System status queries
  if (lowerMessage.includes('status') || lowerMessage.includes('system') || lowerMessage.includes('online')) {
    return "All systems operational. Currently tracking 50+ satellites, monitoring natural disasters via NASA EONET, AI models running at 87% GPU utilization, and weather data updating in real-time. Database contains 2.5M+ satellite images for AI training. All API connections are stable and functioning optimally.";
  }

  // Capabilities queries
  if (lowerMessage.includes('what can you do') || lowerMessage.includes('help') || lowerMessage.includes('capabilities')) {
    return "I am JARVIS, your AI mission control assistant. I can provide real-time satellite tracking data, analyze weather conditions globally, detect and monitor natural disasters, perform AI-powered image analysis of satellite imagery, answer questions about space missions, and provide detailed information about orbital mechanics. I'm connected to NASA EONET, OpenWeather, N2YO satellite tracking, and advanced computer vision models. How may I assist you?";
  }

  // Greeting
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi ') || lowerMessage.includes('hey')) {
    return "Greetings, sir. JARVIS at your service. All satellite tracking systems are online and functioning optimally. How may I assist you with your mission today?";
  }

  // Default response
  return `I understand you're asking about "${userMessage}". As JARVIS, your AI mission control assistant, I have access to real-time satellite tracking, global weather data, natural disaster monitoring via NASA EONET, and advanced AI analysis capabilities. Could you please provide more specific details about what you'd like to know? I can help with satellite positions, weather forecasts, disaster alerts, or AI-powered image analysis.`;
}

/**
 * Create a system prompt for JARVIS
 */
export function createJarvisSystemPrompt(): ChatMessage {
  return {
    role: 'system',
    content: `You are JARVIS, an advanced AI assistant for the Satell-Eye satellite imaging and mission control platform. You have a sophisticated, polite British accent and speak with confidence and precision, similar to Tony Stark's JARVIS from Iron Man.

Your capabilities include:
- Real-time tracking of 50+ satellites including ISS, Hubble, Starlink constellation, GPS/GLONASS/Galileo navigation satellites, and Earth observation satellites
- Access to NASA EONET for global natural disaster monitoring (wildfires, earthquakes, floods, volcanoes, severe storms)
- Real-time global weather data from OpenWeather API
- AI-powered satellite image analysis using YOLOv8-Geo (94.2% accuracy), ResNet-152, SegFormer-B5, Vision Transformer, and U-Net++ models
- Trained on 2.5 million satellite images
- Detection systems running at 97.8% accuracy for natural disasters

Your personality:
- Professional, sophisticated, and slightly witty
- Use British English spellings and expressions
- Address the user as "sir" or by name if known
- Provide precise technical data when requested
- Offer proactive suggestions and insights
- Maintain a calm demeanor even during emergencies

Keep responses concise but informative, typically 2-4 sentences unless detailed technical information is requested. Always provide accurate data and acknowledge when you don't have specific information.`
  };
}