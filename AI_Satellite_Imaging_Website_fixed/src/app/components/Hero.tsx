import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HeroProps {
  onLaunchMission: () => void;
}

export function Hero({ onLaunchMission }: HeroProps) {
  const { t } = useLanguage();

  return (
    <div className="relative min-h-screen flex items-center justify-center px-8">
      {/* Content Container */}
      <div className="max-w-[1400px] w-full mx-auto pt-32 relative z-10">
        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-block mb-8"
          >
            <div className="px-6 py-2 backdrop-blur-md bg-white/5 border border-white/10 rounded-full">
              <span className="text-cyan-400 text-sm tracking-wider">
                {t('hero.badge')}
              </span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-white mb-6 tracking-tight"
          >
            {t('hero.title1')}
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              {t('hero.title2')}
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-white/70 max-w-2xl mx-auto mb-8 text-lg"
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="flex items-center justify-center gap-6 pt-8"
          >
            <button
              onClick={onLaunchMission}
              className="group relative px-8 py-4 bg-blue-500 text-white rounded-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                {t('hero.button')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}