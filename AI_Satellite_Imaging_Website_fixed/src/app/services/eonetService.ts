// NASA EONET (Earth Observatory Natural Event Tracker) API Service
// API Documentation: https://eonet.gsfc.nasa.gov/docs/v3

const EONET_BASE_URL = 'https://eonet.gsfc.nasa.gov/api/v3';

export interface EventGeometry {
  magnitudeValue?: number;
  magnitudeUnit?: string;
  date: string;
  type: string;
  coordinates: [number, number]; // [longitude, latitude]
}

export interface EventCategory {
  id: string;
  title: string;
}

export interface NaturalEvent {
  id: string;
  title: string;
  description?: string;
  link?: string;
  categories: EventCategory[];
  sources: Array<{
    id: string;
    url: string;
  }>;
  geometry: EventGeometry[];
  closed?: string | null;
}

export interface EONETResponse {
  title: string;
  description: string;
  link: string;
  events: NaturalEvent[];
}

/**
 * Fetch all natural events
 * @param status 'open' for active events, 'closed' for past events, or 'all'
 * @param limit Maximum number of events to return
 * @param days Number of days in the past to search
 */
export async function getNaturalEvents(
  status: 'open' | 'closed' | 'all' = 'all',
  limit?: number,
  days?: number
): Promise<EONETResponse> {
  try {
    let url = `${EONET_BASE_URL}/events`;
    const params = new URLSearchParams();
    
    if (status !== 'all') {
      params.append('status', status);
    }
    if (limit) {
      params.append('limit', limit.toString());
    }
    if (days) {
      params.append('days', days.toString());
    }
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`EONET API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching EONET events:', error);
    throw error;
  }
}

/**
 * Fetch events by category
 * @param categoryId Category ID (e.g., 'wildfires', 'volcanoes', 'earthquakes')
 * @param status Event status
 */
export async function getEventsByCategory(
  categoryId: string,
  status: 'open' | 'closed' | 'all' = 'all'
): Promise<EONETResponse> {
  try {
    let url = `${EONET_BASE_URL}/categories/${categoryId}`;
    if (status !== 'all') {
      url += `?status=${status}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`EONET API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching EONET events by category:', error);
    throw error;
  }
}

/**
 * Get event categories
 */
export async function getCategories() {
  try {
    const response = await fetch(`${EONET_BASE_URL}/categories`);
    
    if (!response.ok) {
      throw new Error(`EONET API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching EONET categories:', error);
    throw error;
  }
}

/**
 * Get color for event category
 */
export function getCategoryColor(categoryId: string): string {
  const colors: Record<string, string> = {
    wildfires: '#ff4500',
    volcanoes: '#ff6347',
    severeStorms: '#4169e1',
    floods: '#1e90ff',
    drought: '#daa520',
    earthquakes: '#8b4513',
    landslides: '#a0522d',
    seaLakeIce: '#00ced1',
    snow: '#b0e0e6',
    tempExtremes: '#ff8c00',
    waterColor: '#20b2aa',
    dustHaze: '#d2b48c',
    manmade: '#808080'
  };
  
  return colors[categoryId] || '#ffffff';
}

/**
 * Get icon emoji for event category
 */
export function getCategoryIcon(categoryId: string): string {
  const icons: Record<string, string> = {
    wildfires: '🔥',
    volcanoes: '🌋',
    severeStorms: '⛈️',
    floods: '🌊',
    drought: '🏜️',
    earthquakes: '🌍',
    landslides: '⛰️',
    seaLakeIce: '🧊',
    snow: '❄️',
    tempExtremes: '🌡️',
    waterColor: '💧',
    dustHaze: '💨',
    manmade: '⚠️'
  };
  
  return icons[categoryId] || '📍';
}
