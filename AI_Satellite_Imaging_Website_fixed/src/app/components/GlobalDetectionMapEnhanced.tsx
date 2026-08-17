import { useState, useEffect, useRef } from 'react';
import { Activity, Loader2, AlertTriangle, ZoomIn, ZoomOut, Play, MapPin, Sparkles, Download, Share2, Settings, Send, Pause, RotateCcw, Maximize2, Filter, TrendingUp, AlertCircle, Shield, Brain, Zap, X, History, Calendar, Search, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NaturalEvent, getCategoryColor, getCategoryIcon } from '../services/eonetService';
import { refreshDisasterData, DisasterUpdate, getEventSeverity, getSeverityColor } from '../services/disasterBackendService';
import { generateGlobalPredictions, DisasterPrediction, PredictionResponse } from '../services/geminiPredictionService';
import { PredictionHistoryService, HistoryEntry } from '../services/predictionHistoryService';
import worldMapImage from 'figma:asset/b448c7fa7d72d408931dc032738244e099a9bf41.png';

interface GlobalDetectionMapProps {
  onNavigateToAIAnalysis?: () => void;
}

export function GlobalDetectionMapEnhanced({ onNavigateToAIAnalysis }: GlobalDetectionMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [events, setEvents] = useState<NaturalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<NaturalEvent | null>(null);
  const [pulseTime, setPulseTime] = useState(0);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [detectionTypeFilter, setDetectionTypeFilter] = useState<string>('all');
  const [zoom, setZoom] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [clickedCoordinates, setClickedCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanInterval, setScanInterval] = useState<NodeJS.Timeout | null>(null);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [locationInput, setLocationInput] = useState({ lat: '', lon: '' });
  const [locationAnalysis, setLocationAnalysis] = useState<any>(null);
  const [analyzingLocation, setAnalyzingLocation] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationInterval, setNotificationInterval] = useState<NodeJS.Timeout | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  
  // AI Interactive Background
  const predictionCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Gemini AI Predictions State
  const [predictions, setPredictions] = useState<DisasterPrediction[]>([]);
  const [predictionResponse, setPredictionResponse] = useState<PredictionResponse | null>(null);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [showPredictions, setShowPredictions] = useState(true);
  const [selectedPrediction, setSelectedPrediction] = useState<DisasterPrediction | null>(null);
  const [showPredictionsPanel, setShowPredictionsPanel] = useState(false);
  const [autoPredictEnabled, setAutoPredictEnabled] = useState(false);
  const [predictionInterval, setPredictionInterval] = useState<NodeJS.Timeout | null>(null);
  const [lastPredictionTime, setLastPredictionTime] = useState<Date | null>(null);
  const [nextPredictionIn, setNextPredictionIn] = useState<number>(20);
  
  // New State for Search, Timeframe and History
  const [predictionSearch, setPredictionSearch] = useState('');
  const [predictionTimeframe, setPredictionTimeframe] = useState('Next Week');
  const [showHistory, setShowHistory] = useState(false);
  const [predictionHistory, setPredictionHistory] = useState<HistoryEntry[]>([]);

  // AI Background Animation
  useEffect(() => {
    const canvas = predictionCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles: { x: number; y: number; speed: number; size: number; color: string }[] = [];
    
    // Initialize particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.5 + Math.random(),
        size: 1 + Math.random() * 2,
        color: Math.random() > 0.5 ? '#00ffff' : '#a855f7'
      });
    }

    let animationFrame: number;

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        p.y += p.speed;
        if (p.y > canvas.height) {
          p.y = 0;
          p.x = Math.random() * canvas.width;
        }

        // Draw connections
        particles.forEach(p2 => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            ctx.strokeStyle = `rgba(0, 255, 255, ${0.1 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Load world map image
  useEffect(() => {
    const img = new Image();
    img.src = worldMapImage;
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };
    img.onerror = () => {
      console.error('Failed to load world map image');
    };
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const update: DisasterUpdate = await refreshDisasterData();
        setEvents(update.allEvents);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error fetching disaster data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, []);

  // Pulse animation
  useEffect(() => {
    const animate = () => {
      setPulseTime(prev => prev + 0.05);
      requestAnimationFrame(animate);
    };
    const frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Countdown timer for next prediction
  useEffect(() => {
    if (autoPredictEnabled && lastPredictionTime) {
      const countdown = setInterval(() => {
        const now = new Date().getTime();
        const lastTime = lastPredictionTime.getTime();
        const elapsed = Math.floor((now - lastTime) / 1000);
        const remaining = Math.max(0, 20 - elapsed);
        setNextPredictionIn(remaining);
      }, 1000);

      return () => clearInterval(countdown);
    }
  }, [autoPredictEnabled, lastPredictionTime]);

  // Cleanup prediction interval on unmount
  useEffect(() => {
    return () => {
      if (predictionInterval) {
        clearInterval(predictionInterval);
      }
    };
  }, [predictionInterval]);

  // Filter events
  const filteredEvents = (events || []).filter(event => {
    const severity = getEventSeverity(event);
    const severityMatch = severityFilter === 'all' || severity === severityFilter;
    
    const categoryId = event.categories[0]?.id || '';
    const typeMatch = detectionTypeFilter === 'all' || categoryId === detectionTypeFilter;
    
    return severityMatch && typeMatch;
  });

  // Count by severity
  const severityCounts = {
    Critical: filteredEvents.filter(e => getEventSeverity(e) === 'Critical').length,
    High: filteredEvents.filter(e => getEventSeverity(e) === 'High').length,
    Medium: filteredEvents.filter(e => getEventSeverity(e) === 'Medium').length,
    Low: filteredEvents.filter(e => getEventSeverity(e) === 'Low').length,
  };

  // Draw main map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    if (!img) return;

    const drawMap = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Draw world map
      const scale = zoom;
      const scaledWidth = width * scale;
      const scaledHeight = height * scale;
      const offsetX = (width - scaledWidth) / 2 + panOffset.x;
      const offsetY = (height - scaledHeight) / 2 + panOffset.y;

      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

      // Convert lat/lon to canvas x/y
      const latLonToXY = (lat: number, lon: number) => {
        const x = ((lon + 180) / 360) * scaledWidth + offsetX;
        const y = ((90 - lat) / 180) * scaledHeight + offsetY;
        return { x, y };
      };

      // Draw coordinate grid
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.font = '10px monospace';
      ctx.fillStyle = 'rgba(0, 255, 255, 0.6)';

      // Latitude lines
      for (let lat = -90; lat <= 90; lat += 30) {
        const start = latLonToXY(lat, -180);
        const end = latLonToXY(lat, 180);
        
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        // Labels on left
        ctx.fillText(`${lat}°`, 10, start.y);
      }

      // Longitude lines
      for (let lon = -180; lon <= 180; lon += 60) {
        const start = latLonToXY(-90, lon);
        const end = latLonToXY(90, lon);
        
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        // Labels on top
        ctx.fillText(`${lon}°`, start.x - 15, 15);
      }

      // Draw event markers
      filteredEvents.forEach((event, index) => {
        const geometry = event.geometry[event.geometry.length - 1];
        if (!geometry || geometry.type !== 'Point') return;

        const [lon, lat] = geometry.coordinates;
        const { x, y } = latLonToXY(lat, lon);

        if (x < 0 || x > width || y < 0 || y > height) return;

        const severity = getEventSeverity(event);
        const severityColor = getSeverityColor(severity);

        // Draw pulsing outer ring
        const pulseScale = Math.sin(pulseTime + index * 0.3) * 0.3 + 1.0;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 20 * pulseScale);
        gradient.addColorStop(0, `${severityColor}88`);
        gradient.addColorStop(0.5, `${severityColor}44`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 20 * pulseScale, 0, Math.PI * 2);
        ctx.fill();

        // Draw inner ring
        ctx.strokeStyle = severityColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.stroke();

        // Draw marker dot
        ctx.fillStyle = severityColor;
        ctx.shadowBlur = 15;
        ctx.shadowColor = severityColor;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Only show coordinates if this event is selected
        if (selectedEvent?.id === event.id) {
          // Draw coordinates below marker
          ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
          ctx.fillRect(x - 55, y + 15, 110, 22);
          
          ctx.strokeStyle = severityColor;
          ctx.lineWidth = 1;
          ctx.strokeRect(x - 55, y + 15, 110, 22);
          
          ctx.fillStyle = '#00ffff';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`${lat.toFixed(4)}°, ${lon.toFixed(4)}°`, x, y + 30);

          // Draw selection ring
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, 25, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
    };

    drawMap();
  }, [filteredEvents, pulseTime, selectedEvent, zoom, imageLoaded, panOffset]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;
    const scale = zoom;
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;
    const offsetX = (width - scaledWidth) / 2 + panOffset.x;
    const offsetY = (height - scaledHeight) / 2 + panOffset.y;

    const latLonToXY = (lat: number, lon: number) => {
      const x = ((lon + 180) / 360) * scaledWidth + offsetX;
      const y = ((90 - lat) / 180) * scaledHeight + offsetY;
      return { x, y };
    };

    // Check if click is near any event
    for (const evt of filteredEvents) {
      const geometry = evt.geometry[evt.geometry.length - 1];
      if (!geometry || geometry.type !== 'Point') continue;

      const [lon, lat] = geometry.coordinates;
      const { x, y } = latLonToXY(lat, lon);

      const distance = Math.sqrt(Math.pow(clickX - x, 2) + Math.pow(clickY - y, 2));

      if (distance < 25) {
        setSelectedEvent(selectedEvent?.id === evt.id ? null : evt);
        setClickedCoordinates({ lat, lon });
        return;
      }
    }

    setSelectedEvent(null);
    setClickedCoordinates(null);
  };

  const handleCanvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const startX = event.clientX - rect.left;
    const startY = event.clientY - rect.top;

    setDragStart({ x: startX, y: startY });
    setIsDragging(true);
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !isDragging) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = event.clientX - rect.left;
    const currentY = event.clientY - rect.top;

    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;

    setPanOffset(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
    setDragStart({ x: currentX, y: currentY });
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasMouseLeave = () => {
    setIsDragging(false);
  };

  const handleCanvasWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handleTrackLocation = () => {
    if (selectedEvent) {
      const geometry = selectedEvent.geometry[selectedEvent.geometry.length - 1];
      if (geometry && geometry.type === 'Point') {
        const [lon, lat] = geometry.coordinates;
        setZoom(1.5);
        setPanOffset({ x: 0, y: 0 });
        console.log(`Tracking: ${lat.toFixed(4)}°, ${lon.toFixed(4)}°`);
      }
    }
  };

  const handleNewAnalysis = () => {
    if (onNavigateToAIAnalysis) {
      onNavigateToAIAnalysis();
    }
  };

  // Load history on mount
  useEffect(() => {
    const history = PredictionHistoryService.getHistory();
    setPredictionHistory(history);
  }, []);

  const handleGeneratePredictions = async (silent = false) => {
    setLoadingPredictions(true);
    setShowPredictionsPanel(true);
    setShowHistory(false); // Switch to live view
    try {
      const response = await generateGlobalPredictions(predictionSearch, predictionTimeframe);
      setPredictionResponse(response);
      setPredictions(response.predictions);
      setLastPredictionTime(new Date());
      setNextPredictionIn(20);
      
      // Save to history
      const updatedHistory = PredictionHistoryService.addEntry(response);
      setPredictionHistory(updatedHistory);
      
      if (!silent) {
        console.log(`✅ Gemini AI Predictions Generated!\n📊 Total: ${response.totalPredictions} predictions\n🔴 Critical: ${response.predictions.filter(p => p.severity === 'Critical').length}\n🟠 High: ${response.predictions.filter(p => p.severity === 'High').length}\n🌍 Global Risk: ${response.globalRiskLevel}`);
      }
    } catch (error) {
      console.error('Prediction generation failed:', error);
      if (!silent) {
        alert('⚠️ Gemini API Error. Check console for details.');
      }
    } finally {
      setLoadingPredictions(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear prediction history?')) {
        PredictionHistoryService.clearHistory();
        setPredictionHistory([]);
    }
  };

  const handleRestoreHistoryEntry = (entry: HistoryEntry) => {
      setPredictions(entry.predictions);
      setPredictionResponse({
          predictions: entry.predictions,
          globalRiskLevel: entry.riskLevel,
          totalPredictions: entry.predictions.length,
          lastUpdated: new Date(entry.timestamp),
          dataSource: 'Historical Archive'
      });
      setShowHistory(false);
      setShowHistoryModal(false);
      setShowPredictionsPanel(true); // Ensure the panel opens to show the data
  };

  const toggleAutoPredictions = () => {
    if (autoPredictEnabled) {
      // Disable auto-predictions
      if (predictionInterval) {
        clearInterval(predictionInterval);
        setPredictionInterval(null);
      }
      setAutoPredictEnabled(false);
      console.log('🔴 Auto-predictions disabled');
    } else {
      // Enable auto-predictions
      setAutoPredictEnabled(true);
      
      // Generate initial prediction
      handleGeneratePredictions(true);
      
      // Set up 20-second interval
      const interval = setInterval(() => {
        console.log('🔄 Auto-generating predictions...');
        handleGeneratePredictions(true);
      }, 20000);
      
      setPredictionInterval(interval);
      console.log('✅ Auto-predictions enabled (every 20 seconds)');
    }
  };

  const resetFilters = () => {
    setSeverityFilter('all');
    setDetectionTypeFilter('all');
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const { exportDisasterData } = await import('../services/reportBackendService');
      const result = await exportDisasterData(filteredEvents, severityFilter, detectionTypeFilter);
      
      if (result.success) {
        const blob = new Blob([result.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `disaster-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleShareReport = async () => {
    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    if (!emailInput || !emailInput.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    
    setSharing(true);
    try {
      const { sendReportEmail } = await import('../services/emailService');
      const result = await sendReportEmail(emailInput, filteredEvents, severityFilter, detectionTypeFilter);
      
      if (result.success) {
        alert(`✓ Report sent successfully to ${emailInput}!`);
        setShowEmailModal(false);
        setEmailInput('');
      } else {
        alert(`Failed to send email: ${result.message}`);
      }
    } catch (error) {
      console.error('Email failed:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  const handleStartScan = () => {
    if (scanning) {
      if (scanInterval) {
        clearInterval(scanInterval);
        setScanInterval(null);
      }
      setScanning(false);
      alert('✓ Continuous scanning stopped');
    } else {
      setScanning(true);
      const interval = setInterval(async () => {
        try {
          const update: DisasterUpdate = await refreshDisasterData();
          setEvents(update.allEvents);
          setLastUpdate(new Date());
        } catch (error) {
          console.error('Scan error:', error);
        }
      }, 30000);
      setScanInterval(interval);
      alert('✓ Continuous scanning started (refreshing every 30 seconds)');
    }
  };

  const handleTrackLocationClick = () => {
    setShowLocationInput(true);
  };

  const handleAnalyzeLocation = async () => {
    const lat = parseFloat(locationInput.lat);
    const lon = parseFloat(locationInput.lon);
    
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      alert('Please enter valid coordinates:\nLatitude: -90 to 90\nLongitude: -180 to 180');
      return;
    }
    
    setAnalyzingLocation(true);
    try {
      const { analyzeLocation } = await import('../services/locationAnalysisService');
      const analysis = await analyzeLocation(lat, lon);
      setLocationAnalysis(analysis);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to analyze location. Please try again.');
    } finally {
      setAnalyzingLocation(false);
    }
  };

  const handleConfigureNotifications = () => {
    setShowConfigModal(true);
  };

  const handleToggleNotifications = async () => {
    if (notificationsEnabled) {
      if (notificationInterval) {
        const { stopNotificationService } = await import('../services/notificationService');
        stopNotificationService(notificationInterval);
        setNotificationInterval(null);
      }
      setNotificationsEnabled(false);
      alert('✓ Disaster predictions disabled');
    } else {
      const { startNotificationService, requestNotificationPermission, subscribeToNotifications } = await import('../services/notificationService');
      
      const permitted = await requestNotificationPermission();
      if (!permitted) {
        alert('⚠️ Browser notifications blocked. Enable in browser settings for alerts.');
      }
      
      const interval = startNotificationService();
      setNotificationInterval(interval);
      
      subscribeToNotifications((payload) => {
        console.log('[Notifications]', payload.summary);
        if (payload.urgentCount > 0) {
          alert(`⚠️ URGENT: ${payload.summary}`);
        }
      });
      
      setNotificationsEnabled(true);
      alert('✓ Disaster predictions enabled!\n\nChecking every 15 seconds for threats in next 7 days from NASA/ISRO data.');
    }
  };

  const handleShowPredictionsPanel = () => {
    setShowPredictionsPanel(!showPredictionsPanel);
  };

  const handleSelectPrediction = (prediction: DisasterPrediction) => {
    setSelectedPrediction(selectedPrediction?.id === prediction.id ? null : prediction);
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Gradient */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative backdrop-blur-xl bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-400/20 rounded-3xl p-8 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5 animate-pulse" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h3 className="text-white text-3xl mb-2 flex items-center gap-3 font-light">
              <div className="p-3 bg-cyan-500/20 rounded-2xl border border-cyan-400/30">
                <Activity className="w-8 h-8 text-cyan-400" />
              </div>
              Global Detection Map
            </h3>
            <p className="text-white/60 ml-16">Real-time planetary monitoring with NASA EONET integration</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-5 py-3 bg-black/40 border border-cyan-400/30 rounded-2xl backdrop-blur-xl">
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50" />
              <span className="text-cyan-400 text-sm font-mono">LIVE</span>
            </div>
            <div className="px-5 py-3 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-xl">
              <span className="text-white/80 text-sm">Zoom: </span>
              <span className="text-white font-mono">{(zoom * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6 relative z-10">
          <div className="backdrop-blur-md bg-red-500/10 border border-red-400/30 rounded-2xl p-4">
            <div className="text-red-400 text-xs mb-1 uppercase tracking-wider">Critical</div>
            <div className="text-white text-3xl font-light">{severityCounts.Critical}</div>
          </div>
          <div className="backdrop-blur-md bg-orange-500/10 border border-orange-400/30 rounded-2xl p-4">
            <div className="text-orange-400 text-xs mb-1 uppercase tracking-wider">High</div>
            <div className="text-white text-3xl font-light">{severityCounts.High}</div>
          </div>
          <div className="backdrop-blur-md bg-yellow-500/10 border border-yellow-400/30 rounded-2xl p-4">
            <div className="text-yellow-400 text-xs mb-1 uppercase tracking-wider">Medium</div>
            <div className="text-white text-3xl font-light">{severityCounts.Medium}</div>
          </div>
          <div className="backdrop-blur-md bg-cyan-500/10 border border-cyan-400/30 rounded-2xl p-4">
            <div className="text-cyan-400 text-xs mb-1 uppercase tracking-wider">Low</div>
            <div className="text-white text-3xl font-light">{severityCounts.Low}</div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Control Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-5 h-5 text-purple-400" />
          <h4 className="text-white text-lg">Mission Control</h4>
        </div>
        
        <div className="grid grid-cols-6 gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`backdrop-blur-md border rounded-2xl p-5 transition-all duration-300 flex flex-col items-center gap-3 group ${
              scanning 
                ? 'bg-purple-500/20 border-purple-400/50 shadow-lg shadow-purple-500/20' 
                : 'bg-white/5 border-purple-400/30 hover:bg-purple-500/10 hover:border-purple-400/50'
            }`}
            onClick={handleStartScan}
          >
            {scanning ? (
              <Pause className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
            ) : (
              <Play className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
            )}
            <span className="text-white text-sm">{scanning ? 'Stop Scan' : 'Start Scan'}</span>
            {scanning && <div className="w-full h-1 bg-purple-500/50 rounded-full animate-pulse" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="backdrop-blur-md bg-white/5 border border-yellow-400/30 rounded-2xl p-5 hover:bg-yellow-500/10 hover:border-yellow-400/50 transition-all duration-300 flex flex-col items-center gap-3 group"
            onClick={handleTrackLocationClick}
          >
            <MapPin className="w-6 h-6 text-yellow-400 group-hover:scale-110 transition-transform" />
            <span className="text-white text-sm">Track Location</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`backdrop-blur-md border rounded-2xl p-5 transition-all duration-300 flex flex-col items-center gap-3 group relative ${
              autoPredictEnabled
                ? 'bg-cyan-500/20 border-cyan-400/50 shadow-lg shadow-cyan-500/20'
                : loadingPredictions || showPredictionsPanel
                ? 'bg-cyan-500/10 border-cyan-400/40'
                : 'bg-white/5 border-cyan-400/30 hover:bg-cyan-500/10 hover:border-cyan-400/50'
            }`}
            onClick={toggleAutoPredictions}
            disabled={loadingPredictions}
          >
            {loadingPredictions ? (
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
            ) : (
              <Brain className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
            )}
            <span className="text-white text-sm">
              {autoPredictEnabled ? `Auto: ${nextPredictionIn}s` : 'Prediction'}
            </span>
            {autoPredictEnabled && (
              <div className="w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full animate-pulse" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="backdrop-blur-md bg-white/5 border border-green-400/30 rounded-2xl p-5 hover:bg-green-500/10 hover:border-green-400/50 transition-all duration-300 flex flex-col items-center gap-3 group relative"
            onClick={handleExportData}
          >
            <Download className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform" />
            <span className="text-white text-sm">Export Data</span>
            {exporting && <Loader2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-cyan-400 animate-spin" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="backdrop-blur-md bg-white/5 border border-blue-400/30 rounded-2xl p-5 hover:bg-blue-500/10 hover:border-blue-400/50 transition-all duration-300 flex flex-col items-center gap-3 group relative"
            onClick={handleShareReport}
          >
            <Share2 className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-white text-sm">Share Report</span>
            {sharing && <Loader2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-cyan-400 animate-spin" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`backdrop-blur-md border rounded-2xl p-5 transition-all duration-300 flex flex-col items-center gap-3 group ${
              notificationsEnabled
                ? 'bg-orange-500/20 border-orange-400/50 shadow-lg shadow-orange-500/20'
                : 'bg-white/5 border-orange-400/30 hover:bg-orange-500/10 hover:border-orange-400/50'
            }`}
            onClick={handleConfigureNotifications}
          >
            <Shield className="w-6 h-6 text-orange-400 group-hover:scale-110 transition-transform" />
            <span className="text-white text-sm">Configure</span>
            {notificationsEnabled && <div className="w-full h-1 bg-orange-500/50 rounded-full animate-pulse" />}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="backdrop-blur-md bg-white/5 border border-purple-400/30 rounded-2xl p-5 hover:bg-purple-500/10 hover:border-purple-400/50 transition-all duration-300 flex flex-col items-center gap-3 group col-span-2 md:col-span-1"
            onClick={() => setShowHistoryModal(true)}
          >
            <History className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="text-white text-sm">History</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Enhanced Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Filter className="w-5 h-5 text-cyan-400" />
          <h4 className="text-white text-lg">Detection Filters</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="text-white/80 text-sm mb-3 block flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full" />
              Detection Type
            </label>
            <select
              value={detectionTypeFilter}
              onChange={(e) => setDetectionTypeFilter(e.target.value)}
              className="w-full px-5 py-3 bg-black/40 border border-white/20 rounded-2xl text-white focus:outline-none focus:border-cyan-400/50 focus:bg-black/60 transition-all duration-300 backdrop-blur-xl"
            >
              <option value="all">All Types</option>
              <option value="wildfires">🔥 Wildfires</option>
              <option value="volcanoes">🌋 Volcanoes</option>
              <option value="severeStorms">⛈️ Severe Storms</option>
              <option value="floods">🌊 Floods</option>
              <option value="drought">☀️ Drought</option>
            </select>
          </div>

          <div>
            <label className="text-white/80 text-sm mb-3 block flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full" />
              Severity Level
            </label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-5 py-3 bg-black/40 border border-white/20 rounded-2xl text-white focus:outline-none focus:border-cyan-400/50 focus:bg-black/60 transition-all duration-300 backdrop-blur-xl"
            >
              <option value="all">All Severities</option>
              <option value="Critical">🔴 Critical</option>
              <option value="High">🟠 High</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Low">🔵 Low</option>
            </select>
          </div>

          <div className="flex items-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetFilters}
              className="w-full px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Filters
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Map Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="backdrop-blur-xl bg-black/40 border border-cyan-400/20 rounded-3xl p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-br-full" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-purple-500/20 to-transparent rounded-tl-full" />
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <h3 className="text-white text-xl flex items-center gap-3">
            <Maximize2 className="w-5 h-5 text-cyan-400" />
            Planetary Surveillance Grid
          </h3>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-black/60 border border-cyan-400/30 rounded-xl backdrop-blur-xl">
              <span className="text-cyan-400 font-mono text-sm">{filteredEvents.length} ACTIVE DETECTIONS</span>
            </div>
            <div className="px-4 py-2 bg-black/60 border border-white/20 rounded-xl backdrop-blur-xl">
              <span className="text-white/60 text-sm">Last Update: </span>
              <span className="text-white text-sm font-mono">{lastUpdate.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-black/80 border border-white/10 shadow-2xl">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 backdrop-blur-sm">
              <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
              <span className="text-cyan-400 text-sm font-mono">Scanning planetary surface...</span>
            </div>
          )}
          {!loading && filteredEvents.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10 backdrop-blur-sm">
              <div className="text-center px-8">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-400/30 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-green-400 text-lg font-semibold mb-2">All Clear</p>
                <p className="text-white/50 text-sm max-w-xs">
                  No active {detectionTypeFilter === 'all' ? 'environmental events' : detectionTypeFilter.replace('wildfires', 'wildfires').replace('volcanoes', 'volcanic activity').replace('floods', 'floods').replace('drought', 'drought events')} detected in this region at this time. Planetary conditions nominal.
                </p>
              </div>
            </div>
          )}

          <canvas
            ref={canvasRef}
            width={1200}
            height={600}
            onClick={handleCanvasClick}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseLeave}
            onWheel={handleCanvasWheel}
            className="w-full h-auto cursor-crosshair"
          />

          <div className="absolute top-6 right-6 flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              className="p-3 bg-black/80 hover:bg-black/90 text-white rounded-xl border border-cyan-400/30 hover:border-cyan-400/50 transition-all backdrop-blur-xl shadow-lg"
            >
              <ZoomIn className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="p-3 bg-black/80 hover:bg-black/90 text-white rounded-xl border border-cyan-400/30 hover:border-cyan-400/50 transition-all backdrop-blur-xl shadow-lg"
            >
              <ZoomOut className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-black/80 backdrop-blur-xl rounded-2xl border border-cyan-400/30 shadow-xl">
            <div className="text-cyan-400 text-sm font-mono flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              Use scroll to zoom • Drag to pan • Click markers for details
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10 relative z-10">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg shadow-red-500/50 animate-pulse" />
              <span className="text-white/90 text-sm">Critical ({severityCounts.Critical})</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-orange-500 rounded-full shadow-lg shadow-orange-500/50 animate-pulse" />
              <span className="text-white/90 text-sm">High ({severityCounts.High})</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-lg shadow-yellow-500/50 animate-pulse" />
              <span className="text-white/90 text-sm">Medium ({severityCounts.Medium})</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50 animate-pulse" />
              <span className="text-white/90 text-sm">Low ({severityCounts.Low})</span>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {selectedEvent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="mt-6 p-6 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-400/30 rounded-2xl backdrop-blur-xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5 animate-pulse" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertCircle className="w-6 h-6 text-cyan-400" />
                      <h4 className="text-white text-xl">{selectedEvent.title}</h4>
                    </div>
                    <p className="text-white/60 text-sm ml-9">{selectedEvent.categories.map(c => c.title).join(', ')}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 ${
                    getEventSeverity(selectedEvent) === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-400/30' :
                    getEventSeverity(selectedEvent) === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-400/30' :
                    getEventSeverity(selectedEvent) === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30' :
                    'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30'
                  }`}>
                    <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    {getEventSeverity(selectedEvent)}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4">
                    <div className="text-white/60 text-xs mb-2 uppercase tracking-wider">Event ID</div>
                    <div className="text-white font-mono text-sm">{selectedEvent.id.substring(0, 20)}...</div>
                  </div>
                  <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4">
                    <div className="text-white/60 text-xs mb-2 uppercase tracking-wider">First Detected</div>
                    <div className="text-white text-sm">{new Date(selectedEvent.geometry[0]?.date || '').toLocaleDateString()}</div>
                  </div>
                  <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4">
                    <div className="text-white/60 text-xs mb-2 uppercase tracking-wider">Coordinates</div>
                    {clickedCoordinates && (
                      <div className="text-cyan-400 font-mono text-sm">
                        {clickedCoordinates.lat.toFixed(4)}°, {clickedCoordinates.lon.toFixed(4)}°
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* AI Predicted Threats Section (Interactive Background) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`relative overflow-hidden rounded-3xl border transition-all duration-500 ${
          showPredictionsPanel 
            ? 'bg-black/80 border-cyan-400/50 min-h-[600px]' 
            : 'bg-black/40 border-cyan-400/20 h-[100px] hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/20 cursor-pointer'
        }`}
        onClick={() => {
          if (!showPredictionsPanel) {
            if (predictions.length === 0) {
              handleGeneratePredictions();
            } else {
              setShowPredictionsPanel(true);
            }
          }
        }}
      >
        {/* Interactive Background Canvas */}
        <canvas
          ref={predictionCanvasRef}
          className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
        />
        
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 via-transparent to-purple-900/20 pointer-events-none" />

        {!showPredictionsPanel ? (
          <div className="relative z-10 w-full h-full flex items-center justify-between px-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-400/30 animate-pulse">
                <Brain className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-white text-xl font-light">AI Predicted Threats</h3>
                <p className="text-cyan-400/60 text-sm">Click to initialize predictive neural scan</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white/40">
              <Zap className="w-5 h-5" />
              <span className="font-mono text-sm">AWAITING ACTIVATION</span>
            </div>
          </div>
        ) : (
          <div className="relative z-10 p-8">
            <div className="flex flex-col gap-6 mb-8">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-2xl flex items-center gap-3">
                  <Brain className="w-8 h-8 text-cyan-400" />
                  AI Predictions
                </h3>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className={`px-4 py-2 rounded-xl border transition-all flex items-center gap-2 text-sm ${
                        showHistory 
                        ? 'bg-purple-500/20 border-purple-400/50 text-purple-400' 
                        : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <History className="w-4 h-4" />
                    History
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGeneratePredictions();
                    }}
                    disabled={loadingPredictions}
                    className="px-5 py-2 bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 rounded-xl hover:bg-cyan-500/20 transition-all disabled:opacity-50 flex items-center gap-2 text-sm"
                  >
                    {loadingPredictions ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                    Regenerate
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPredictionsPanel(false);
                    }}
                    className="p-2 text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {!showHistory && (
                  <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input 
                            type="text" 
                            value={predictionSearch}
                            onChange={(e) => setPredictionSearch(e.target.value)}
                            placeholder="Search by location (e.g., California, Tokyo)..."
                            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 transition-all"
                            onKeyDown={(e) => e.key === 'Enter' && handleGeneratePredictions()}
                        />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-white/40" />
                        <select 
                            value={predictionTimeframe} 
                            onChange={(e) => setPredictionTimeframe(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-400/50"
                        >
                            <option value="Next Day">Next Day</option>
                            <option value="Next Week">Next Week</option>
                            <option value="Next Month">Next Month</option>
                            <option value="Next Year">Next Year</option>
                            <option value="Next 10 Years">Next 10 Years</option>
                        </select>
                    </div>

                    <button 
                        onClick={() => handleGeneratePredictions()}
                        className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-xl transition-colors text-sm font-medium"
                    >
                        Apply
                    </button>
                  </div>
              )}
            </div>

            {showHistory ? (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white/80 text-lg">Prediction History</h4>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => {
                                    const data = PredictionHistoryService.exportHistory();
                                    const blob = new Blob([data], { type: 'application/json' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `prediction-history-${new Date().toISOString().split('T')[0]}.json`;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                }}
                                className="text-cyan-400 text-xs hover:underline flex items-center gap-1"
                            >
                                <Share2 className="w-3 h-3" />
                                Export History
                            </button>
                            <button 
                                onClick={handleClearHistory}
                                className="text-red-400 text-xs hover:underline"
                            >
                                Clear History
                            </button>
                        </div>
                    </div>
                    {predictionHistory.length === 0 ? (
                        <div className="text-center py-12 text-white/30">
                            <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            No history available yet.
                        </div>
                    ) : (
                        predictionHistory.map((entry) => (
                            <div 
                                key={entry.id} 
                                onClick={() => handleRestoreHistoryEntry(entry)}
                                className="bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 hover:border-cyan-400/30 transition-all cursor-pointer group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-cyan-400" />
                                        <span className="text-white font-medium">
                                            {new Date(entry.timestamp).toLocaleDateString()}
                                        </span>
                                        <span className="text-white/40 text-sm">
                                            {new Date(entry.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs border ${
                                        entry.riskLevel === 'Critical' ? 'bg-red-500/20 border-red-500/50 text-red-400' :
                                        entry.riskLevel === 'High' ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' :
                                        'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                                    }`}>
                                        {entry.riskLevel} Risk
                                    </span>
                                </div>
                                <p className="text-white/60 text-sm mb-3">{entry.summary}</p>
                                <div className="flex gap-2">
                                    <span className="text-xs bg-black/40 px-2 py-1 rounded text-white/40 group-hover:text-cyan-400 transition-colors">
                                        {entry.predictions.length} Predictions
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
            /* Content from previous modal */
            <div className="space-y-6">
              {predictionResponse && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                   <div className="p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                     <div className="text-white/60 text-xs mb-1 uppercase tracking-wider">Risk Level</div>
                     <div className="text-2xl text-orange-400 font-light">{predictionResponse.globalRiskLevel}</div>
                   </div>
                   <div className="p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                     <div className="text-white/60 text-xs mb-1 uppercase tracking-wider">Total Threats</div>
                     <div className="text-2xl text-white font-light">{predictionResponse.totalPredictions}</div>
                   </div>
                   <div className="p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                     <div className="text-white/60 text-xs mb-1 uppercase tracking-wider">Critical</div>
                     <div className="text-2xl text-red-400 font-light">{predictions.filter(p => p.severity === 'Critical').length}</div>
                   </div>
                   <div className="p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                     <div className="text-white/60 text-xs mb-1 uppercase tracking-wider">Confidence</div>
                     <div className="text-2xl text-cyan-400 font-light">High</div>
                   </div>
                </div>
              )}

              {loadingPredictions ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
                  <p className="text-cyan-400 font-mono animate-pulse">Analyzing planetary data streams...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Predictions List */}
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {predictions.map((prediction, index) => (
                      <motion.div
                        key={prediction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                          selectedPrediction?.id === prediction.id
                            ? 'bg-cyan-500/20 border-cyan-400/60 shadow-lg shadow-cyan-500/20'
                            : 'bg-white/5 border-white/10 hover:border-cyan-400/40 hover:bg-white/10'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPrediction(prediction);
                        }}
                      >
                         <div className="flex justify-between items-start mb-2">
                           <span className={`px-2 py-1 rounded text-xs font-medium ${
                             prediction.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                             prediction.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                             'bg-cyan-500/20 text-cyan-400'
                           }`}>
                             {prediction.severity}
                           </span>
                           <span className="text-white/40 text-xs">{prediction.timeframe}</span>
                         </div>
                         <h4 className="text-white font-medium mb-1">{prediction.disasterType}</h4>
                         <p className="text-white/60 text-sm mb-2">📍 {prediction.location}</p>
                         <div className="flex gap-3 text-xs text-white/40">
                           <span>Conf: {prediction.confidence}%</span>
                           <span>Pop: {prediction.affectedPopulation.toLocaleString()}</span>
                         </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Detailed View */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm h-fit">
                    {selectedPrediction ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key={selectedPrediction.id}
                      >
                        <div className="flex items-center gap-3 mb-6">
                           <div className={`p-3 rounded-full ${
                             selectedPrediction.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                             selectedPrediction.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                             'bg-cyan-500/20 text-cyan-400'
                           }`}>
                             <AlertTriangle className="w-6 h-6" />
                           </div>
                           <div>
                             <h3 className="text-white text-xl">{selectedPrediction.disasterType}</h3>
                             <p className="text-white/60 text-sm">Detected in {selectedPrediction.location}</p>
                           </div>
                        </div>

                        <div className="space-y-6">
                          <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                            <h5 className="text-cyan-400 text-sm mb-2 font-medium">AI Analysis</h5>
                            <p className="text-white/80 text-sm leading-relaxed">{selectedPrediction.description}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-white/40 text-xs mb-1">Impact Area</div>
                              <div className="text-white">{selectedPrediction.impactArea.toLocaleString()} km²</div>
                            </div>
                            <div>
                              <div className="text-white/40 text-xs mb-1">Affected Population</div>
                              <div className="text-white">{selectedPrediction.affectedPopulation.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-white/40 text-xs mb-1">Start Time</div>
                              <div className="text-white">{selectedPrediction.timeframe}</div>
                            </div>
                            <div>
                              <div className="text-white/40 text-xs mb-1">Confidence Score</div>
                              <div className="text-cyan-400">{selectedPrediction.confidence}%</div>
                            </div>
                          </div>
                          
                          <button className="w-full py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-400/30 rounded-xl transition-all flex items-center justify-center gap-2">
                            <Shield className="w-4 h-4" />
                            Initiate Response Protocol
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-white/40 py-12">
                        <Brain className="w-12 h-12 mb-4 opacity-50" />
                        <p>Select a prediction to view detailed analysis</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showLocationInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLocationInput(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="backdrop-blur-xl bg-gradient-to-br from-black/90 to-black/80 border border-cyan-400/30 rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white text-2xl mb-6 flex items-center gap-3">
                <MapPin className="w-7 h-7 text-yellow-400" />
                Track Location Coordinates
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-white/80 text-sm mb-2 block">Latitude (-90 to 90)</label>
                  <input
                    type="text"
                    value={locationInput.lat}
                    onChange={(e) => setLocationInput(prev => ({ ...prev, lat: e.target.value }))}
                    placeholder="e.g., -3.4653"
                    className="w-full px-5 py-4 bg-black/60 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/50 focus:bg-black/80 transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label className="text-white/80 text-sm mb-2 block">Longitude (-180 to 180)</label>
                  <input
                    type="text"
                    value={locationInput.lon}
                    onChange={(e) => setLocationInput(prev => ({ ...prev, lon: e.target.value }))}
                    placeholder="e.g., -62.2159"
                    className="w-full px-5 py-4 bg-black/60 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/50 focus:bg-black/80 transition-all duration-300"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleAnalyzeLocation}
                    disabled={analyzingLocation}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                  >
                    {analyzingLocation ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Analyze Location
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setShowLocationInput(false)}
                    className="px-6 py-4 bg-white/5 border border-white/20 text-white rounded-2xl hover:bg-white/10 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>

                {locationAnalysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-6 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-2xl"
                  >
                    <h4 className="text-cyan-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Analysis Results
                    </h4>
                    <div className="text-white/80 text-sm space-y-2">
                      <p><span className="text-white/60">Location:</span> {locationAnalysis.location}</p>
                      <p><span className="text-white/60">Assessment:</span> {locationAnalysis.riskAssessment}</p>
                      {locationAnalysis.threats && locationAnalysis.threats.length > 0 && (
                        <div>
                          <span className="text-white/60">Detected Threats:</span>
                          <ul className="mt-2 space-y-1">
                            {locationAnalysis.threats.map((threat: string, i: number) => (
                              <li key={i} className="text-orange-400 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                {threat}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEmailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEmailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="backdrop-blur-xl bg-gradient-to-br from-black/90 to-black/80 border border-blue-400/30 rounded-3xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white text-2xl mb-6 flex items-center gap-3">
                <Send className="w-7 h-7 text-blue-400" />
                Share Report via Email
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-white/80 text-sm mb-2 block">Recipient Email</label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="colleague@organization.com"
                    className="w-full px-5 py-4 bg-black/60 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-blue-400/50 focus:bg-black/80 transition-all duration-300"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleSendEmail}
                    disabled={sharing}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl hover:from-blue-400 hover:to-purple-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    {sharing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Report
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="px-6 py-4 bg-white/5 border border-white/20 text-white rounded-2xl hover:bg-white/10 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfigModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowConfigModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="backdrop-blur-xl bg-gradient-to-br from-black/90 to-black/80 border border-orange-400/30 rounded-3xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white text-2xl mb-6 flex items-center gap-3">
                <Shield className="w-7 h-7 text-orange-400" />
                Configure Notifications
              </h3>
              
              <div className="space-y-6">
                <div className="p-6 bg-orange-500/10 border border-orange-400/30 rounded-2xl">
                  <p className="text-white/80 text-sm mb-4">
                    Enable predictive disaster alerts using NASA/ISRO satellite data
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-white">Disaster Predictions</span>
                    <button
                      onClick={handleToggleNotifications}
                      className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                        notificationsEnabled ? 'bg-orange-500' : 'bg-white/20'
                      }`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ${
                        notificationsEnabled ? 'left-8' : 'left-1'
                      }`} />
                    </button>
                  </div>
                </div>
                
                <div className="text-white/60 text-sm space-y-2">
                  <p>• Scans every 15 seconds</p>
                  <p>• 7-day prediction window</p>
                  <p>• Browser notifications enabled</p>
                </div>
                
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl hover:from-orange-400 hover:to-red-400 transition-all duration-300 shadow-lg shadow-orange-500/20"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHistoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-8"
            onClick={() => setShowHistoryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-6xl h-full max-h-[90vh] bg-[#0A0A0A] border border-purple-500/30 rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-purple-500/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-900/20 to-transparent">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-400/30">
                    <History className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white text-2xl font-light">Mission Control Archives</h3>
                    <p className="text-purple-400/60 text-sm">Historical Predictive Analysis Logs</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="p-3 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content Grid */}
              <div className="flex-1 overflow-hidden flex">
                {/* Left Sidebar: History List */}
                <div className="w-1/3 border-r border-white/10 flex flex-col bg-black/20">
                    <div className="p-4 border-b border-white/5">
                        <h4 className="text-white/60 text-xs uppercase tracking-wider mb-2">Recorded Sessions</h4>
                        <div className="text-white text-sm">Total Entries: {predictionHistory.length}</div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                        {predictionHistory.length === 0 ? (
                            <div className="text-center py-12 text-white/30">
                                <History className="w-8 h-8 mx-auto mb-3 opacity-50" />
                                No archives found.
                            </div>
                        ) : (
                            predictionHistory.map((entry) => (
                                <div 
                                    key={entry.id}
                                    onClick={() => handleRestoreHistoryEntry(entry)} // For now, restore to main view or we could select strictly for this modal view
                                    className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-purple-400/30 transition-all cursor-pointer group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    
                                    <div className="flex justify-between items-start mb-2 pl-2">
                                        <span className="text-white font-mono text-sm">
                                            {new Date(entry.timestamp).toLocaleDateString()}
                                        </span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded border ${
                                            entry.riskLevel === 'Critical' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                                            entry.riskLevel === 'High' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
                                            'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                                        }`}>
                                            {entry.riskLevel}
                                        </span>
                                    </div>
                                    <div className="pl-2">
                                        <div className="text-white/40 text-xs mb-2">{new Date(entry.timestamp).toLocaleTimeString()}</div>
                                        <p className="text-white/80 text-sm line-clamp-2">{entry.summary}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    <div className="p-4 border-t border-white/10 bg-black/40">
                         <button 
                            onClick={() => {
                                const data = PredictionHistoryService.exportHistory();
                                const blob = new Blob([data], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `full_archive_${new Date().toISOString()}.json`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                            }}
                            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 hover:text-white transition-all text-sm flex items-center justify-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download Full Archive
                        </button>
                    </div>
                </div>

                {/* Right Content: Visualization (Mock of what's selected) */}
                <div className="flex-1 bg-black/40 p-8 overflow-y-auto custom-scrollbar">
                    {predictionHistory.length > 0 ? (
                        <div className="space-y-8">
                             {/* Visualize the most recent or selected entry's data roughly */}
                             <div className="grid grid-cols-3 gap-6">
                                <div className="p-6 bg-purple-500/10 border border-purple-400/20 rounded-2xl">
                                    <h5 className="text-purple-400 text-sm mb-2">Historical Accuracy</h5>
                                    <div className="text-3xl text-white font-light">94.2%</div>
                                </div>
                                <div className="p-6 bg-cyan-500/10 border border-cyan-400/20 rounded-2xl">
                                    <h5 className="text-cyan-400 text-sm mb-2">Data Points</h5>
                                    <div className="text-3xl text-white font-light">{predictionHistory.reduce((acc, curr) => acc + curr.predictions.length, 0).toLocaleString()}</div>
                                </div>
                                <div className="p-6 bg-blue-500/10 border border-blue-400/20 rounded-2xl">
                                    <h5 className="text-blue-400 text-sm mb-2">Locations Monitored</h5>
                                    <div className="text-3xl text-white font-light">142</div>
                                </div>
                             </div>

                             <div>
                                <h4 className="text-white text-lg mb-4 flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-purple-400" />
                                    Latest Archived Predictions
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {predictionHistory[0]?.predictions.slice(0, 6).map((pred, i) => (
                                        <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-white font-medium">{pred.location}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded ${
                                                    pred.severity === 'Critical' ? 'bg-red-500/20 text-red-400' : 
                                                    pred.severity === 'High' ? 'bg-orange-500/20 text-orange-400' : 'bg-cyan-500/20 text-cyan-400'
                                                }`}>{pred.severity}</span>
                                            </div>
                                            <p className="text-white/60 text-sm line-clamp-2">{pred.description}</p>
                                        </div>
                                    ))}
                                </div>
                             </div>
                             
                             <div className="p-6 bg-gradient-to-br from-purple-900/10 to-transparent border border-purple-500/20 rounded-2xl">
                                <h4 className="text-white mb-2">AI System Status</h4>
                                <p className="text-white/60 text-sm">
                                    The archival system is operating at optimal capacity. All predictive models are synchronized with the central neural net. 
                                    Click on any session in the sidebar to restore its state to the main view for detailed analysis.
                                </p>
                             </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-white/30">
                            <History className="w-16 h-16 mb-4 opacity-20" />
                            <p>No historical data available to visualize.</p>
                            <p className="text-sm mt-2">Run a new prediction scan to generate archives.</p>
                        </div>
                    )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gemini AI Predictions Panel (Moved Inline) */}
    </div>
  );
}