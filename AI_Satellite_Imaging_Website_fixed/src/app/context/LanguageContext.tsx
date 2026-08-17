import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ja' | 'hi' | 'de' | 'ru' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.api': 'API',
    'nav.about': 'About',
    'nav.language': 'Language',
    'nav.weather': 'Weather',
    
    // Hero
    'hero.badge': '✨ AI-Powered Space Intelligence Platform',
    'hero.title1': 'Mission Control for the',
    'hero.title2': 'Next Generation',
    'hero.subtitle': 'Real-time satellite tracking, AI-powered Earth analytics, and global biodiversity monitoring. Experience the future of space intelligence.',
    'hero.button': 'Launch Mission',
    'hero.weather': 'Weather',
    'hero.stat1': { value: '2,847', label: 'Active Satellites' },
    'hero.stat2': { value: '99.9%', label: 'Uptime' },
    'hero.stat3': { value: 'Real-time', label: 'Data Processing' },
    
    // About
    'about.badge': 'About Satell-Eye',
    'about.title': 'The Future of Space Intelligence',
    'about.description': 'Satell-Eye combines cutting-edge technology with decades of aerospace expertise to provide unparalleled insights into orbital operations.',
    'about.feature1.title': 'Mission Control',
    'about.feature1.desc': 'Advanced satellite tracking and mission planning capabilities for next-generation space operations',
    'about.feature2.title': 'Multidisciplinary Project',
    'about.feature2.desc': 'Combining aerospace engineering, AI, data science, and orbital mechanics in one unified platform',
    'about.feature3.title': 'Precision Tracking',
    'about.feature3.desc': 'Real-time positioning with sub-meter accuracy for all orbital objects',
    
    // Satellite Details Modal
    'satellite.modal.title': 'Satellite Details',
    'satellite.modal.close': 'Close',
    'satellite.modal.name': 'Name',
    'satellite.modal.type': 'Type',
    'satellite.modal.orbit': 'Orbit',
    'satellite.modal.altitude': 'Altitude',
    'satellite.modal.speed': 'Speed',
    'satellite.modal.launched': 'Launched',
    'satellite.modal.mission': 'Mission',
    'satellite.modal.status': 'Status',
    'satellite.modal.operator': 'Operator',
    'satellite.modal.country': 'Country',
    
    // Footer
    'footer.tagline': 'Advanced Space Intelligence Platform',
    'footer.rights': 'All rights reserved.',
    
    // Dashboard
    'dashboard.location': 'CZH: Kabelvåg/Våttind, Denmark',
    'dashboard.mode.weather': 'Weather',
    'dashboard.mode.amateur': 'Amateur',
    'dashboard.mode.iss': 'ISS',
    'dashboard.mode.military': 'Military',
    'dashboard.orbit': 'Orbit Visualization',
    'dashboard.satellites': 'Satellites',
    'dashboard.table.id': 'ID',
    'dashboard.table.coordinates': 'Coordinates',
    'dashboard.table.aos': 'AOS',
    'dashboard.table.los': 'LOS',
    'dashboard.table.distance': 'Distance',
    'dashboard.table.speed': 'Speed',
    'dashboard.table.frequency': 'Frequency',
    'dashboard.signal': 'Live Signal Strength',
    'dashboard.vhf': 'VHF Level',
    'dashboard.uhf': 'UHF Level',
    'dashboard.snr': 'S/N Ratio',
    'dashboard.details': 'Satellite Details',
    'dashboard.mission': 'Mission',
    'dashboard.operator': 'Operator',
    'dashboard.purpose': 'Purpose',
    'dashboard.band': 'Frequency Band',
    'dashboard.leo': 'LEO Objects',
  },
  ja: {
    // Navigation
    'nav.api': 'API',
    'nav.about': '概要',
    'nav.language': '言語',
    'nav.weather': '気象',
    
    // Hero
    'hero.badge': '✨ AI駆動型宇宙情報プラットフォーム',
    'hero.title1': '次世代のための',
    'hero.title2': 'ミッションコントロール',
    'hero.subtitle': 'リアルタイム衛星追跡、AI駆動型地球分析、グローバルバイオダイバーシティ監視。宇宙情報の未来を体験してください。',
    'hero.button': 'ミッション開始',
    'hero.weather': '気象',
    'hero.stat1': { value: '2,847', label: '稼働中の衛星' },
    'hero.stat2': { value: '99.9%', label: '稼働率' },
    'hero.stat3': { value: 'リアルタイム', label: 'データ処理' },
    
    // About
    'about.badge': 'Satell-Eyeについて',
    'about.title': '宇宙情報の未来',
    'about.description': 'Satell-Eyeは、最先端技術と数十年の航空宇宙専門知識を組み合わせ、軌道運用に関する比類のない洞察を提供します。',
    'about.feature1.title': 'ミッションコントロール',
    'about.feature1.desc': '次世代宇宙運用のための高度な衛星追跡とミッション計画機能',
    'about.feature2.title': '学際的プロジェクト',
    'about.feature2.desc': '航空宇宙工学、AI、データサイエンス、軌道力学を統合したプラットフォーム',
    'about.feature3.title': '精密追跡',
    'about.feature3.desc': 'すべての軌道物体のサブメートル精度のリアルタイム位置特定',
    
    // Satellite Details Modal
    'satellite.modal.title': '衛星詳細',
    'satellite.modal.close': '閉じる',
    'satellite.modal.name': '名前',
    'satellite.modal.type': 'タイプ',
    'satellite.modal.orbit': '軌道',
    'satellite.modal.altitude': '高度',
    'satellite.modal.speed': '速度',
    'satellite.modal.launched': '打ち上げ',
    'satellite.modal.mission': 'ミッション',
    'satellite.modal.status': 'ステータス',
    'satellite.modal.operator': '運用者',
    'satellite.modal.country': '国',
    
    // Footer
    'footer.tagline': '高度な宇宙情報プラットフォーム',
    'footer.rights': '全著作権所有。',
    
    // Dashboard
    'dashboard.location': 'CZH: カーベルヴォーグ/ヴォッティン、デンマーク',
    'dashboard.mode.weather': '気象',
    'dashboard.mode.amateur': 'アマチュア',
    'dashboard.mode.iss': 'ISS',
    'dashboard.mode.military': '軍事',
    'dashboard.orbit': '軌道可視化',
    'dashboard.satellites': '衛星',
    'dashboard.table.id': 'ID',
    'dashboard.table.coordinates': '座標',
    'dashboard.table.aos': 'AOS',
    'dashboard.table.los': 'LOS',
    'dashboard.table.distance': '距離',
    'dashboard.table.speed': '速度',
    'dashboard.table.frequency': '周波数',
    'dashboard.signal': 'リアルタイム信号強度',
    'dashboard.vhf': 'VHFレベル',
    'dashboard.uhf': 'UHFレベル',
    'dashboard.snr': 'S/N比',
    'dashboard.details': '衛星詳細',
    'dashboard.mission': 'ミッション',
    'dashboard.operator': '運用者',
    'dashboard.purpose': '目的',
    'dashboard.band': '周波数帯',
    'dashboard.leo': 'LEO物体',
  },
  hi: {
    // Navigation
    'nav.api': 'API',
    'nav.about': 'परिचय',
    'nav.language': 'भाषा',
    'nav.weather': 'मौसम',
    
    // Hero
    'hero.badge': '✨ AI-संचालित अंतरिक्ष बुद्धिमत्ता प्लेटफॉर्म',
    'hero.title1': 'अगली पीढ़ी के लिए',
    'hero.title2': 'मिशन कंट्रोल',
    'hero.subtitle': 'रीयल-टाइम सैटेलाइट ट्रैकिंग, AI-संचालित पृथ्वी विश्लेषण, और ग्लोबल वायोडाइवर्सिटी निगरानी। अंतरिक्ष बुद्धिमत्ता के भविष्य का अनुभव करें।',
    'hero.button': 'मिशन शुरू करें',
    'hero.weather': 'मौसम',
    'hero.stat1': { value: '2,847', label: 'सक्रिय उपग्रह' },
    'hero.stat2': { value: '99.9%', label: 'अपटाइम' },
    'hero.stat3': { value: 'रीयल-टाइम', label: 'डेटा प्रोसेसिंग' },
    
    // About
    'about.badge': 'Satell-Eye के बारे में',
    'about.title': 'अंतरिक्ष बुद्धिमत्ता का भविष्य',
    'about.description': 'Satell-Eye अत्याधुनिक तकनीक को दशकों की एयरोस्पेस विशेषज्ञता के साथ जोड़ती है ताकि कक्षीय संचालन में अद्वितीय अंतर्दृष्टि प्रदान की जा सके।',
    'about.feature1.title': 'मिशन कंट्रोल',
    'about.feature1.desc': 'अगली पीढ़ी के अंतरिक्ष संचालन के लिए उन्नत उपग्रह ट्रैकिंग और मिशन योजना क्षमताएं',
    'about.feature2.title': 'बहुविषयक परियोजना',
    'about.feature2.desc': 'एक एकीकृत मंच में एयरोस्पेस इंजीनियरिंग, AI, डेटा विज्ञान, और कक्षीय यांत्रिकी का संयोजन',
    'about.feature3.title': 'सटीक ट्रैकिंग',
    'about.feature3.desc': 'सभी कक्षीय वस्तुओं के लिए सब-मीटर सटीकता के साथ रीयल-टाइम स्थिति निर्धारण',
    
    // Satellite Details Modal
    'satellite.modal.title': 'उपग्रह विवरण',
    'satellite.modal.close': 'बंद करें',
    'satellite.modal.name': 'नाम',
    'satellite.modal.type': 'प्रकार',
    'satellite.modal.orbit': 'कक्षा',
    'satellite.modal.altitude': 'ऊंचाई',
    'satellite.modal.speed': 'गति',
    'satellite.modal.launched': 'प्रक्षेपण',
    'satellite.modal.mission': 'मिशन',
    'satellite.modal.status': 'स्थिति',
    'satellite.modal.operator': 'संचालक',
    'satellite.modal.country': 'देश',
    
    // Footer
    'footer.tagline': 'उन्नत अंतरिक्ष बुद्धिमत्ता प्लेटफॉर्म',
    'footer.rights': 'सर्वाधिकार सुरक्षित।',
    
    // Dashboard
    'dashboard.location': 'CZH: काबेलवाग/वाटिंड, डेनमार्क',
    'dashboard.mode.weather': 'मौसम',
    'dashboard.mode.amateur': 'शौकिया',
    'dashboard.mode.iss': 'ISS',
    'dashboard.mode.military': 'सैन्य',
    'dashboard.orbit': 'कक्षा दृश्य',
    'dashboard.satellites': 'उपग्रह',
    'dashboard.table.id': 'ID',
    'dashboard.table.coordinates': 'िर्देशांक',
    'dashboard.table.aos': 'AOS',
    'dashboard.table.los': 'LOS',
    'dashboard.table.distance': 'दूरी',
    'dashboard.table.speed': 'गति',
    'dashboard.table.frequency': 'आवृत्ति',
    'dashboard.signal': 'लाइव सिग्नल शक्ति',
    'dashboard.vhf': 'VHF स्तर',
    'dashboard.uhf': 'UHF स्तर',
    'dashboard.snr': 'S/N अनुपात',
    'dashboard.details': 'उपग्रह विवरण',
    'dashboard.mission': 'मिशन',
    'dashboard.operator': 'संचालक',
    'dashboard.purpose': 'उद्देश्य',
    'dashboard.band': 'आवृत्ति बैंड',
    'dashboard.leo': 'LEO वस्तुएं',
  },
  de: {
    // Navigation
    'nav.api': 'API',
    'nav.about': 'Über uns',
    'nav.language': 'Sprache',
    'nav.weather': 'Wetter',
    
    // Hero
    'hero.badge': '✨ KI-gestützte Weltraum-Intelligence-Plattform',
    'hero.title1': 'Missionskontrolle für die',
    'hero.title2': 'Nächste Generation',
    'hero.subtitle': 'Echtzeit-Satellitenverfolgung, KI-gestützte Erdanalyse und globale Biodiversitätsüberwachung. Erleben Sie die Zukunft der Weltraumintelligenz.',
    'hero.button': 'Mission starten',
    'hero.weather': 'Wetter',
    'hero.stat1': { value: '2.847', label: 'Aktive Satelliten' },
    'hero.stat2': { value: '99,9%', label: 'Betriebszeit' },
    'hero.stat3': { value: 'Echtzeit', label: 'Datenverarbeitung' },
    
    // About
    'about.badge': 'Über Satell-Eye',
    'about.title': 'Die Zukunft der Weltraumintelligenz',
    'about.description': 'Satell-Eye kombiniert modernste Technologie mit jahrzehntelanger Luft- und Raumfahrtexpertise, um unvergleichliche Einblicke in Orbitalbetriebe zu bieten.',
    'about.feature1.title': 'Missionskontrolle',
    'about.feature1.desc': 'Fortgeschrittene Satellitenverfolgung und Missionsplanungsfähigkeiten für Weltraumoperationen der nächsten Generation',
    'about.feature2.title': 'Multidisziplinäres Projekt',
    'about.feature2.desc': 'Kombination von Luft- und Raumfahrttechnik, KI, Datenwissenschaft und Orbitalmechanik in einer einheitlichen Plattform',
    'about.feature3.title': 'Präzisionsverfolgung',
    'about.feature3.desc': 'Echtzeit-Positionierung mit Submeter-Genauigkeit für alle Orbitalobjekte',
    
    // Satellite Details Modal
    'satellite.modal.title': 'Satellitendetails',
    'satellite.modal.close': 'Schließen',
    'satellite.modal.name': 'Name',
    'satellite.modal.type': 'Typ',
    'satellite.modal.orbit': 'Umlaufbahn',
    'satellite.modal.altitude': 'Höhe',
    'satellite.modal.speed': 'Geschwindigkeit',
    'satellite.modal.launched': 'Gestartet',
    'satellite.modal.mission': 'Mission',
    'satellite.modal.status': 'Status',
    'satellite.modal.operator': 'Betreiber',
    'satellite.modal.country': 'Land',
    
    // Footer
    'footer.tagline': 'Fortgeschrittene Weltraum-Intelligence-Plattform',
    'footer.rights': 'Alle Rechte vorbehalten.',
    
    // Dashboard
    'dashboard.location': 'CZH: Kabelvåg/Våttind, Dänemark',
    'dashboard.mode.weather': 'Wetter',
    'dashboard.mode.amateur': 'Amateur',
    'dashboard.mode.iss': 'ISS',
    'dashboard.mode.military': 'Militär',
    'dashboard.orbit': 'Orbit-Visualisierung',
    'dashboard.satellites': 'Satelliten',
    'dashboard.table.id': 'ID',
    'dashboard.table.coordinates': 'Koordinaten',
    'dashboard.table.aos': 'AOS',
    'dashboard.table.los': 'LOS',
    'dashboard.table.distance': 'Entfernung',
    'dashboard.table.speed': 'Geschwindigkeit',
    'dashboard.table.frequency': 'Frequenz',
    'dashboard.signal': 'Live-Signalstärke',
    'dashboard.vhf': 'VHF-Pegel',
    'dashboard.uhf': 'UHF-Pegel',
    'dashboard.snr': 'S/N-Verhältnis',
    'dashboard.details': 'Satellitendetails',
    'dashboard.mission': 'Mission',
    'dashboard.operator': 'Betreiber',
    'dashboard.purpose': 'Zweck',
    'dashboard.band': 'Frequenzband',
    'dashboard.leo': 'LEO-Objekte',
  },
  ru: {
    // Navigation
    'nav.api': 'API',
    'nav.about': 'О нас',
    'nav.language': 'Язык',
    'nav.weather': 'Погода',
    
    // Hero
    'hero.badge': '✨ Платформа космической разведки на базе ИИ',
    'hero.title1': 'Центр управления полетами для',
    'hero.title2': 'Следующего поколения',
    'hero.subtitle': 'Отслеживание спутников в реальном времени, анализ Земли на базе ИИ и мониторинг глобальной биодиверситета. Испытайте будущее космической разведки.',
    'hero.button': 'Запустить миссию',
    'hero.weather': 'Погода',
    'hero.stat1': { value: '2 847', label: 'Активных спутников' },
    'hero.stat2': { value: '99,9%', label: 'Время работы' },
    'hero.stat3': { value: 'Реальное время', label: 'Обработка данных' },
    
    // About
    'about.badge': 'О Satell-Eye',
    'about.title': 'Будущее космической разведки',
    'about.description': 'Satell-Eye сочетает передовые технологии с десятилетиями опыта в аэрокосмической отрасли для обеспечения непревзойденной информации об орбитальных операциях.',
    'about.feature1.title': 'Центр уравления',
    'about.feature1.desc': 'Расширенные возможности отслеживания спутников и планирования миссий для космических операций нового поколения',
    'about.feature2.title': 'Междисциплинарный проект',
    'about.feature2.desc': 'Объединение аэрокосмической инженерии, ИИ, науки о данных и орбитальной механики на единой платформе',
    'about.feature3.title': 'Точное отслеживание',
    'about.feature3.desc': 'Позиционирование в реальном времени с субметровой точностью для всех орбитальных объектов',
    
    // Satellite Details Modal
    'satellite.modal.title': 'Детали спутника',
    'satellite.modal.close': 'Закрыть',
    'satellite.modal.name': 'Название',
    'satellite.modal.type': 'Тип',
    'satellite.modal.orbit': 'Орбита',
    'satellite.modal.altitude': 'Высота',
    'satellite.modal.speed': 'Скорость',
    'satellite.modal.launched': 'Запущен',
    'satellite.modal.mission': 'Миссия',
    'satellite.modal.status': 'Статус',
    'satellite.modal.operator': 'Оператор',
    'satellite.modal.country': 'Страна',
    
    // Footer
    'footer.tagline': 'Передовая платформа космической разведки',
    'footer.rights': 'Все права защищены.',
    
    // Dashboard
    'dashboard.location': 'CZH: Кабельвог/Воттинд, Дания',
    'dashboard.mode.weather': 'Погода',
    'dashboard.mode.amateur': 'Любительский',
    'dashboard.mode.iss': 'МКС',
    'dashboard.mode.military': 'Военный',
    'dashboard.orbit': 'Визуализация орбиты',
    'dashboard.satellites': 'Спутники',
    'dashboard.table.id': 'ID',
    'dashboard.table.coordinates': 'Координаты',
    'dashboard.table.aos': 'AOS',
    'dashboard.table.los': 'LOS',
    'dashboard.table.distance': 'Расстояние',
    'dashboard.table.speed': 'Скорость',
    'dashboard.table.frequency': 'Частота',
    'dashboard.signal': 'Мощность сигнала в реальном времени',
    'dashboard.vhf': 'Уровень VHF',
    'dashboard.uhf': 'Уровень UHF',
    'dashboard.snr': 'Отношение S/N',
    'dashboard.details': 'Детали спутника',
    'dashboard.mission': 'Миссия',
    'dashboard.operator': 'Оператор',
    'dashboard.purpose': 'Цель',
    'dashboard.band': 'Частотный диапазон',
    'dashboard.leo': 'Объекты НОО',
  },
  fr: {
    // Navigation
    'nav.api': 'API',
    'nav.about': 'À propos',
    'nav.language': 'Langue',
    'nav.weather': 'Météo',
    
    // Hero
    'hero.badge': '✨ Plateforme d\'intelligence spatiale alimentée par l\'IA',
    'hero.title1': 'Centre de contrôle de mission pour la',
    'hero.title2': 'Prochaine génération',
    'hero.subtitle': 'Suivi satellite en temps réel, analyse de la Terre alimentée par l\'IA et surveillance de la biodiversité mondiale. Découvrez l\'avenir de l\'intelligence spatiale.',
    'hero.button': 'Lancer la mission',
    'hero.weather': 'Météo',
    'hero.stat1': { value: '2 847', label: 'Satellites actifs' },
    'hero.stat2': { value: '99,9%', label: 'Disponibilité' },
    'hero.stat3': { value: 'Temps réel', label: 'Traitement des données' },
    
    // About
    'about.badge': 'À propos de Satell-Eye',
    'about.title': 'L\'avenir de l\'intelligence spatiale',
    'about.description': 'Satell-Eye combine une technologie de pointe avec des décennies d\'expertise aérospatiale pour fournir des informations inégalées sur les opérations orbitales.',
    'about.feature1.title': 'Contrôle de mission',
    'about.feature1.desc': 'Capacités avancées de suivi satellite et de planification de mission pour les opérations spatiales de nouvelle génération',
    'about.feature2.title': 'Projet multidisciplinaire',
    'about.feature2.desc': 'Combinaison d\'ingénierie aérospatiale, d\'IA, de science des données et de mécanique orbitale sur une plateforme unifiée',
    'about.feature3.title': 'Suivi de précision',
    'about.feature3.desc': 'Positionnement en temps réel avec une précision sous-métrique pour tous les objets orbitaux',
    
    // Satellite Details Modal
    'satellite.modal.title': 'Détails du satellite',
    'satellite.modal.close': 'Fermer',
    'satellite.modal.name': 'Nom',
    'satellite.modal.type': 'Type',
    'satellite.modal.orbit': 'Orbite',
    'satellite.modal.altitude': 'Altitude',
    'satellite.modal.speed': 'Vitesse',
    'satellite.modal.launched': 'Lancé',
    'satellite.modal.mission': 'Mission',
    'satellite.modal.status': 'Statut',
    'satellite.modal.operator': 'Opérateur',
    'satellite.modal.country': 'Pays',
    
    // Footer
    'footer.tagline': 'Plateforme avancée d\'intelligence spatiale',
    'footer.rights': 'Tous droits réservés.',
    
    // Dashboard
    'dashboard.location': 'CZH : Kabelvåg/Våttind, Danemark',
    'dashboard.mode.weather': 'Météo',
    'dashboard.mode.amateur': 'Amateur',
    'dashboard.mode.iss': 'ISS',
    'dashboard.mode.military': 'Militaire',
    'dashboard.orbit': 'Visualisation d\'orbite',
    'dashboard.satellites': 'Satellites',
    'dashboard.table.id': 'ID',
    'dashboard.table.coordinates': 'Coordonnées',
    'dashboard.table.aos': 'AOS',
    'dashboard.table.los': 'LOS',
    'dashboard.table.distance': 'Distance',
    'dashboard.table.speed': 'Vitesse',
    'dashboard.table.frequency': 'Fréquence',
    'dashboard.signal': 'Force du signal en direct',
    'dashboard.vhf': 'Niveau VHF',
    'dashboard.uhf': 'Niveau UHF',
    'dashboard.snr': 'Rapport S/N',
    'dashboard.details': 'Détails du satellite',
    'dashboard.mission': 'Mission',
    'dashboard.operator': 'Opérateur',
    'dashboard.purpose': 'Objectif',
    'dashboard.band': 'Bande de fréquence',
    'dashboard.leo': 'Objets LEO',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}