import { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Footer } from './components/Footer';
import { Dashboard } from './components/Dashboard';
import { WeatherPage } from './components/WeatherPage';
import { AboutDetailPage } from './components/AboutDetailPage';
import { SpaceBackground } from './components/SpaceBackground';

export default function App() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [showWeather, setShowWeather] = useState(false);
  const [showAboutDetail, setShowAboutDetail] = useState(false);

  return (
    <LanguageProvider>
      <div className="relative min-h-screen bg-black overflow-x-hidden">
        {showDashboard ? (
          <Dashboard onClose={() => setShowDashboard(false)} />
        ) : showWeather ? (
          <WeatherPage onClose={() => setShowWeather(false)} />
        ) : showAboutDetail ? (
          <AboutDetailPage onClose={() => setShowAboutDetail(false)} />
        ) : (
          <>
            <SpaceBackground />

            <div className="relative z-10">
              <Navigation
                onOpenWeather={() => setShowWeather(true)}
                onOpenAboutDetail={() => setShowAboutDetail(true)}
              />
              <Hero onLaunchMission={() => setShowDashboard(true)} />
              <About />
              <Footer />
            </div>
          </>
        )}
      </div>
    </LanguageProvider>
  );
}