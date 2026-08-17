import { motion } from 'motion/react';
import { X, Satellite, Radio, Globe2, Zap, Clock, TrendingUp, Orbit, Activity, Gauge, Antenna, Navigation } from 'lucide-react';

interface SatelliteDetailModalProps {
  satellite: {
    id: string;
    name: string;
    lat: number;
    lon: number;
    alt: number;
    speed: number;
    operator: string;
    purpose: string;
    band: string;
    aos?: string;
    los?: string;
    azimuth?: number;
    elevation?: number;
    distance?: number;
  };
  onClose: () => void;
}

export function SatelliteDetailModal({ satellite, onClose }: SatelliteDetailModalProps) {
  // Calculate orbital period (simplified Kepler's third law)
  const orbitalPeriod = 2 * Math.PI * Math.sqrt(Math.pow((satellite.alt + 6371), 3) / 398600.4418);
  const periodMinutes = Math.round(orbitalPeriod / 60);
  
  // Calculate coverage area
  const coverageRadius = Math.sqrt(Math.pow(satellite.alt + 6371, 2) - Math.pow(6371, 2));
  const coverageArea = Math.PI * Math.pow(coverageRadius, 2);
  
  // Determine orbital classification
  let orbitType = '';
  if (satellite.alt < 2000) orbitType = 'LEO (Low Earth Orbit)';
  else if (satellite.alt < 35786) orbitType = 'MEO (Medium Earth Orbit)';
  else orbitType = 'GEO (Geostationary Orbit)';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        transition={{ type: 'spring', damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl w-full backdrop-blur-md bg-gradient-to-br from-slate-900/95 to-black/95 border-2 border-cyan-400/30 rounded-3xl shadow-2xl overflow-hidden"
        style={{
          boxShadow: '0 0 80px rgba(6, 182, 212, 0.4), 0 0 40px rgba(6, 182, 212, 0.2)'
        }}
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(6, 182, 212, 0.3) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 z-10 backdrop-blur-sm"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header with Satellite Icon */}
        <div className="relative bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 border-b border-cyan-400/30 p-8">
          <div className="flex items-start gap-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="p-4 bg-gradient-to-br from-cyan-500/30 to-blue-600/30 rounded-2xl backdrop-blur-sm border border-cyan-400/50"
              style={{
                boxShadow: '0 0 30px rgba(6, 182, 212, 0.3)'
              }}
            >
              <Satellite className="w-12 h-12 text-cyan-400" />
            </motion.div>
            <div className="flex-1">
              <h2 className="text-white text-3xl mb-2">{satellite.name}</h2>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/50 text-cyan-400 rounded-full text-sm">
                  {orbitType}
                </span>
                <span className="px-3 py-1 bg-green-500/20 border border-green-400/50 text-green-400 rounded-full text-sm flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  Active
                </span>
                <span className="text-white/60 text-sm">NORAD ID: {satellite.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative p-8 max-h-[70vh] overflow-y-auto">
          {/* Mission Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="backdrop-blur-md bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 text-cyan-400 mb-3">
                <Globe2 className="w-5 h-5" />
                <span className="text-sm uppercase tracking-wide">Operator</span>
              </div>
              <div className="text-white text-xl">{satellite.operator}</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="backdrop-blur-md bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 text-purple-400 mb-3">
                <Zap className="w-5 h-5" />
                <span className="text-sm uppercase tracking-wide">Mission Purpose</span>
              </div>
              <div className="text-white text-xl">{satellite.purpose}</div>
            </motion.div>
          </div>

          {/* Communications & Technical Specs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="backdrop-blur-md bg-gradient-to-br from-orange-500/10 to-red-500/10 border-2 border-orange-400/40 rounded-2xl p-6 mb-6"
          >
            <h3 className="text-orange-400 text-xl mb-4 flex items-center gap-2">
              <Antenna className="w-6 h-6" />
              Communications & Technical Specifications
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-white/60 text-xs uppercase tracking-wide mb-1">Frequency Band</div>
                <div className="text-orange-300 text-2xl">{satellite.band}</div>
              </div>
              <div>
                <div className="text-white/60 text-xs uppercase tracking-wide mb-1">Orbital Period</div>
                <div className="text-white text-lg">{periodMinutes} min</div>
              </div>
              <div>
                <div className="text-white/60 text-xs uppercase tracking-wide mb-1">Coverage Area</div>
                <div className="text-white text-lg">{(coverageArea / 1000000).toFixed(1)}M km²</div>
              </div>
              <div>
                <div className="text-white/60 text-xs uppercase tracking-wide mb-1">Velocity</div>
                <div className="text-white text-lg">{satellite.speed.toFixed(2)} km/s</div>
              </div>
            </div>
          </motion.div>

          {/* Real-Time Orbital Parameters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="backdrop-blur-md bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-400/40 rounded-2xl p-6 mb-6"
          >
            <h3 className="text-green-400 text-xl mb-4 flex items-center gap-2">
              <Navigation className="w-6 h-6" />
              Real-Time Orbital Position
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-white/60 text-sm mb-2">Latitude</div>
                <div className="text-4xl text-green-400 font-mono mb-1">{satellite.lat.toFixed(4)}°</div>
                <div className="text-xs text-white/40">{satellite.lat >= 0 ? 'North' : 'South'}</div>
              </div>
              <div className="text-center">
                <div className="text-white/60 text-sm mb-2">Longitude</div>
                <div className="text-4xl text-green-400 font-mono mb-1">{satellite.lon.toFixed(4)}°</div>
                <div className="text-xs text-white/40">{satellite.lon >= 0 ? 'East' : 'West'}</div>
              </div>
              <div className="text-center">
                <div className="text-white/60 text-sm mb-2">Altitude</div>
                <div className="text-4xl text-cyan-400 font-mono mb-1">{satellite.alt.toFixed(0)}</div>
                <div className="text-xs text-white/40">kilometers</div>
              </div>
            </div>
          </motion.div>

          {/* Tracking Data */}
          {satellite.azimuth !== undefined && satellite.elevation !== undefined && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="backdrop-blur-md bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-400/30 rounded-2xl p-6 mb-6"
            >
              <h3 className="text-blue-400 text-xl mb-4 flex items-center gap-2">
                <Gauge className="w-6 h-6" />
                Ground Station Tracking Data
              </h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="backdrop-blur-sm bg-white/5 rounded-xl p-4">
                  <div className="text-white/60 text-sm mb-2">Azimuth</div>
                  <div className="text-3xl text-blue-400 font-mono">{satellite.azimuth.toFixed(2)}°</div>
                </div>
                <div className="backdrop-blur-sm bg-white/5 rounded-xl p-4">
                  <div className="text-white/60 text-sm mb-2">Elevation</div>
                  <div className="text-3xl text-blue-400 font-mono">{satellite.elevation.toFixed(2)}°</div>
                </div>
                {satellite.distance && (
                  <div className="backdrop-blur-sm bg-white/5 rounded-xl p-4">
                    <div className="text-white/60 text-sm mb-2">Range</div>
                    <div className="text-2xl text-blue-400 font-mono">{satellite.distance.toLocaleString()} km</div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Pass Times */}
          {satellite.aos && satellite.los && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="backdrop-blur-md bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-400/30 rounded-2xl p-6"
            >
              <h3 className="text-yellow-400 text-xl mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6" />
                Next Pass Schedule
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="backdrop-blur-sm bg-white/5 rounded-xl p-4">
                  <div className="text-yellow-400 text-sm mb-2 uppercase tracking-wide">AOS (Acquisition of Signal)</div>
                  <div className="text-white text-lg font-mono">{satellite.aos}</div>
                </div>
                <div className="backdrop-blur-sm bg-white/5 rounded-xl p-4">
                  <div className="text-pink-400 text-sm mb-2 uppercase tracking-wide">LOS (Loss of Signal)</div>
                  <div className="text-white text-lg font-mono">{satellite.los}</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="relative bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-t border-cyan-400/30 px-8 py-4">
          <div className="flex items-center justify-between">
            <p className="text-white/40 text-xs">
              Data provided by N2YO Satellite Tracking API • Updated in real-time
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-xs">Live Tracking Active</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}