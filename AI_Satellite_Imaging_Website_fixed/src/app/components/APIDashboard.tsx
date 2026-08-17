import { useState } from 'react';
import { motion } from 'motion/react';
import { Key, Database, Satellite, Cloud, AlertCircle, Activity, CheckCircle, XCircle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface APIInfo {
  name: string;
  key: string;
  purpose: string;
  dataCollected: string[];
  bandwidth: string;
  rateLimit: string;
  status: 'active' | 'inactive' | 'limited';
  sampleImageUrl?: string;
}

export function APIDashboard() {
  const [selectedAPI, setSelectedAPI] = useState<string | null>(null);

  const apis: APIInfo[] = [
    {
      name: 'NASA API',
      key: 'O6aD9bKzImmqD7JCkz3rr6PphoXwWXX4KRo3tkcQ',
      purpose: 'Primary data source for satellite tracking, asteroid detection, and environmental monitoring',
      dataCollected: [
        'Near-Earth Objects (NeoWs) - Asteroid data, trajectories, and close approach information',
        'EONET (Earth Observatory Natural Event Tracker) - Real-time natural disasters',
        'Satellite imagery and positioning data',
        'Space weather and solar activity'
      ],
      bandwidth: '1,000 requests/hour',
      rateLimit: 'Hourly: 1000 requests',
      status: 'active',
      sampleImageUrl: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&q=80'
    },
    {
      name: 'NASA EONET API',
      key: 'No API key required - Public access',
      purpose: 'Earth Observatory Natural Event Tracker for real-time global natural disasters and phenomena',
      dataCollected: [
        'Real-time wildfires, volcanic eruptions, and severe storms',
        'Earthquakes, floods, landslides, and drought events',
        'Sea/lake ice changes and snow coverage',
        'Precise geographic coordinates (latitude/longitude) for all events',
        'Event magnitude, duration, and status (open/closed)',
        'Multi-source verification from NASA, USGS, NOAA, and other agencies',
        'Historical event tracking and temporal analysis'
      ],
      bandwidth: 'Unlimited - Designed for public + research use',
      rateLimit: 'No rate limit',
      status: 'active',
      sampleImageUrl: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800&q=80'
    },
    {
      name: 'OpenWeather API',
      key: '4d8bee2ec4090b05e8887a76c93100a6',
      purpose: 'Comprehensive weather data including current conditions, forecasts, and historical weather',
      dataCollected: [
        'Real-time temperature, humidity, pressure, wind speed and direction',
        'Weather conditions, visibility, and cloud cover',
        'Sunrise and sunset times',
        'UV index and precipitation data',
        'Hourly and daily weather forecasts'
      ],
      bandwidth: '1,000 requests/day (Free tier)',
      rateLimit: '60 calls/minute',
      status: 'active',
      sampleImageUrl: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800&q=80'
    },
    {
      name: 'WAQI (World Air Quality Index) API',
      key: '8df644515d45bc385a6bc12c09fb2bf1cdb35d5c',
      purpose: 'Real-time air quality monitoring with accurate US AQI measurements worldwide',
      dataCollected: [
        'US EPA standard Air Quality Index (AQI) - 0-500 scale',
        'PM2.5 and PM10 particulate matter concentrations',
        'Ozone (O₃), Nitrogen Dioxide (NO₂), Sulfur Dioxide (SO₂)',
        'Carbon Monoxide (CO) levels',
        'Health recommendations based on US AQI standards',
        'Data from 30,000+ air quality monitoring stations globally'
      ],
      bandwidth: 'Unlimited for free tier',
      rateLimit: 'No hard limit for standard usage',
      status: 'active',
      sampleImageUrl: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&q=80'
    },
    {
      name: 'N2YO Satellite Tracking API',
      key: 'RDJTES-3K95PU-PRCNVW-5M3Y',
      purpose: 'Real-time satellite position tracking, orbital predictions, and radio pass calculations',
      dataCollected: [
        'Live satellite positions (latitude, longitude, altitude)',
        'Satellite velocity vectors and orbital parameters',
        'Acquisition of Signal (AOS) and Loss of Signal (LOS) times',
        'Visual and radio pass predictions',
        'Two-Line Element (TLE) data for orbital mechanics',
        'Azimuth, elevation, and range data for ground station tracking',
        'Real-time tracking for VO-96, HO-68, VO-52 amateur radio satellites'
      ],
      bandwidth: '1,000 requests/hour',
      rateLimit: 'Hourly: 1000 requests',
      status: 'active',
      sampleImageUrl: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&q=80'
    },
    {
      name: 'IUCN Red List API',
      key: 'yi523xzBYisdpeGWFWrCKA5DaAFRquTXsyuu',
      purpose: 'Global biodiversity database providing comprehensive data on species conservation status worldwide',
      dataCollected: [
        'Species conservation status (Critically Endangered, Endangered, Vulnerable, etc.)',
        'Population trends and estimates for all assessed species',
        'Geographic distribution and habitat information by region/country',
        'Threat assessments (habitat loss, climate change, poaching, pollution)',
        'Conservation actions and protection measures',
        'Taxonomic classification and scientific names',
        'Country-specific biodiversity data and regional assessments',
        '157,000+ species assessments from global experts'
      ],
      bandwidth: '10,000 requests/day',
      rateLimit: 'No strict rate limit for research use',
      status: 'active',
      sampleImageUrl: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800&q=80'
    },
    {
      name: 'OpenStreetMap Nominatim',
      key: 'No API key required',
      purpose: 'Geocoding service for location search and coordinate conversion',
      dataCollected: [
        'Location coordinates (latitude/longitude) from city names',
        'Reverse geocoding for coordinate-to-address conversion',
        'Country and administrative region data',
        'Place names and geographical boundaries'
      ],
      bandwidth: '1 request/second',
      rateLimit: 'Maximum 1 request per second',
      status: 'active',
      sampleImageUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'inactive': return 'text-red-400';
      case 'limited': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-5 h-5" />;
      case 'inactive': return <XCircle className="w-5 h-5" />;
      case 'limited': return <AlertCircle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="backdrop-blur-md bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Key className="w-8 h-8 text-blue-400" />
          <div>
            <h3 className="text-white text-2xl">API Backend Dashboard</h3>
            <p className="text-white/60 text-sm">Data sources powering Satell-Eye platform</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-white/60 text-sm mb-1">Total APIs</div>
            <div className="text-white text-3xl">{apis.length}</div>
          </div>
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-white/60 text-sm mb-1">Active</div>
            <div className="text-green-400 text-3xl">{apis.filter(a => a.status === 'active').length}</div>
          </div>
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-white/60 text-sm mb-1">Data Points</div>
            <div className="text-cyan-400 text-3xl">20+</div>
          </div>
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-white/60 text-sm mb-1">Uptime</div>
            <div className="text-purple-400 text-3xl">99.9%</div>
          </div>
        </div>
      </div>

      {/* API Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {apis.map((api, index) => (
          <motion.div
            key={api.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedAPI(selectedAPI === api.name ? null : api.name)}
            className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 cursor-pointer hover:bg-white/10 hover:border-cyan-400/30 transition-all duration-300"
          >
            {/* API Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Database className="w-6 h-6 text-cyan-400" />
                  <h4 className="text-white text-xl">{api.name}</h4>
                </div>
                <p className="text-white/60 text-sm mb-3">{api.purpose}</p>
                
                {/* Status Badge */}
                <div className={`flex items-center gap-2 ${getStatusColor(api.status)}`}>
                  {getStatusIcon(api.status)}
                  <span className="text-sm capitalize">{api.status}</span>
                </div>
              </div>
            </div>

            {/* API Key Display */}
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-3 mb-4">
              <div className="text-white/60 text-xs mb-1">API Key</div>
              <div className="text-white/90 text-sm font-mono break-all">{api.key}</div>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="text-white/60 text-xs mb-1">Bandwidth</div>
                <div className="text-white text-sm">{api.bandwidth}</div>
              </div>
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="text-white/60 text-xs mb-1">Rate Limit</div>
                <div className="text-white text-sm">{api.rateLimit}</div>
              </div>
            </div>

            {/* Expanded Details */}
            {selectedAPI === api.name && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 pt-4 border-t border-white/10"
              >
                {/* Data Collected */}
                <div>
                  <div className="text-white mb-2 flex items-center gap-2">
                    <Satellite className="w-4 h-4 text-purple-400" />
                    <span className="text-sm">Data Collected</span>
                  </div>
                  <ul className="space-y-2">
                    {api.dataCollected.map((data, idx) => (
                      <li key={idx} className="text-white/80 text-sm flex items-start gap-2">
                        <span className="text-cyan-400 mt-1">•</span>
                        <span>{data}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Sample Satellite Image */}
                {api.sampleImageUrl && (
                  <div>
                    <div className="text-white mb-2 text-sm">Sample Data Visualization</div>
                    <div className="rounded-xl overflow-hidden border border-white/20">
                      <ImageWithFallback
                        src={api.sampleImageUrl}
                        alt={`${api.name} sample data`}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <p className="text-white/40 text-xs mt-2">
                      Representative imagery showing the type of data collected from {api.name}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Expand Indicator */}
            <div className="text-center mt-4">
              <span className="text-cyan-400 text-sm">
                {selectedAPI === api.name ? '▼ Click to collapse' : '▶ Click to expand details'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}