import { Rocket, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useState } from 'react';

interface NavigationProps {
  onOpenWeather?: () => void;
  onOpenAboutDetail?: () => void;
}

export function Navigation({ onOpenWeather, onOpenAboutDetail }: NavigationProps) {
  const { language, setLanguage, t } = useLanguage();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  const navItems = [
    { key: 'about', action: 'about' },
    { key: 'weather', action: 'weather' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl px-8 py-4 shadow-2xl">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Rocket className="w-6 h-6 text-blue-400" />
            <span className="tracking-wider text-white">SATELL-EYE</span>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  if (item.action === 'weather' && onOpenWeather) {
                    onOpenWeather();
                  } else if (item.action === 'about' && onOpenAboutDetail) {
                    onOpenAboutDetail();
                  }
                }}
                className="text-white/80 hover:text-white transition-colors duration-300 relative group"
              >
                {t(`nav.${item.key}`)}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300" />
              </button>
            ))}

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-300 relative group"
              >
                <Globe className="w-4 h-4" />
                {currentLanguage?.flag} {currentLanguage?.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300" />
              </button>

              {/* Language Dropdown */}
              {showLanguageMenu && (
                <div className="absolute top-full right-0 mt-2 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl overflow-hidden min-w-[180px] shadow-2xl">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as any);
                        setShowLanguageMenu(false);
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all duration-200 ${
                        language === lang.code
                          ? 'bg-blue-500/20 text-white'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}