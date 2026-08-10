import { motion, AnimatePresence } from 'motion/react';
import { X, Satellite, Activity, Globe, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface SatelliteData {
  id: string;
  name: string;
  type: string;
  orbit: string;
  altitude: string;
  speed: string;
  launched: string;
  mission: string;
  status: string;
  operator: string;
  country: string;
  description: string;
}

interface SatelliteModalProps {
  isOpen: boolean;
  onClose: () => void;
  satellite: SatelliteData | null;
}

export function SatelliteModal({ isOpen, onClose, satellite }: SatelliteModalProps) {
  const { t } = useLanguage();

  if (!satellite) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
            onClick={onClose}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-gradient-to-br from-slate-900/95 via-blue-900/90 to-slate-900/95 border border-white/20 rounded-3xl shadow-2xl"
            >
              {}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all duration-300 group z-10"
              >
                <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
              </button>

              {}
              <div className="p-8 md:p-12">
                {}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Satellite className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-white mb-1">{satellite.name}</h2>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-xs">
                          {satellite.status}
                        </span>
                        <span className="text-white/60 text-sm">{satellite.type}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-white/70 text-lg leading-relaxed">{satellite.description}</p>
                </div>

                {}
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  {}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-cyan-500/30 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-cyan-400" />
                      </div>
                      <span className="text-white/60 text-sm">{t('satellite.modal.orbit')}</span>
                    </div>
                    <p className="text-white text-xl">{satellite.orbit}</p>
                  </motion.div>

                  {}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-cyan-500/30 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Activity className="w-5 h-5 text-blue-400" />
                      </div>
                      <span className="text-white/60 text-sm">{t('satellite.modal.altitude')}</span>
                    </div>
                    <p className="text-white text-xl">{satellite.altitude}</p>
                  </motion.div>

                  {}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-cyan-500/30 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-purple-400" />
                      </div>
                      <span className="text-white/60 text-sm">{t('satellite.modal.speed')}</span>
                    </div>
                    <p className="text-white text-xl">{satellite.speed}</p>
                  </motion.div>

                  {}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-cyan-500/30 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-orange-400">🚀</span>
                      </div>
                      <span className="text-white/60 text-sm">{t('satellite.modal.launched')}</span>
                    </div>
                    <p className="text-white text-xl">{satellite.launched}</p>
                  </motion.div>
                </div>

                {}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="backdrop-blur-md bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-2xl p-6"
                >
                  <h3 className="text-white mb-4">Mission Details</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <span className="text-white/60 text-sm block mb-2">{t('satellite.modal.mission')}</span>
                      <p className="text-white">{satellite.mission}</p>
                    </div>
                    <div>
                      <span className="text-white/60 text-sm block mb-2">{t('satellite.modal.operator')}</span>
                      <p className="text-white">{satellite.operator}</p>
                    </div>
                    <div>
                      <span className="text-white/60 text-sm block mb-2">{t('satellite.modal.country')}</span>
                      <p className="text-white">{satellite.country}</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
