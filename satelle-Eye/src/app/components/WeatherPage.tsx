import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { DashboardWeather } from './DashboardWeather';

interface WeatherPageProps {
  onClose: () => void;
}

export function WeatherPage({ onClose }: WeatherPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black overflow-auto"
    >
      <div className="min-h-screen p-6 relative z-10">
        {}
        <div className="flex items-center justify-between mb-6 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
          <div>
            <h2 className="text-white text-2xl mb-1">Global Weather System</h2>
            <p className="text-white/60 text-sm">Real-time weather data from around the world</p>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {}
        <DashboardWeather />
      </div>
    </motion.div>
  );
}