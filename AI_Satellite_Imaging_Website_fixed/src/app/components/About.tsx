import { motion } from 'motion/react';
import { Rocket, Target, Eye } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useState } from 'react';
import { SatelliteModal } from './SatelliteModal';

// Satellite data backend
const satelliteData = {
  missionControl: {
    id: 'sat-001',
    name: 'StarLink-4A Mission Satellite',
    type: 'Communication Satellite',
    orbit: 'Low Earth Orbit (LEO)',
    altitude: '550 km',
    speed: '27,400 km/h',
    launched: 'March 15, 2024',
    mission: 'Global broadband internet coverage and next-generation space communication infrastructure',
    status: 'Active',
    operator: 'SpaceX',
    country: 'United States',
    description: 'Advanced communication satellite equipped with phased-array antennas and laser inter-satellite links for high-speed data transmission. Part of the next-generation constellation providing global internet coverage with ultra-low latency.'
  },
  precisionTracking: {
    id: 'sat-003',
    name: 'NaviStar GPS-III Explorer',
    type: 'Navigation & Positioning',
    orbit: 'Medium Earth Orbit (MEO)',
    altitude: '20,200 km',
    speed: '14,000 km/h',
    launched: 'November 22, 2023',
    mission: 'Ultra-precise global positioning and navigation services with advanced anti-jamming capabilities',
    status: 'Active',
    operator: 'U.S. Space Force',
    country: 'United States',
    description: 'Next-generation GPS satellite featuring atomic clock precision timing, enhanced signal strength, and improved accuracy. Provides sub-meter positioning accuracy for critical infrastructure, aviation, and scientific applications worldwide.'
  },
  orbitalWatch: {
    id: 'sat-002',
    name: 'Sentinel-2A Earth Observer',
    type: 'Earth Observation Satellite',
    orbit: 'Sun-Synchronous Orbit (SSO)',
    altitude: '786 km',
    speed: '26,800 km/h',
    launched: 'June 23, 2015',
    mission: 'High-resolution multispectral imaging for land monitoring, agriculture, forestry, and disaster response',
    status: 'Active',
    operator: 'ESA (European Space Agency)',
    country: 'European Union',
    description: 'Sentinel-2A delivers 10-meter resolution optical imagery across 13 spectral bands, covering the full Earth every 10 days. Its data powers AI-driven environmental monitoring — detecting deforestation, wildfires, flood extent, and urban growth in near real-time.'
  }
};

export function About() {
  const { t } = useLanguage();
  const [selectedSatellite, setSelectedSatellite] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const features = [
    {
      icon: Rocket,
      titleKey: 'about.feature1.title',
      descKey: 'about.feature1.desc',
      satelliteKey: 'missionControl',
    },
    {
      icon: Target,
      titleKey: 'about.feature3.title',
      descKey: 'about.feature3.desc',
      satelliteKey: 'precisionTracking',
    },
    {
      icon: Eye,
      title: 'Orbital Watch',
      desc: '24/7 planetary surveillance using high-resolution multispectral imaging satellites for real-time environmental threat detection.',
      satelliteKey: 'orbitalWatch',
    },
  ];

  const handleCardClick = (satelliteKey: keyof typeof satelliteData) => {
    setSelectedSatellite(satelliteData[satelliteKey]);
    setIsModalOpen(true);
  };

  return (
    <>
      <section className="relative py-32 px-8" id="about">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6">
              <Rocket className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 text-sm">{t('about.badge')}</span>
            </div>
            <h2 className="text-white mb-6">{t('about.title')}</h2>
            <p className="text-white/70 max-w-3xl mx-auto text-lg">
              {t('about.description')}
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.satelliteKey}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                onClick={() => handleCardClick(feature.satelliteKey as keyof typeof satelliteData)}
                className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-cyan-500/30 transition-all duration-300 group cursor-pointer"
              >
                <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-white mb-2">
                  {'titleKey' in feature ? t(feature.titleKey) : feature.title}
                </h3>
                <p className="text-white/60 text-sm mb-4">
                  {'descKey' in feature ? t(feature.descKey) : feature.desc}
                </p>
                <div className="flex items-center gap-2 text-cyan-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>View Details</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Satellite Modal */}
      <SatelliteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        satellite={selectedSatellite}
      />
    </>
  );
}
