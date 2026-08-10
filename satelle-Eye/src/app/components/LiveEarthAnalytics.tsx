import { motion } from 'motion/react';
import { Satellite, AlertTriangle, Flame, Cloud } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useLanguage } from '../context/LanguageContext';

export function LiveEarthAnalytics() {
  const { t } = useLanguage();

  const features = [
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      label: 'Deforestation',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
    {
      icon: <Flame className="w-6 h-6" />,
      label: 'Wildfire',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
    },
    {
      icon: <Cloud className="w-6 h-6" />,
      label: 'Cloud Cover',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
  ];

  return (
    <section className="relative py-32 px-8" id="analytics">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
            <Satellite className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm">{t('analytics.badge')}</span>
          </div>
          <h2 className="text-white mb-4">{t('analytics.title')}</h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            {t('analytics.description')}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative group"
          >
            <div className="relative overflow-hidden rounded-3xl backdrop-blur-md bg-white/5 border border-white/10 p-6 hover:border-blue-500/30 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative rounded-2xl overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1686005232385-831dac1d0458?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWZvcmVzdGF0aW9uJTIwYWVyaWFsJTIwdmlld3xlbnwxfHx8fDE3NjQ0OTMxMDB8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Satellite imagery"
                  className="w-full h-[400px] object-cover"
                />
                
                {}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.label}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                      viewport={{ once: true }}
                      className={`flex items-center gap-2 px-3 py-2 backdrop-blur-md ${feature.bgColor} border border-white/20 rounded-lg`}
                    >
                      <span className={feature.color}>{feature.icon}</span>
                      <span className="text-white text-sm">{feature.label}</span>
                    </motion.div>
                  ))}
                </div>

                {}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1 }}
                  viewport={{ once: true }}
                  className="absolute top-1/4 right-1/3 w-3 h-3 bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.6)]"
                >
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping" />
                </motion.div>

                {}
                <div className="absolute bottom-4 left-4 right-4 backdrop-blur-md bg-black/40 border border-white/20 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-red-400 text-sm mb-1">{t('analytics.overlay1')}</div>
                      <div className="text-white/60 text-xs">{t('analytics.overlay2')}</div>
                    </div>
                    <div className="text-white/60 text-xs">{t('analytics.overlay3')}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid gap-6"
          >
            {[
              {
                titleKey: 'analytics.card1.title',
                valueKey: 'analytics.card1.value',
                trend: 'stable',
                icon: '🌲',
              },
              {
                titleKey: 'analytics.card2.title',
                valueKey: 'analytics.card2.value',
                trend: 'up',
                icon: '🏙️',
              },
              {
                titleKey: 'analytics.card3.title',
                valueKey: 'analytics.card3.value',
                trend: 'monitored',
                icon: '💧',
              },
            ].map((item, index) => (
              <motion.div
                key={item.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                viewport={{ once: true }}
                className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{item.icon}</span>
                  <div
                    className={`px-3 py-1 rounded-full text-xs ${
                      item.trend === 'up'
                        ? 'bg-green-500/20 text-green-400'
                        : item.trend === 'stable'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {item.trend === 'up' ? '↑' : item.trend === 'stable' ? '→' : '○'}
                  </div>
                </div>
                <div className="text-white mb-1">{t(item.valueKey)}</div>
                <p className="text-white/60 text-sm">{t(item.titleKey)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}