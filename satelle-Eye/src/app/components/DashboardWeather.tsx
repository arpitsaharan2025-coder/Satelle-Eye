import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Cloud, Sunrise, Sunset, Wind, Droplets, Eye, Gauge, CloudRain, Thermometer, Activity, AlertTriangle, Compass, CloudSnow } from 'lucide-react';
import { LOCAL_WEATHER } from '../data/localData';

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
}

const POPULAR_CITIES = [
  'London', 'Tokyo', 'New York', 'Paris', 'Berlin',
  'Moscow', 'Delhi', 'Mumbai', 'Sydney', 'Beijing',
  'Singapore', 'Dubai', 'Los Angeles', 'Toronto', 
  'São Paulo', 'Cairo', 'Istanbul', 'Bangkok', 'Seoul'
];

export function DashboardWeather() {
  const [searchQuery, setSearchQuery] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = POPULAR_CITIES.filter(city =>
        city.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCities(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredCities([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    handleSearch('London');
  }, []);

  const handleSearch = async (cityName?: string) => {
    const query = cityName || searchQuery;
    if (!query.trim()) return;

    setLoading(true);
    setShowSuggestions(false);

    try {
      console.log('Fetching weather for:', query);
      const data = LOCAL_WEATHER[query.trim().toLowerCase()] || LOCAL_WEATHER.london;
      console.log('Weather data received:', data);
      setWeatherData(data);
      if (!cityName) setSearchQuery('');
    } catch (err) {
      console.error('Error fetching weather:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data. Please try another city.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (city: string) => {
    setSearchQuery('');
    handleSearch(city);
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getWeatherIcon = (code: number) => {
    if (code === 0 || code === 1) return '☀️';
    if (code === 2 || code === 3) return '⛅';
    if (code >= 45 && code <= 48) return '🌫️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 86) return '❄️';
    if (code >= 95) return '⛈️';
    return '☁️';
  };

  const getAQIColor = (level: string) => {
    switch (level) {
      case 'Good': return { bg: 'from-green-500/20 to-emerald-500/20', border: 'border-green-400/30', text: 'text-green-400' };
      case 'Moderate': return { bg: 'from-yellow-500/20 to-amber-500/20', border: 'border-yellow-400/30', text: 'text-yellow-400' };
      case 'Unhealthy for Sensitive Groups': return { bg: 'from-orange-500/20 to-red-500/20', border: 'border-orange-400/30', text: 'text-orange-400' };
      case 'Unhealthy': return { bg: 'from-red-500/20 to-pink-500/20', border: 'border-red-400/30', text: 'text-red-400' };
      case 'Very Unhealthy': return { bg: 'from-purple-500/20 to-fuchsia-500/20', border: 'border-purple-400/30', text: 'text-purple-400' };
      case 'Hazardous': return { bg: 'from-red-800/20 to-red-900/20', border: 'border-red-600/30', text: 'text-red-600' };
      default: return { bg: 'from-gray-500/20 to-gray-600/20', border: 'border-gray-400/30', text: 'text-gray-400' };
    }
  };

  return (
    <div className="col-span-3 backdrop-blur-md bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-white/10 rounded-2xl p-6 shadow-2xl">
      {}
      <div className="mb-6">
        <h3 className="text-white text-xl mb-4 flex items-center gap-2">
          <Cloud className="w-6 h-6 text-cyan-400" />
          Global Weather Forecast
        </h3>
        
        {}
        <div ref={searchRef} className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for any city..."
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/50 focus:bg-white/15 transition-all duration-300"
            />
          </div>

          {}
          <AnimatePresence>
            {showSuggestions && filteredCities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl overflow-hidden shadow-2xl z-50 max-h-60 overflow-y-auto"
              >
                {filteredCities.map((city) => (
                  <button
                    key={city}
                    onClick={() => handleSuggestionClick(city)}
                    className="w-full px-4 py-3 text-left text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200 flex items-center gap-2"
                  >
                    <span className="text-cyan-400">📍</span>
                    {city}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
        </div>
      ) : weatherData ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {}
            <div className="lg:col-span-2 backdrop-blur-md bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-cyan-500/30 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h4 className="text-white text-3xl mb-1">{weatherData.location}</h4>
                  <p className="text-white/60">{weatherData.country}</p>
                  <p className="text-white/40 text-sm mt-1">
                    {weatherData.coordinates.lat.toFixed(2)}°, {weatherData.coordinates.lon.toFixed(2)}°
                  </p>
                </div>
                <div className="text-6xl">{getWeatherIcon(weatherData.weatherCode)}</div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {}
                <div>
                  <div className="text-white/60 text-sm mb-2">Temperature</div>
                  <div className="text-white text-5xl mb-2">{weatherData.temperature.toFixed(1)}°C</div>
                  <div className="text-white/80">Feels like {weatherData.feelsLike.toFixed(1)}°C</div>
                  <div className="text-cyan-400 mt-1 capitalize">{weatherData.description}</div>
                </div>

                {}
                <div className="grid grid-cols-2 gap-4">
                  <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sunrise className="w-5 h-5 text-orange-400" />
                      <span className="text-white/60 text-sm">Sunrise</span>
                    </div>
                    <div className="text-white text-xl">{formatTime(weatherData.sunrise)}</div>
                  </div>

                  <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sunset className="w-5 h-5 text-pink-400" />
                      <span className="text-white/60 text-sm">Sunset</span>
                    </div>
                    <div className="text-white text-xl">{formatTime(weatherData.sunset)}</div>
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="grid grid-cols-2 gap-3">
              {}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wind className="w-4 h-4 text-cyan-400" />
                  <span className="text-white/60 text-xs">Wind</span>
                </div>
                <div className="text-white text-xl">{weatherData.windSpeed.toFixed(1)}</div>
                <div className="text-white/60 text-xs">m/s</div>
              </div>

              {}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <span className="text-white/60 text-xs">Humidity</span>
                </div>
                <div className="text-white text-xl">{weatherData.humidity.toFixed(0)}</div>
                <div className="text-white/60 text-xs">%</div>
              </div>

              {}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="w-4 h-4 text-purple-400" />
                  <span className="text-white/60 text-xs">Pressure</span>
                </div>
                <div className="text-white text-xl">{weatherData.pressure.toFixed(0)}</div>
                <div className="text-white/60 text-xs">hPa</div>
              </div>

              {}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-green-400" />
                  <span className="text-white/60 text-xs">Visibility</span>
                </div>
                <div className="text-white text-xl">{weatherData.visibility.toFixed(1)}</div>
                <div className="text-white/60 text-xs">km</div>
              </div>
            </div>
          </div>

          {}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {}
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Cloud className="w-5 h-5 text-gray-400" />
                <span className="text-white/60 text-sm">Cloud Cover</span>
              </div>
              <div className="text-white text-2xl mb-1">{weatherData.cloudCover}%</div>
              <div className="text-white/60 text-xs">Coverage</div>
            </div>

            {}
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Compass className="w-5 h-5 text-cyan-400" />
                <span className="text-white/60 text-sm">Wind Direction</span>
              </div>
              <div className="text-white text-2xl mb-1">{weatherData.windDirection}°</div>
              <div className="text-white/60 text-xs">
                {weatherData.windDirection >= 337.5 || weatherData.windDirection < 22.5 ? 'North' :
                 weatherData.windDirection >= 22.5 && weatherData.windDirection < 67.5 ? 'NE' :
                 weatherData.windDirection >= 67.5 && weatherData.windDirection < 112.5 ? 'East' :
                 weatherData.windDirection >= 112.5 && weatherData.windDirection < 157.5 ? 'SE' :
                 weatherData.windDirection >= 157.5 && weatherData.windDirection < 202.5 ? 'South' :
                 weatherData.windDirection >= 202.5 && weatherData.windDirection < 247.5 ? 'SW' :
                 weatherData.windDirection >= 247.5 && weatherData.windDirection < 292.5 ? 'West' : 'NW'}
              </div>
            </div>

            {}
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="w-5 h-5 text-orange-400" />
                <span className="text-white/60 text-sm">UV Index</span>
              </div>
              <div className="text-white text-2xl mb-1">{weatherData.uvIndex.toFixed(1)}</div>
              <div className={`text-xs ${
                weatherData.uvIndex < 3 ? 'text-green-400' :
                weatherData.uvIndex < 6 ? 'text-yellow-400' :
                weatherData.uvIndex < 8 ? 'text-orange-400' :
                weatherData.uvIndex < 11 ? 'text-red-400' : 'text-purple-400'
              }`}>
                {weatherData.uvIndex < 3 ? 'Low' :
                 weatherData.uvIndex < 6 ? 'Moderate' :
                 weatherData.uvIndex < 8 ? 'High' :
                 weatherData.uvIndex < 11 ? 'Very High' : 'Extreme'}
              </div>
            </div>

            {}
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CloudRain className="w-5 h-5 text-blue-400" />
                <span className="text-white/60 text-sm">Precipitation</span>
              </div>
              <div className="text-white text-2xl mb-1">{weatherData.precipitation.toFixed(1)}</div>
              <div className="text-white/60 text-xs">mm/h</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-white/60">
          Search for a city to view weather data
        </div>
      )}

      {}
      {weatherData && weatherData.aqi > 0 && (
        <div className="mt-6">
          <div className={`backdrop-blur-md bg-gradient-to-br ${getAQIColor(weatherData.aqiLevel).bg} border ${getAQIColor(weatherData.aqiLevel).border} rounded-2xl p-6`} >
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Activity className={`w-6 h-6 ${getAQIColor(weatherData.aqiLevel).text}`} />
                  <h4 className="text-white text-xl">Air Quality Index (AQI)</h4>
                </div>
                <p className="text-white/60 text-sm">Real-time air quality data</p>
              </div>
              <div className="text-center">
                <div className={`text-5xl ${getAQIColor(weatherData.aqiLevel).text} mb-2`}>
                  {weatherData.aqi.toFixed(0)}
                </div>
                <div className={`px-4 py-1 ${getAQIColor(weatherData.aqiLevel).bg} border ${getAQIColor(weatherData.aqiLevel).border} rounded-full ${getAQIColor(weatherData.aqiLevel).text} text-sm`}>
                  {weatherData.aqiLevel}
                </div>
              </div>
            </div>

            {}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-white/60 text-xs mb-1">PM2.5</div>
                <div className="text-white text-lg">{weatherData.pollutants.pm25.toFixed(1)}</div>
                <div className="text-white/40 text-xs">µg/m³</div>
              </div>

              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-white/60 text-xs mb-1">PM10</div>
                <div className="text-white text-lg">{weatherData.pollutants.pm10.toFixed(1)}</div>
                <div className="text-white/40 text-xs">µg/m³</div>
              </div>

              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-white/60 text-xs mb-1">O₃</div>
                <div className="text-white text-lg">{weatherData.pollutants.o3.toFixed(1)}</div>
                <div className="text-white/40 text-xs">µg/m³</div>
              </div>

              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-white/60 text-xs mb-1">NO₂</div>
                <div className="text-white text-lg">{weatherData.pollutants.no2.toFixed(1)}</div>
                <div className="text-white/40 text-xs">µg/m³</div>
              </div>

              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-white/60 text-xs mb-1">SO₂</div>
                <div className="text-white text-lg">{weatherData.pollutants.so2.toFixed(1)}</div>
                <div className="text-white/40 text-xs">µg/m³</div>
              </div>

              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-white/60 text-xs mb-1">CO</div>
                <div className="text-white text-lg">{weatherData.pollutants.co.toFixed(0)}</div>
                <div className="text-white/40 text-xs">µg/m³</div>
              </div>
            </div>

            {}
            <div className="mt-4 p-4 backdrop-blur-md bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-start gap-2">
                <AlertTriangle className={`w-5 h-5 ${getAQIColor(weatherData.aqiLevel).text} mt-0.5`} />
                <div>
                  <div className="text-white text-sm mb-1">Health Advisory</div>
                  <div className="text-white/80 text-sm">
                    {weatherData.aqiLevel === 'Good' && 'Air quality is satisfactory, and air pollution poses little or no risk.'}
                    {weatherData.aqiLevel === 'Moderate' && 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.'}
                    {weatherData.aqiLevel === 'Unhealthy for Sensitive Groups' && 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.'}
                    {weatherData.aqiLevel === 'Unhealthy' && 'Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.'}
                    {weatherData.aqiLevel === 'Very Unhealthy' && 'Health alert: The risk of health effects is increased for everyone.'}
                    {weatherData.aqiLevel === 'Hazardous' && 'Health warning of emergency conditions: everyone is more likely to be affected.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {}
      {weatherData && (
        <div className="mt-4 text-center text-white/40 text-xs">
          Last updated: {new Date(weatherData.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
}