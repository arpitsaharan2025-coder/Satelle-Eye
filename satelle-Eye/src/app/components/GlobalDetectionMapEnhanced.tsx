import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, Download, MapPin, Pause, Play, RotateCcw, Search, Sparkles, ZoomIn, ZoomOut } from 'lucide-react';
import { motion } from 'motion/react';
import { DETECTION_DATA, DetectionEvent, categoryLabel, severityColor } from '../data/localData';
import worldMapImage from '../../assets/b448c7fa7d72d408931dc032738244e099a9bf41.png';

interface GlobalDetectionMapProps {
  onNavigateToAIAnalysis?: () => void;
}

const categories = ['all', 'wildfires', 'volcanoes', 'severeStorms', 'floods', 'drought', 'deforestation'];

export function GlobalDetectionMapEnhanced({ onNavigateToAIAnalysis }: GlobalDetectionMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<DetectionEvent | null>(null);
  const [severity, setSeverity] = useState('all');
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [running, setRunning] = useState(true);
  const [scan, setScan] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [autoCycle, setAutoCycle] = useState(true);

  const events = useMemo(() => DETECTION_DATA.filter(event => {
    const matchesSeverity = severity === 'all' || event.severity === severity;
    const matchesCategory = category === 'all' || event.category === category;
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || `${event.title} ${event.description} ${event.category}`.toLowerCase().includes(q);
    return matchesSeverity && matchesCategory && matchesQuery;
  }), [severity, category, query]);

  useEffect(() => {
    if (!autoCycle || events.length === 0) return;
    const id = window.setInterval(() => {
      setSelectedEvent(current => {
        const currentIndex = current ? events.findIndex(e => e.id === current.id) : -1;
        return events[(currentIndex + 1 + events.length) % events.length];
      });
    }, 7000);
    return () => window.clearInterval(id);
  }, [autoCycle, events]);

  useEffect(() => {
    const image = new Image();
    image.src = worldMapImage;
    image.onload = () => {
      imageRef.current = image;
      setImageLoaded(true);
    };
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setScan(value => (value + 1) % 100), 180);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded) return;
    const ctx = canvas.getContext('2d');
    const image = imageRef.current;
    if (!ctx || !image) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(rect.height * ratio));
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = (time: number) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const scale = zoom;
      const mapWidth = width * scale;
      const mapHeight = height * scale;
      const offsetX = (width - mapWidth) / 2 + pan.x;
      const offsetY = (height - mapHeight) / 2 + pan.y;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#02060b';
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 0.88;
      ctx.drawImage(image, offsetX, offsetY, mapWidth, mapHeight);
      ctx.globalAlpha = 1;

      const project = (lat: number, lon: number) => ({
        x: ((lon + 180) / 360) * mapWidth + offsetX,
        y: ((90 - lat) / 180) * mapHeight + offsetY
      });

      ctx.strokeStyle = 'rgba(72, 221, 255, 0.14)';
      ctx.lineWidth = 1;
      for (let lat = -60; lat <= 60; lat += 30) {
        const a = project(lat, -180);
        const b = project(lat, 180);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      for (let lon = -180; lon <= 180; lon += 60) {
        const a = project(-90, lon);
        const b = project(90, lon);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      const pulse = Math.sin(time / 320) * 0.22 + 1;
      events.forEach(event => {
        const point = project(event.lat, event.lon);
        if (point.x < -40 || point.x > width + 40 || point.y < -40 || point.y > height + 40) return;
        const color = severityColor(event.severity);
        const selected = selectedEvent?.id === event.id;

        ctx.beginPath();
        ctx.fillStyle = `${color}18`;
        ctx.arc(point.x, point.y, 22 * pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = `${color}99`;
        ctx.lineWidth = selected ? 3 : 1.5;
        ctx.arc(point.x, point.y, selected ? 13 : 8, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = color;
        ctx.arc(point.x, point.y, selected ? 6 : 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (selected) {
          ctx.fillStyle = 'rgba(2,6,11,.92)';
          ctx.fillRect(point.x + 12, point.y - 31, 150, 26);
          ctx.fillStyle = '#e9fbff';
          ctx.font = '11px monospace';
          ctx.fillText(event.title.slice(0, 24), point.x + 20, point.y - 14);
        }
      });

      if (running) {
        const sweep = (scan / 100) * width;
        const gradient = ctx.createLinearGradient(sweep - 90, 0, sweep + 10, 0);
        gradient.addColorStop(0, 'rgba(0,255,255,0)');
        gradient.addColorStop(0.8, 'rgba(0,255,255,.12)');
        gradient.addColorStop(1, 'rgba(0,255,255,.45)');
        ctx.fillStyle = gradient;
        ctx.fillRect(sweep - 90, 0, 100, height);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [events, imageLoaded, pan, running, scan, selectedEvent, zoom]);

  const pointForEvent = (event: DetectionEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const mapWidth = width * zoom;
    const mapHeight = height * zoom;
    return {
      x: ((event.lon + 180) / 360) * mapWidth + (width - mapWidth) / 2 + pan.x,
      y: ((90 - event.lat) / 180) * mapHeight + (height - mapHeight) / 2 + pan.y
    };
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const nearest = events
      .map(event => ({ event, point: pointForEvent(event) }))
      .filter(item => item.point)
      .map(item => ({ ...item, distance: Math.hypot(x - item.point!.x, y - item.point!.y) }))
      .sort((a, b) => a.distance - b.distance)[0];

    setSelectedEvent(nearest && nearest.distance < 24 ? nearest.event : null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const next = Math.min(4, Math.max(0.75, zoom + (e.deltaY > 0 ? -0.15 : 0.15)));
    setZoom(next);
    if (next <= 1) setPan({ x: 0, y: 0 });
  };

  const exportCsv = () => {
    const header = 'id,title,category,severity,latitude,longitude,confidence,area_km2,detected_at';
    const rows = events.map(e => [e.id, e.title, e.category, e.severity, e.lat, e.lon, e.confidence, e.areaKm2, e.detectedAt].map(value => `"${String(value).replaceAll('"', '""')}"`).join(','));
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `satell-eye-detections-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button onClick={() => setRunning(value => !value)} className="panel-button">
          {running ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {running ? 'Pause Scan' : 'Start Scan'}
        </button>
        <button onClick={() => setAutoCycle(value => !value)} className="panel-button">
          <RotateCcw className="w-5 h-5" />
          {autoCycle ? 'Auto Rotate: ON' : 'Auto Rotate: OFF'}
        </button>
        <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="panel-button">
          <RotateCcw className="w-5 h-5" /> Reset View
        </button>
        <button onClick={onNavigateToAIAnalysis} className="panel-button">
          <Sparkles className="w-5 h-5" /> AI Analysis
        </button>
        <button onClick={exportCsv} className="panel-button">
          <Download className="w-5 h-5" /> Export CSV
        </button>
      </div>

      <div className="panel">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-300">
              <Activity className="w-5 h-5" />
              <h3 className="text-white text-lg">Global Satellite Detection Map</h3>
            </div>
            <p className="text-white/45 text-xs mt-1">Offline Earth-observation event layer • local dataset • no network calls</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            LOCAL MONITOR
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search detections..." className="field pl-10" />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)} className="field">
            {categories.map(item => <option key={item} value={item}>{item === 'all' ? 'All categories' : categoryLabel(item as DetectionEvent['category'])}</option>)}
          </select>
          <select value={severity} onChange={e => setSeverity(e.target.value)} className="field">
            {['all', 'Critical', 'High', 'Medium', 'Low'].map(item => <option key={item} value={item}>{item === 'all' ? 'All severity' : item}</option>)}
          </select>
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-cyan-400/15 bg-black">
          <canvas ref={canvasRef} className="w-full h-[560px] block cursor-crosshair touch-none" onClick={handleClick} onWheel={handleWheel}
            onMouseDown={e => setDrag({ x: e.clientX, y: e.clientY })}
            onMouseMove={e => { if (drag) { setPan(value => ({ x: value.x + e.clientX - drag.x, y: value.y + e.clientY - drag.y })); setDrag({ x: e.clientX, y: e.clientY }); } }}
            onMouseUp={() => setDrag(null)} onMouseLeave={() => setDrag(null)} />
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button onClick={() => setZoom(value => Math.min(4, value + .15))} className="map-control"><ZoomIn className="w-4 h-4" /></button>
            <button onClick={() => setZoom(value => Math.max(.75, value - .15))} className="map-control"><ZoomOut className="w-4 h-4" /></button>
          </div>
          <div className="absolute bottom-4 left-4 px-3 py-2 rounded-lg bg-black/70 border border-white/10 text-[11px] text-white/55">
            Scroll to zoom · drag to pan · click a marker
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4">
          {['Critical', 'High', 'Medium', 'Low'].map(item => {
            const count = events.filter(event => event.severity === item).length;
            return <div key={item} className="rounded-xl border border-white/10 bg-white/[.03] p-3"><div className="text-xs text-white/45">{item}</div><div className="text-xl text-white mt-1">{count}</div></div>;
          })}
          <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/[.04] p-3"><div className="text-xs text-cyan-300/60">Visible</div><div className="text-xl text-cyan-200 mt-1">{events.length}</div></div>
        </div>
      </div>

      {selectedEvent && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="panel border-cyan-400/25">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-cyan-300" />
                <span className="text-xs text-cyan-300 font-mono">{selectedEvent.id}</span>
                <span className="text-xs px-2 py-1 rounded-full" style={{ color: severityColor(selectedEvent.severity), backgroundColor: `${severityColor(selectedEvent.severity)}18` }}>{selectedEvent.severity}</span>
              </div>
              <h4 className="text-white text-xl">{selectedEvent.title}</h4>
              <p className="text-cyan-300/80 text-sm mt-1 font-mono">
                Location: {selectedEvent.lat.toFixed(3)}°, {selectedEvent.lon.toFixed(3)}°
              </p>
              <p className="text-white/55 mt-1">{selectedEvent.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 min-w-[260px]">
              <div><div className="metric-label">Confidence</div><div className="metric-value">{selectedEvent.confidence}%</div></div>
              <div><div className="metric-label">Area</div><div className="metric-value">{selectedEvent.areaKm2} km²</div></div>
              <div><div className="metric-label">Latitude</div><div className="metric-value">{selectedEvent.lat.toFixed(3)}°</div></div>
              <div><div className="metric-label">Longitude</div><div className="metric-value">{selectedEvent.lon.toFixed(3)}°</div></div>
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
}
