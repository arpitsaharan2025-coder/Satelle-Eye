// Service for fetching global weather data using OpenWeather API

interface WeatherData {
  location: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  uvIndex: number;
  precipitation: number;
  description: string;
  cloudCover: number;
  coordinates: { lat: number; lon: number };
  timestamp: string;
  sunrise: string;
  sunset: string;
  weatherCode: number;
  aqi: number;
  aqiLevel: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  pollutants: {
    pm25: number;
    pm10: number;
    o3: number;
    no2: number;
    so2: number;
    co: number;
  };
  dewPoint: number;
  rainVolume: number;
  snowVolume: number;
  weatherMain: string;
  weatherIcon: string;
}

interface GeocodingResult {
  name: string;
  country: string;
  lat: number;
  lon: number;
  state?: string;
}

const OPENWEATHER_API_KEY = '4d8bee2ec4090b05e8887a76c93100a6';
const WAQI_API_KEY = '8df644515d45bc385a6bc12c09fb2bf1cdb35d5c';

// Geocode location using OpenWeather Geocoding API
async function geocodeLocation(locationName: string): Promise<GeocodingResult> {
  try {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(locationName)}&limit=1&appid=${OPENWEATHER_API_KEY}`;
    console.log('Geocoding request for:', locationName);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Geocoding API error:', response.status, response.statusText);
      throw new Error(`Geocoding API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Geocoding response:', data);

    if (!data || data.length === 0) {
      console.error('No results found for location:', locationName);
      throw new Error(`Location "${locationName}" not found. Please try another city name.`);
    }

    const location = data[0];
    return {
      name: location.name,
      country: location.country,
      lat: location.lat,
      lon: location.lon,
      state: location.state,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unable to geocode location. Please check your internet connection.');
  }
}

// Fetch weather data using OpenWeather API
async function fetchOpenWeatherData(lat: number, lon: number): Promise<any> {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Weather API request failed');
    }

    return response.json();
  } catch (error) {
    console.error('Weather API error:', error);
    throw error;
  }
}

// Fetch UV index data
async function fetchUVIndexData(lat: number, lon: number): Promise<number> {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`
    );
    
    if (!response.ok) {
      return 0;
    }

    const data = await response.json();
    return data.value || 0;
  } catch (error) {
    console.error('UV Index API error:', error);
    return 0;
  }
}

// Fetch air quality data using WAQI (World Air Quality Index) API
async function fetchAirQualityData(lat: number, lon: number): Promise<any> {
  try {
    // Use geo-coordinates to get the nearest AQI station
    const response = await fetch(
      `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${WAQI_API_KEY}`
    );
    
    if (!response.ok) {
      console.error('Air quality API request failed with status:', response.status);
      return null;
    }

    const data = await response.json();
    
    console.log('WAQI API Full Response:', JSON.stringify(data, null, 2));
    
    if (data.status !== 'ok') {
      console.error('WAQI API returned error status:', data.status, data.message || '');
      return null;
    }

    // Validate that we have actual AQI data
    if (!data.data || typeof data.data.aqi !== 'number') {
      console.error('WAQI API response missing valid AQI data:', data);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching air quality:', error);
    return null;
  }
}

// Calculate AQI level from US AQI value (0-500 scale)
function getAQILevel(aqi: number): 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous' {
  // US AQI standard scale
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

export async function fetchWeatherByLocation(locationName: string): Promise<WeatherData> {
  try {
    // Step 1: Geocode the location
    const geoData = await geocodeLocation(locationName);
    
    // Step 2: Fetch weather data from OpenWeather
    const weatherData = await fetchOpenWeatherData(geoData.lat, geoData.lon);
    
    // Step 3: Fetch UV index
    const uvIndex = await fetchUVIndexData(geoData.lat, geoData.lon);
    
    // Step 4: Fetch air quality data
    const airQualityData = await fetchAirQualityData(geoData.lat, geoData.lon);
    
    let aqi = 0;
    let aqiLevel: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous' = 'Good';
    let pollutants = {
      pm25: 0,
      pm10: 0,
      o3: 0,
      no2: 0,
      so2: 0,
      co: 0,
    };
    
    if (airQualityData && airQualityData.data) {
      const airQualityList = airQualityData.data;
      const aqiValue = typeof airQualityList.aqi === 'number' ? airQualityList.aqi : 0;
      const components = airQualityList.iaqi || {};
      
      console.log('Extracted AQI Value:', aqiValue);
      console.log('Extracted Components:', components);
      
      aqi = aqiValue;
      aqiLevel = getAQILevel(aqiValue);
      
      console.log('Final AQI:', aqi, 'Level:', aqiLevel);
      
      pollutants = {
        pm25: components.pm25?.v || 0,
        pm10: components.pm10?.v || 0,
        o3: components.o3?.v || 0,
        no2: components.no2?.v || 0,
        so2: components.so2?.v || 0,
        co: components.co?.v || 0,
      };
    } else {
      console.warn('No air quality data available for this location');
    }
    
    // Extract weather data
    const main = weatherData.main || {};
    const wind = weatherData.wind || {};
    const clouds = weatherData.clouds || {};
    const sys = weatherData.sys || {};
    const weather = weatherData.weather?.[0] || {};
    const rain = weatherData.rain || {};
    const snow = weatherData.snow || {};
    
    return {
      location: geoData.name,
      country: geoData.country,
      temperature: main.temp || 0,
      feelsLike: main.feels_like || main.temp || 0,
      humidity: main.humidity || 0,
      pressure: main.pressure || 1013,
      windSpeed: wind.speed || 0,
      windDirection: wind.deg || 0,
      visibility: (weatherData.visibility || 10000) / 1000, // Convert to km
      uvIndex: uvIndex,
      precipitation: rain['1h'] || rain['3h'] || 0,
      description: weather.description || 'Unknown',
      weatherMain: weather.main || 'Clear',
      weatherIcon: weather.icon || '01d',
      cloudCover: clouds.all || 0,
      coordinates: {
        lat: geoData.lat,
        lon: geoData.lon,
      },
      timestamp: new Date().toISOString(),
      sunrise: new Date(sys.sunrise * 1000).toISOString(),
      sunset: new Date(sys.sunset * 1000).toISOString(),
      weatherCode: weather.id || 800,
      aqi: aqi,
      aqiLevel: aqiLevel,
      pollutants: pollutants,
      dewPoint: main.temp - ((100 - main.humidity) / 5), // Approximation
      rainVolume: rain['1h'] || rain['3h'] || 0,
      snowVolume: snow['1h'] || snow['3h'] || 0,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}