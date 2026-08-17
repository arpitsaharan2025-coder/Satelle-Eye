import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Satellite, Radio, Globe2, Clock, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { GlobalDetectionMapEnhanced } from './GlobalDetectionMapEnhanced';
import { AIAnalysisEnhanced } from './AIAnalysisEnhanced';
import { RotatingEarth } from './RotatingEarth';
import { SatelliteDetailModal } from './SatelliteDetailModal';
import { SpaceBackground } from './SpaceBackground';
import { getAllSatelliteData, SATELLITE_IDS } from '../services/n2yoService';

interface SatelliteData {
  id: string;
  lat: number;
  lon: number;
  alt: number;
  aos: string;
  los: string;
  distance: number;
  speed: number;
  frequency: string;
  mission: string;
  operator: string;
  purpose: string;
  band: string;
}

interface DashboardProps {
  onClose: () => void;
}

export function Dashboard({ onClose }: DashboardProps) {
  const { t } = useLanguage();
  const [selectedMode, setSelectedMode] = useState('Satellites');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [satellites, setSatellites] = useState<SatelliteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSatellite, setSelectedSatellite] = useState<SatelliteData | null>(null);
  const mapCanvasRef = useRef<HTMLCanvasElement>(null);
  const satellitePositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  const modes = ['Satellites', 'Global Detection', 'AI Analysis'];
  
  // Satellite metadata
  const satelliteMetadata: Record<string, { operator: string; purpose: string; band: string }> = {
    'ISS (ZARYA)': { operator: 'NASA/Roscosmos', purpose: 'Space station and research', band: 'VHF/UHF' },
    'TIANGONG': { operator: 'CNSA', purpose: 'Chinese space station', band: 'S-band' },
    'GPS BIIR-2  (PRN 13)': { operator: 'US Air Force', purpose: 'Navigation', band: 'L-band' },
    'GPS BIIR-8  (PRN 16)': { operator: 'US Air Force', purpose: 'Navigation', band: 'L-band' },
    'GALILEO-FM3': { operator: 'ESA', purpose: 'Navigation', band: 'L-band' },
    'GALILEO-FM4': { operator: 'ESA', purpose: 'Navigation', band: 'L-band' },
    'GLONASS-M 759': { operator: 'Roscosmos', purpose: 'Navigation', band: 'L-band' },
    'BEIDOU 3M9': { operator: 'CNSA', purpose: 'Navigation', band: 'L-band' },
    'IRIDIUM 33': { operator: 'Iridium Communications', purpose: 'Mobile communications', band: 'L-band' },
    'IRIDIUM 117': { operator: 'Iridium Communications', purpose: 'Mobile communications', band: 'L-band' },
    'IRIDIUM 120': { operator: 'Iridium Communications', purpose: 'Mobile communications', band: 'L-band' },
    'STARLINK-1007': { operator: 'SpaceX', purpose: 'Internet constellation', band: 'Ku/Ka-band' },
    'STARLINK-1008': { operator: 'SpaceX', purpose: 'Internet constellation', band: 'Ku/Ka-band' },
    'STARLINK-1600': { operator: 'SpaceX', purpose: 'Internet constellation', band: 'Ku/Ka-band' },
    'STARLINK-1843': { operator: 'SpaceX', purpose: 'Internet constellation', band: 'Ku/Ka-band' },
    'STARLINK-2182': { operator: 'SpaceX', purpose: 'Internet constellation', band: 'Ku/Ka-band' },
    'INTELSAT 901': { operator: 'Intelsat', purpose: 'Communications', band: 'C/Ku-band' },
    'SES-12': { operator: 'SES S.A.', purpose: 'Communications', band: 'Ku-band' },
    'LANDSAT 8': { operator: 'NASA/USGS', purpose: 'Earth observation', band: 'X-band' },
    'LANDSAT 9': { operator: 'NASA/USGS', purpose: 'Earth observation', band: 'X-band' },
    'SENTINEL-1A': { operator: 'ESA', purpose: 'Earth observation (SAR)', band: 'C-band' },
    'SENTINEL-2A': { operator: 'ESA', purpose: 'Earth observation (optical)', band: 'X-band' },
    'SENTINEL-3A': { operator: 'ESA', purpose: 'Earth observation (ocean)', band: 'X-band' },
    'TERRA': { operator: 'NASA', purpose: 'Earth observation', band: 'X-band' },
    'AQUA': { operator: 'NASA', purpose: 'Earth observation', band: 'X-band' },
    'NOAA 19': { operator: 'NOAA', purpose: 'Weather monitoring', band: 'L-band' },
    'NOAA 20': { operator: 'NOAA', purpose: 'Weather monitoring', band: 'X-band' },
    'SUOMI NPP': { operator: 'NASA/NOAA', purpose: 'Weather and climate', band: 'X-band' },
    'GOES 16': { operator: 'NOAA', purpose: 'Geostationary weather', band: 'L-band' },
    'GOES 17': { operator: 'NOAA', purpose: 'Geostationary weather', band: 'L-band' },
    'METOP-B': { operator: 'EUMETSAT', purpose: 'Weather monitoring', band: 'L-band' },
    'METOP-C': { operator: 'EUMETSAT', purpose: 'Weather monitoring', band: 'L-band' },
    'HIMAWARI-8': { operator: 'JMA', purpose: 'Geostationary weather', band: 'L-band' },
    'HUBBLE SPACE TELESCOPE': { operator: 'NASA/ESA', purpose: 'Space telescope', band: 'S-band' },
    'CHANDRA X-RAY OBSERVATORY': { operator: 'NASA', purpose: 'X-ray telescope', band: 'S-band' },
    'JAMES WEBB SPACE TELESCOPE': { operator: 'NASA/ESA/CSA', purpose: 'Infrared space telescope', band: 'Ka-band' },
    'SMOS': { operator: 'ESA', purpose: 'Soil moisture and ocean salinity', band: 'L-band' },
    'SWOT': { operator: 'NASA/CNES', purpose: 'Surface water and ocean topography', band: 'Ka-band' },
    'VO-96': { operator: 'AMSAT', purpose: 'Amateur radio communication', band: 'VHF/UHF' },
    'HO-68': { operator: 'AMSAT', purpose: 'Amateur radio communication', band: 'UHF' },
    'VO-52': { operator: 'ISRO/AMSAT', purpose: 'Amateur radio (HAMSAT)', band: 'VHF/UHF' },
    'AO-91': { operator: 'AMSAT', purpose: 'Amateur radio communication', band: 'VHF/UHF' },
    'AO-92': { operator: 'AMSAT', purpose: 'Amateur radio communication', band: 'VHF/UHF' },
    'SO-50': { operator: 'AMSAT', purpose: 'Amateur radio communication', band: 'VHF/UHF' },
    'LEMUR 2 PETER-JOHN': { operator: 'Spire Global', purpose: 'AIS/ADS-B tracking', band: 'VHF/UHF' },
    'FLOCK 4E-1': { operator: 'Planet Labs', purpose: 'Earth imaging CubeSat', band: 'S-band' },
    'PLANET 1': { operator: 'Planet Labs', purpose: 'Earth imaging', band: 'X-band' },
  };

  // Update time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch satellite data
  useEffect(() => {
    const fetchSatelliteData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllSatelliteData();
        
        // Transform the data into our format
        const transformedData: SatelliteData[] = data.map((sat: any) => {
          const metadata = satelliteMetadata[sat.name] || {
            operator: 'Unknown',
            purpose: 'Unknown',
            band: 'Unknown'
          };
          
          const position = sat.position;
          const nextPass = sat.passes && sat.passes[0];
          
          return {
            id: sat.name,
            lat: position.satlatitude,
            lon: position.satlongitude,
            alt: position.sataltitude,
            aos: nextPass ? new Date(nextPass.startUTC * 1000).toISOString().replace('T', ' ').split('.')[0] : 'N/A',
            los: nextPass ? new Date(nextPass.endUTC * 1000).toISOString().replace('T', ' ').split('.')[0] : 'N/A',
            distance: Math.round(position.sataltitude + 6371), // Distance from center of Earth
            speed: 7.8, // Average orbital speed in km/s
            frequency: `${position.azimuth.toFixed(2)}°`,
            mission: sat.name,
            operator: metadata.operator,
            purpose: metadata.purpose,
            band: metadata.band
          };
        });
        
        setSatellites(transformedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching satellite data:', err);
        setError('Failed to fetch real-time satellite data. Please check your API key.');
        setLoading(false);
      }
    };

    fetchSatelliteData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchSatelliteData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Draw world map with orbits
  useEffect(() => {
    const canvas = mapCanvasRef.current;
    if (!canvas || satellites.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let animationFrame: number;

    const drawMap = (time: number) => {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;

      // Latitude lines
      for (let lat = -90; lat <= 90; lat += 15) {
        ctx.beginPath();
        const y = ((90 - lat) / 180) * canvas.height;
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Longitude lines
      for (let lon = -180; lon <= 180; lon += 30) {
        ctx.beginPath();
        const x = ((lon + 180) / 360) * canvas.width;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Draw satellite orbits
      satellites.forEach((sat, index) => {
        const x = ((sat.lon + 180) / 360) * canvas.width;
        const y = ((90 - sat.lat) / 180) * canvas.height;

        // Coverage cone
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 120);
        const hue = index % 3 === 0 ? 280 : index % 3 === 1 ? 200 : 60;
        gradient.addColorStop(0, `hsla(${hue}, 80%, 60%, 0.3)`);
        gradient.addColorStop(0.5, `hsla(${hue}, 70%, 50%, 0.15)`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 120, 0, Math.PI * 2);
        ctx.fill();

        // Orbit path (ellipse)
        ctx.strokeStyle = `hsla(${hue}, 70%, 60%, 0.4)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x, y, 200, 80, (time * 0.0001 + index) * Math.PI, 0, Math.PI * 2);
        ctx.stroke();

        // Satellite marker
        ctx.fillStyle = '#00ffff';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ffff';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = '11px Inter, sans-serif';
        ctx.fillText(sat.id, x + 8, y - 8);

        // Store satellite position for detail modal
        satellitePositionsRef.current.set(sat.id, { x, y });
      });

      animationFrame = requestAnimationFrame(drawMap);
    };

    drawMap(0);
    return () => cancelAnimationFrame(animationFrame);
  }, [satellites]);

  // Prepare satellites for RotatingEarth component
  const earthSatellites = satellites.map((sat, index) => ({
    name: sat.id,
    lat: sat.lat,
    lon: sat.lon,
    alt: sat.alt,
    color: index % 3 === 0 ? '#ff00ff' : index % 3 === 1 ? '#00ffff' : '#ffff00'
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black overflow-auto"
    >
      <SpaceBackground />

      <div className="min-h-screen p-6 relative z-10">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white/60">
              <Clock className="w-4 h-4" />
              <span>{currentTime.toISOString().split('T')[0]}</span>
              <span>{currentTime.toTimeString().split(' ')[0]}</span>
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-cyan-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading satellite data...</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {modes.map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  selectedMode === mode
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/50'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {mode}
              </button>
            ))}
            
            <button
              onClick={onClose}
              className="ml-4 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 backdrop-blur-md bg-red-500/10 border border-red-400/30 rounded-2xl p-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Main Grid */}
        {selectedMode === 'Satellites' && (
          <div className="grid grid-cols-3 gap-6">
            {/* Map Section - Spans 2 columns */}
            <div className="col-span-2 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white flex items-center gap-2">
                  <Globe2 className="w-5 h-5 text-cyan-400" />
                  Global Satellite Tracking Map
                </h3>
                {satellites.length > 0 && (
                  <span className="text-green-400 text-sm animate-pulse">● Live Satellite Tracking</span>
                )}
              </div>
              <canvas
                ref={mapCanvasRef}
                className="w-full h-[400px] rounded-lg cursor-pointer"
                onClick={(e) => {
                  const canvas = mapCanvasRef.current;
                  if (!canvas) return;
                  
                  const rect = canvas.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const clickY = e.clientY - rect.top;
                  
                  // Check if click is near any satellite
                  for (const sat of satellites) {
                    const pos = satellitePositionsRef.current.get(sat.id);
                    if (!pos) continue;
                    
                    const distance = Math.sqrt(
                      Math.pow(clickX - pos.x, 2) + Math.pow(clickY - pos.y, 2)
                    );
                    
                    // If click is within 20 pixels of satellite, show modal
                    if (distance < 20) {
                      setSelectedSatellite(sat);
                      return;
                    }
                  }
                }}
              />
            </div>

            {/* 3D Earth Orbit Visualization */}
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white">Orbit Visualization</h3>
                <Radio className="w-5 h-5 text-pink-400" />
              </div>
              <div className="w-full h-[340px]">
                {satellites.length > 0 ? (
                  <RotatingEarth 
                    satellites={earthSatellites} 
                    width={340} 
                    height={340}
                    onSatelliteClick={(clickedSat) => {
                      // Find the full satellite data
                      const fullSatData = satellites.find(s => s.id === clickedSat.name);
                      if (fullSatData) {
                        setSelectedSatellite(fullSatData);
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Satellite Table - Full Width */}
            <div className="col-span-3 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="px-6 py-4 border-b border-white/10">
                <h3 className="text-white flex items-center gap-2">
                  <Satellite className="w-5 h-5 text-cyan-400" />
                  Real-Time Satellite Data
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-6 py-3 text-left text-white/60 text-sm">ID</th>
                        <th className="px-6 py-3 text-left text-white/60 text-sm">Coordinates</th>
                        <th className="px-6 py-3 text-left text-white/60 text-sm">Altitude</th>
                        <th className="px-6 py-3 text-left text-white/60 text-sm">Next AOS</th>
                        <th className="px-6 py-3 text-left text-white/60 text-sm">Next LOS</th>
                        <th className="px-6 py-3 text-left text-white/60 text-sm">Distance</th>
                        <th className="px-6 py-3 text-left text-white/60 text-sm">Speed</th>
                        <th className="px-6 py-3 text-left text-white/60 text-sm">Azimuth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {satellites.map((sat) => (
                        <tr
                          key={sat.id}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200 cursor-pointer"
                          onClick={() => setSelectedSatellite(sat)}
                        >
                          <td className="px-6 py-4 text-cyan-400">{sat.id}</td>
                          <td className="px-6 py-4 text-white/80">
                            {`${sat.lat.toFixed(2)}°, ${sat.lon.toFixed(2)}°`}
                          </td>
                          <td className="px-6 py-4 text-white/80">{sat.alt.toFixed(0)} km</td>
                          <td className="px-6 py-4 text-white/80 text-sm">{sat.aos}</td>
                          <td className="px-6 py-4 text-pink-400 text-sm">{sat.los}</td>
                          <td className="px-6 py-4 text-white/80">{sat.distance.toLocaleString()} km</td>
                          <td className="px-6 py-4 text-white/80">{sat.speed} km/s</td>
                          <td className="px-6 py-4 text-white/80">{sat.frequency}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Satellite Details Card */}
            {selectedSatellite && (
              <div className="col-span-3 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl">
                <h3 className="text-white mb-4">Satellite Mission Details - {selectedSatellite.mission}</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <div className="text-white/60 text-sm mb-1">Mission</div>
                    <div className="text-white">{selectedSatellite.mission}</div>
                  </div>
                  <div>
                    <div className="text-white/60 text-sm mb-1">Operator</div>
                    <div className="text-white/80 text-sm">{selectedSatellite.operator}</div>
                  </div>
                  <div>
                    <div className="text-white/60 text-sm mb-1">Purpose</div>
                    <div className="text-white/80 text-sm">{selectedSatellite.purpose}</div>
                  </div>
                  <div>
                    <div className="text-white/60 text-sm mb-1">Frequency Band</div>
                    <div className="text-cyan-400">{selectedSatellite.band}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedMode === 'Global Detection' && (
          <div className="space-y-6">
            <GlobalDetectionMapEnhanced onNavigateToAIAnalysis={() => setSelectedMode('AI Analysis')} />
          </div>
        )}
        
        {selectedMode === 'AI Analysis' && <AIAnalysisEnhanced />}
      </div>

      {/* Satellite Detail Modal */}
      <AnimatePresence>
        {selectedSatellite && (
          <SatelliteDetailModal
            satellite={{
              id: selectedSatellite.id,
              name: selectedSatellite.id,
              lat: selectedSatellite.lat,
              lon: selectedSatellite.lon,
              alt: selectedSatellite.alt,
              speed: selectedSatellite.speed,
              operator: selectedSatellite.operator,
              purpose: selectedSatellite.purpose,
              band: selectedSatellite.band,
              aos: selectedSatellite.aos,
              los: selectedSatellite.los,
              azimuth: parseFloat(selectedSatellite.frequency),
              distance: selectedSatellite.distance,
            }}
            onClose={() => setSelectedSatellite(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}