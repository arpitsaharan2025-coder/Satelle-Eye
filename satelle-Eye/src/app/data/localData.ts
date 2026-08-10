export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';

export interface DetectionEvent {
  id: string;
  title: string;
  category: 'wildfires' | 'volcanoes' | 'severeStorms' | 'floods' | 'drought' | 'deforestation';
  severity: Severity;
  lat: number;
  lon: number;
  confidence: number;
  areaKm2: number;
  detectedAt: string;
  description: string;
}

export interface SatelliteRecord {
  id: string;
  lat: number;
  lon: number;
  alt: number;
  speed: number;
  mission: string;
  operator: string;
  purpose: string;
  band: string;
}

export const DETECTION_DATA: DetectionEvent[] = [
  { id: 'DET-001', title: 'Amazon Forest Loss Cluster', category: 'deforestation', severity: 'Critical', lat: -3.4653, lon: -62.2159, confidence: 96.4, areaKm2: 184.2, detectedAt: '2026-08-10T16:42:00Z', description: 'High-confidence vegetation-loss pattern detected across adjacent forest patches.' },
  { id: 'DET-002', title: 'Siberian Thermal Anomaly', category: 'wildfires', severity: 'High', lat: 61.524, lon: 105.3188, confidence: 93.1, areaKm2: 74.6, detectedAt: '2026-08-10T15:55:00Z', description: 'Thermal signature consistent with an active wildfire cluster.' },
  { id: 'DET-003', title: 'Ganges Flood Risk Zone', category: 'floods', severity: 'High', lat: 25.5941, lon: 85.1376, confidence: 89.7, areaKm2: 126.8, detectedAt: '2026-08-10T14:30:00Z', description: 'Surface-water expansion indicates elevated flood exposure.' },
  { id: 'DET-004', title: 'East Africa Dryness Signal', category: 'drought', severity: 'Medium', lat: 1.2921, lon: 36.8219, confidence: 86.2, areaKm2: 412.5, detectedAt: '2026-08-10T13:18:00Z', description: 'Persistent vegetation stress detected in the monitored region.' },
  { id: 'DET-005', title: 'Iceland Volcanic Thermal Signal', category: 'volcanoes', severity: 'Medium', lat: 63.985, lon: -19.0, confidence: 91.5, areaKm2: 18.4, detectedAt: '2026-08-10T12:50:00Z', description: 'Localized thermal anomaly around a volcanic region.' },
  { id: 'DET-006', title: 'Pacific Storm Cell', category: 'severeStorms', severity: 'Low', lat: 16.2, lon: -145.7, confidence: 82.8, areaKm2: 256.1, detectedAt: '2026-08-10T11:40:00Z', description: 'Large cloud-system footprint flagged for monitoring.' },
  { id: 'DET-007', title: 'Southeast Asia Forest Fragmentation', category: 'deforestation', severity: 'High', lat: 1.3521, lon: 103.8198, confidence: 94.0, areaKm2: 67.3, detectedAt: '2026-08-10T10:15:00Z', description: 'Fragmentation pattern suggests recent land-cover conversion.' },
  { id: 'DET-008', title: 'Australian Bushfire Perimeter', category: 'wildfires', severity: 'Critical', lat: -33.8688, lon: 151.2093, confidence: 97.1, areaKm2: 142.9, detectedAt: '2026-08-10T09:48:00Z', description: 'Strong thermal and smoke indicators define an active fire perimeter.' },
  { id: 'DET-009', title: 'Andean Precipitation Stress', category: 'drought', severity: 'Low', lat: -13.5319, lon: -71.9675, confidence: 79.6, areaKm2: 305.7, detectedAt: '2026-08-10T08:20:00Z', description: 'Vegetation indices indicate moderate seasonal moisture stress.' },
  { id: 'DET-010', title: 'Mediterranean Storm System', category: 'severeStorms', severity: 'Medium', lat: 37.9838, lon: 23.7275, confidence: 88.9, areaKm2: 98.2, detectedAt: '2026-08-10T07:35:00Z', description: 'Cloud morphology and intensity indicate a developing storm cell.' }
];

export const SATELLITES: SatelliteRecord[] = [
  { id: 'SENTINEL-2A', lat: 18.2, lon: 78.5, alt: 786, speed: 7.5, mission: 'Optical Earth Observation', operator: 'ESA', purpose: 'Multispectral land monitoring', band: 'X-band' },
  { id: 'SENTINEL-1A', lat: -4.7, lon: 112.4, alt: 693, speed: 7.5, mission: 'SAR Earth Observation', operator: 'ESA', purpose: 'All-weather surface monitoring', band: 'C-band' },
  { id: 'LANDSAT-9', lat: 35.6, lon: -98.2, alt: 705, speed: 7.5, mission: 'Land Imaging', operator: 'NASA/USGS', purpose: 'Long-term land observation', band: 'X-band' },
  { id: 'TERRA', lat: -12.8, lon: 34.2, alt: 705, speed: 7.5, mission: 'Earth Observation', operator: 'NASA', purpose: 'Climate and land monitoring', band: 'X-band' },
  { id: 'AQUA', lat: 42.1, lon: 139.8, alt: 705, speed: 7.5, mission: 'Earth Observation', operator: 'NASA', purpose: 'Water and atmospheric monitoring', band: 'X-band' },
  { id: 'NOAA-20', lat: 9.4, lon: -44.5, alt: 824, speed: 7.4, mission: 'Weather Observation', operator: 'NOAA', purpose: 'Weather and climate monitoring', band: 'X-band' },
  { id: 'SWOT', lat: -29.2, lon: 12.8, alt: 891, speed: 7.4, mission: 'Surface Water Topography', operator: 'NASA/CNES', purpose: 'Water and ocean topography', band: 'Ka-band' },
  { id: 'ISS', lat: 51.6, lon: 31.7, alt: 408, speed: 7.7, mission: 'Crewed Research', operator: 'NASA/Roscosmos', purpose: 'Research and technology demonstration', band: 'S-band' }
];

export const LOCAL_WEATHER: Record<string, { location: string; country: string; temperature: number; feelsLike: number; humidity: number; pressure: number; windSpeed: number; windDirection: number; visibility: number; uvIndex: number; precipitation: number; description: string; cloudCover: number; coordinates: { lat: number; lon: number }; timestamp: string; sunrise: string; sunset: string; weatherCode: number; aqi: number; aqiLevel: string; pollutants: { pm25: number; pm10: number; o3: number; no2: number; so2: number; co: number } }> = {
  london: { location: 'London', country: 'United Kingdom', temperature: 18.4, feelsLike: 18.0, humidity: 72, pressure: 1014, windSpeed: 4.8, windDirection: 245, visibility: 10, uvIndex: 4, precipitation: 0.8, description: 'Partly cloudy', cloudCover: 48, coordinates: { lat: 51.5074, lon: -0.1278 }, timestamp: '2026-08-10T16:00:00Z', sunrise: '2026-08-10T04:35:00Z', sunset: '2026-08-10T19:40:00Z', weatherCode: 2, aqi: 32, aqiLevel: 'Good', pollutants: { pm25: 12, pm10: 21, o3: 54, no2: 18, so2: 3, co: 0.2 } },
  tokyo: { location: 'Tokyo', country: 'Japan', temperature: 29.2, feelsLike: 32.1, humidity: 78, pressure: 1007, windSpeed: 3.2, windDirection: 160, visibility: 8.5, uvIndex: 8, precipitation: 1.6, description: 'Light rain', cloudCover: 70, coordinates: { lat: 35.6762, lon: 139.6503 }, timestamp: '2026-08-10T16:00:00Z', sunrise: '2026-08-09T19:52:00Z', sunset: '2026-08-10T10:36:00Z', weatherCode: 61, aqi: 41, aqiLevel: 'Good', pollutants: { pm25: 15, pm10: 28, o3: 47, no2: 22, so2: 4, co: 0.3 } },
  delhi: { location: 'Delhi', country: 'India', temperature: 34.6, feelsLike: 39.2, humidity: 64, pressure: 998, windSpeed: 2.7, windDirection: 180, visibility: 6.2, uvIndex: 9, precipitation: 3.2, description: 'Humid and cloudy', cloudCover: 76, coordinates: { lat: 28.6139, lon: 77.209, }, timestamp: '2026-08-10T16:00:00Z', sunrise: '2026-08-10T00:00:00Z', sunset: '2026-08-10T13:20:00Z', weatherCode: 3, aqi: 94, aqiLevel: 'Moderate', pollutants: { pm25: 38, pm10: 67, o3: 61, no2: 31, so2: 6, co: 0.6 } },
  mumbai: { location: 'Mumbai', country: 'India', temperature: 27.8, feelsLike: 31.0, humidity: 83, pressure: 1004, windSpeed: 5.4, windDirection: 210, visibility: 7.4, uvIndex: 6, precipitation: 5.6, description: 'Monsoon showers', cloudCover: 84, coordinates: { lat: 19.076, lon: 72.8777 }, timestamp: '2026-08-10T16:00:00Z', sunrise: '2026-08-10T00:55:00Z', sunset: '2026-08-10T13:45:00Z', weatherCode: 63, aqi: 52, aqiLevel: 'Moderate', pollutants: { pm25: 24, pm10: 41, o3: 32, no2: 19, so2: 5, co: 0.4 } }
};

export function severityColor(severity: Severity) {
  return { Critical: '#ff365c', High: '#ff8a3d', Medium: '#ffd84d', Low: '#37e7ff' }[severity];
}

export function categoryLabel(category: DetectionEvent['category']) {
  return { wildfires: 'Wildfire', volcanoes: 'Volcanic', severeStorms: 'Storm', floods: 'Flood', drought: 'Drought', deforestation: 'Deforestation' }[category];
}
