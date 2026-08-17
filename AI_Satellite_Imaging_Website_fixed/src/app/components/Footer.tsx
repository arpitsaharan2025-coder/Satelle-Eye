import { Rocket } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="relative border-t border-white/10 py-20 px-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Brand Section */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-3 mb-6">
            <Rocket className="w-6 h-6 text-blue-400" />
            <span className="tracking-wider text-white">SATELL-EYE</span>
          </div>
          <p className="text-white/60 max-w-md">
            {t('footer.tagline')}
          </p>
        </div>
      </div>
    </footer>
  );
}