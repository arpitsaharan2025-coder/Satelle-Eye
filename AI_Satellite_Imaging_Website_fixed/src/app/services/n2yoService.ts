// N2YO Satellite Tracking API Service
// API Documentation: https://www.n2yo.com/api/

const N2YO_API_KEY = 'RDJTES-3K95PU-PRCNVW-5M3Y';
const N2YO_BASE_URL = 'https://api.n2yo.com/rest/v1/satellite';
// Alternative CORS proxy options
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
];

// NORAD IDs for the satellites we're tracking
export const SATELLITE_IDS = {
  // ISS and Major Space Stations
  'ISS (ZARYA)': 25544,
  'TIANGONG': 48274,
  
  // GPS/Navigation Satellites
  'GPS BIIR-2  (PRN 13)': 24876,
  'GPS BIIR-8  (PRN 16)': 27663,
  'GALILEO-FM3': 37846,
  'GALILEO-FM4': 37847,
  'GLONASS-M 759': 37829,
  'BEIDOU 3M9': 43001,
  
  // Communication Satellites
  'IRIDIUM 33': 24946,
  'IRIDIUM 117': 42803,
  'IRIDIUM 120': 42956,
  'STARLINK-1007': 44713,
  'STARLINK-1008': 44714,
  'INTELSAT 901': 26038,
  'SES-12': 43440,
  
  // Earth Observation
  'LANDSAT 8': 39084,
  'LANDSAT 9': 49260,
  'SENTINEL-1A': 39634,
  'SENTINEL-2A': 40697,
  'SENTINEL-3A': 41335,
  'TERRA': 25994,
  'AQUA': 27424,
  'NOAA 19': 33591,
  'NOAA 20': 43013,
  'SUOMI NPP': 37849,
  
  // Weather Satellites
  'GOES 16': 41866,
  'GOES 17': 43226,
  'METOP-B': 38771,
  'METOP-C': 43689,
  'HIMAWARI-8': 40267,
  
  // Scientific/Research
  'HUBBLE SPACE TELESCOPE': 20580,
  'CHANDRA X-RAY OBSERVATORY': 25867,
  'JAMES WEBB SPACE TELESCOPE': 50463,
  'SMOS': 36036,
  'SWOT': 54754,
  
  // Amateur Radio
  'VO-96': 43137,
  'HO-68': 36122,
  'VO-52': 28650,
  'AO-91': 43017,
  'AO-92': 43137,
  'SO-50': 27607,
  
  // CubeSats & Small Satellites
  'LEMUR 2 PETER-JOHN': 43765,
  'FLOCK 4E-1': 43798,
  'PLANET 1': 44885,
  
  // SpaceX Starlink Constellation (Sample)
  'STARLINK-1600': 47129,
  'STARLINK-1843': 48274,
  'STARLINK-2182': 48915,
};

export interface SatellitePosition {
  satlatitude: number;
  satlongitude: number;
  sataltitude: number;
  azimuth: number;
  elevation: number;
  ra: number;
  dec: number;
  timestamp: number;
}

export interface SatelliteInfo {
  satid: number;
  satname: string;
  transactionscount: number;
}

export interface TLEData {
  info: SatelliteInfo;
  tle: string;
}

export interface VisualPass {
  startAz: number;
  startAzCompass: string;
  startEl: number;
  startUTC: number;
  maxAz: number;
  maxAzCompass: string;
  maxEl: number;
  maxUTC: number;
  endAz: number;
  endAzCompass: string;
  endEl: number;
  endUTC: number;
  mag: number;
  duration: number;
}

export interface SatellitePositionResponse {
  info: SatelliteInfo;
  positions: SatellitePosition[];
}

export interface VisualPassesResponse {
  info: SatelliteInfo;
  passes: VisualPass[];
}

/**
 * Get satellite positions for a given time period
 * @param satelliteId NORAD ID of the satellite
 * @param observerLat Observer latitude
 * @param observerLng Observer longitude
 * @param observerAlt Observer altitude in meters
 * @param seconds Number of seconds to predict
 */
export async function getSatellitePositions(
  satelliteId: number,
  observerLat: number = 0,
  observerLng: number = 0,
  observerAlt: number = 0,
  seconds: number = 300
): Promise<SatellitePositionResponse> {
  const apiUrl = `${N2YO_BASE_URL}/positions/${satelliteId}/${observerLat}/${observerLng}/${observerAlt}/${seconds}/&apiKey=${N2YO_API_KEY}`;
  
  // Try multiple CORS proxies
  for (const proxy of CORS_PROXIES) {
    try {
      const url = `${proxy}${encodeURIComponent(apiUrl)}`;
      const response = await fetch(url, { 
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Successfully fetched position data for satellite ${satelliteId}`);
        return data;
      }
    } catch (error) {
      console.log(`Proxy ${proxy} failed, trying next...`);
      continue;
    }
  }
  
  // All proxies failed, use mock data
  console.log(`Using mock data for satellite ${satelliteId}`);
  return generateMockPositionData(satelliteId);
}

/**
 * Get TLE (Two-Line Element) data for a satellite
 * @param satelliteId NORAD ID of the satellite
 */
export async function getSatelliteTLE(satelliteId: number): Promise<TLEData> {
  const apiUrl = `${N2YO_BASE_URL}/tle/${satelliteId}/&apiKey=${N2YO_API_KEY}`;
  
  for (const proxy of CORS_PROXIES) {
    try {
      const url = `${proxy}${encodeURIComponent(apiUrl)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      continue;
    }
  }
  
  throw new Error('Failed to fetch TLE data from all sources');
}

/**
 * Get visual passes of a satellite
 * @param satelliteId NORAD ID of the satellite
 * @param observerLat Observer latitude
 * @param observerLng Observer longitude
 * @param observerAlt Observer altitude in meters
 * @param days Number of days to predict (max 10)
 * @param minVisibility Minimum number of seconds the satellite should be visible
 */
export async function getVisualPasses(
  satelliteId: number,
  observerLat: number,
  observerLng: number,
  observerAlt: number = 0,
  days: number = 10,
  minVisibility: number = 300
): Promise<VisualPassesResponse> {
  const apiUrl = `${N2YO_BASE_URL}/visualpasses/${satelliteId}/${observerLat}/${observerLng}/${observerAlt}/${days}/${minVisibility}/&apiKey=${N2YO_API_KEY}`;
  
  for (const proxy of CORS_PROXIES) {
    try {
      const url = `${proxy}${encodeURIComponent(apiUrl)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      continue;
    }
  }
  
  throw new Error('Failed to fetch visual passes from all sources');
}

/**
 * Get radio passes of a satellite
 * @param satelliteId NORAD ID of the satellite
 * @param observerLat Observer latitude
 * @param observerLng Observer longitude
 * @param observerAlt Observer altitude in meters
 * @param days Number of days to predict (max 10)
 * @param minElevation Minimum elevation in degrees
 */
export async function getRadioPasses(
  satelliteId: number,
  observerLat: number,
  observerLng: number,
  observerAlt: number = 0,
  days: number = 10,
  minElevation: number = 0
): Promise<any> {
  const apiUrl = `${N2YO_BASE_URL}/radiopasses/${satelliteId}/${observerLat}/${observerLng}/${observerAlt}/${days}/${minElevation}/&apiKey=${N2YO_API_KEY}`;
  
  // Try multiple CORS proxies
  for (const proxy of CORS_PROXIES) {
    try {
      const url = `${proxy}${encodeURIComponent(apiUrl)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Successfully fetched radio passes for satellite ${satelliteId}`);
        return data;
      }
    } catch (error) {
      console.log(`Proxy ${proxy} failed for radio passes, trying next...`);
      continue;
    }
  }
  
  // All proxies failed, use mock data
  console.log(`Using mock radio passes for satellite ${satelliteId}`);
  return { passes: generateMockRadioPasses(satelliteId) };
}

/**
 * Generate mock position data for fallback
 */
function generateMockPositionData(satelliteId: number): SatellitePositionResponse {
  const satelliteName = Object.entries(SATELLITE_IDS).find(([, id]) => id === satelliteId)?.[0] || 'Unknown';
  const now = Date.now() / 1000;
  
  // Generate realistic orbital positions
  const baseOrbit = {
    43137: { lat: 12.5, lng: 45.3, alt: 410 },  // VO-96
    36122: { lat: -34.2, lng: 118.7, alt: 680 }, // HO-68
    28650: { lat: 51.6, lng: -95.4, alt: 1450 }  // VO-52
  };
  
  const orbit = baseOrbit[satelliteId as keyof typeof baseOrbit] || { lat: 0, lng: 0, alt: 400 };
  
  return {
    info: {
      satid: satelliteId,
      satname: satelliteName,
      transactionscount: 1
    },
    positions: [{
      satlatitude: orbit.lat + (Math.random() - 0.5) * 10,
      satlongitude: orbit.lng + (Math.random() - 0.5) * 20,
      sataltitude: orbit.alt + (Math.random() - 0.5) * 50,
      azimuth: Math.random() * 360,
      elevation: Math.random() * 90,
      ra: Math.random() * 360,
      dec: (Math.random() - 0.5) * 180,
      timestamp: now
    }]
  };
}

/**
 * Generate mock radio passes for fallback
 */
function generateMockRadioPasses(satelliteId: number) {
  const now = Date.now() / 1000;
  const passes = [];
  
  for (let i = 0; i < 5; i++) {
    const startTime = now + (i * 12 * 3600) + Math.random() * 3600;
    const duration = 300 + Math.random() * 600;
    
    passes.push({
      startAz: Math.random() * 360,
      startAzCompass: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
      startUTC: startTime,
      maxAz: Math.random() * 360,
      maxAzCompass: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
      maxEl: 30 + Math.random() * 60,
      maxUTC: startTime + duration / 2,
      endAz: Math.random() * 360,
      endAzCompass: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
      endUTC: startTime + duration,
      duration: Math.floor(duration)
    });
  }
  
  return passes;
}

/**
 * Fetch data for all tracked satellites
 */
export async function getAllSatelliteData(
  observerLat: number = 0,
  observerLng: number = 0,
  observerAlt: number = 0
) {
  const satellites = Object.entries(SATELLITE_IDS);
  const results = await Promise.allSettled(
    satellites.map(async ([name, id]) => {
      const position = await getSatellitePositions(id, observerLat, observerLng, observerAlt, 1);
      const passes = await getRadioPasses(id, observerLat, observerLng, observerAlt, 10, 0);
      return {
        name,
        id,
        position: position.positions[0],
        passes: passes.passes || [],
        info: position.info
      };
    })
  );

  return results
    .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
    .map(result => result.value);
}