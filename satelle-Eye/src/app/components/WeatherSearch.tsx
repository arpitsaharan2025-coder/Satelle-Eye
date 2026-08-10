import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Cloud, Wind, Droplets, Gauge, Eye, Sun, Umbrella, X } from 'lucide-react';
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
}

interface WeatherSearchProps {
  onClose: () => void;
}

export function WeatherSearch({ onClose }: WeatherSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');

    try {
      const data = LOCAL_WEATHER[searchQuery.trim().toLowerCase()] || LOCAL_WEATHER.london;
      setWeatherData(data);
    } catch (err) {
      setError('Unable to fetch weather data. Please try another location.');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-4xl w-full backdrop-blur-md bg-gradient-to-br from-slate-900/90 to-blue-900/90 border border-white/20 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {}
        <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-white text-2xl mb-1">Global Weather Search</h2>
            <p className="text-white/60 text-sm">Get real-time weather data for any location worldwide</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {}
        <div className="px-8 py-6 border-b border-white/10">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter city name (e.g., London, Tokyo, New York)..."
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/50 focus:bg-white/15 transition-all duration-300"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
          {error && (
            <div className="mt-3 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}
        </div>

        {}
        {weatherData && (
          <div className="px-8 py-6 max-h-[600px] overflow-y-auto">
            {}
            <div className="mb-6">
              <h3 className="text-white text-2xl mb-1">{weatherData.location}</h3>
              <p className="text-white/60">{weatherData.country}</p>
              <p className="text-white/40 text-sm mt-1">
                {weatherData.coordinates.lat.toFixed(2)}°, {weatherData.coordinates.lon.toFixed(2)}°
              </p>
            </div>

            {}
            <div className="mb-6 backdrop-blur-md bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-cyan-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/60 text-sm mb-2">Current Temperature</div>
                  <div className="text-white text-6xl mb-2">{weatherData.temperature.toFixed(1)}°C</div>
                  <div className="text-white/80 text-lg">{weatherData.description}</div>
                  <div className="text-white/60 text-sm mt-2">
                    Feels like {weatherData.feelsLike.toFixed(1)}°C
                  </div>
                </div>
                <Cloud className="w-24 h-24 text-cyan-400/50" />
              </div>
            </div>

            {}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wind className="w-5 h-5 text-cyan-400" />
                  <span className="text-white/60 text-sm">Wind Speed</span>
                </div>
                <div className="text-white text-2xl mb-1">{weatherData.windSpeed.toFixed(1)} m/s</div>
                <div className="text-white/60 text-sm">
                  Direction: {getWindDirection(weatherData.windDirection)} ({weatherData.windDirection.toFixed(0)}°)
                </div>
              </div>

              {}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="w-5 h-5 text-blue-400" />
                  <span className="text-white/60 text-sm">Humidity</span>
                </div>
                <div className="text-white text-2xl">{weatherData.humidity.toFixed(0)}%</div>
              </div>

              {}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="w-5 h-5 text-purple-400" />
                  <span className="text-white/60 text-sm">Pressure</span>
                </div>
                <div className="text-white text-2xl">{weatherData.pressure.toFixed(0)} hPa</div>
              </div>

              {}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-5 h-5 text-green-400" />
                  <span className="text-white/60 text-sm">Visibility</span>
                </div>
                <div className="text-white text-2xl">{weatherData.visibility.toFixed(1)} km</div>
              </div>

              {}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="w-5 h-5 text-orange-400" />
                  <span className="text-white/60 text-sm">UV Index</span>
                </div>
                <div className="text-white text-2xl">{weatherData.uvIndex.toFixed(1)}</div>
              </div>

              {}
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Umbrella className="w-5 h-5 text-indigo-400" />
                  <span className="text-white/60 text-sm">Precipitation</span>
                </div>
                <div className="text-white text-2xl">{weatherData.precipitation.toFixed(1)} mm</div>
              </div>
            </div>

            {}
            <div className="mt-6 pt-4 border-t border-white/10 text-center text-white/40 text-sm">
              Last updated: {new Date(weatherData.timestamp).toLocaleString()}
            </div>
          </div>
        )}

        {}
        {!weatherData && !loading && (
          <div className="px-8 py-12 text-center">
            <Cloud className="w-20 h-20 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">Enter a location to view weather data</p>
            <p className="text-white/40 text-sm mt-2">Try searching for cities like London, Tokyo, or New York</p>
          </div>
        )}

        {}
        {loading && (
          <div className="px-8 py-12 text-center">
            <div className="inline-block w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
            <p className="text-white/60">Fetching weather data...</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
