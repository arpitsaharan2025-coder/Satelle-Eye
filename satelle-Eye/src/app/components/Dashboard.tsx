import { useEffect, useMemo, useRef, useState } from 'react';
import { Clock, Globe2, Satellite, X } from 'lucide-react';
import { motion } from 'motion/react';
import { AIAnalysisEnhanced } from './AIAnalysisEnhanced';
import { GlobalDetectionMapEnhanced } from './GlobalDetectionMapEnhanced';
import { SATELLITES, SatelliteRecord } from '../data/localData';

interface DashboardProps {
  onClose: () => void;
}

export function Dashboard({ onClose }: DashboardProps) {
  const [mode, setMode] = useState<'Satellites' | 'Global Detection' | 'AI Analysis'>('Satellites');
  const [time, setTime] = useState(new Date());
  const [selected, setSelected] = useState<SatelliteRecord | null>(null);
  const [filter, setFilter] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const positions = useRef(new Map<string, { x: number; y: number }>());

  useEffect(() => {
    const id = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const satellites = useMemo(() => SATELLITES.filter(s => s.id.toLowerCase().includes(filter.toLowerCase())), [filter]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * ratio;
      canvas.height = canvas.clientHeight * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    let frame = 0;
    const draw = (timeMs: number) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#02060b';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(0,238,255,.10)';
      ctx.lineWidth = 1;
      for (let lat = -60; lat <= 60; lat += 30) {
        const y = ((90 - lat) / 180) * height;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }
      for (let lon = -180; lon <= 180; lon += 30) {
        const x = ((lon + 180) / 360) * width;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }

      satellites.forEach((sat, index) => {
        const x = ((sat.lon + 180) / 360) * width;
        const y = ((90 - sat.lat) / 180) * height;
        positions.current.set(sat.id, { x, y });
        const phase = timeMs / 3000 + index;
        const radius = 50 + (Math.sin(phase) + 1) * 18;

        const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
        glow.addColorStop(0, 'rgba(0,238,255,.20)');
        glow.addColorStop(1, 'rgba(0,238,255,0)');
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();

        ctx.strokeStyle = 'rgba(0,238,255,.22)';
        ctx.beginPath(); ctx.ellipse(x, y, 85, 28, phase * .2, 0, Math.PI * 2); ctx.stroke();

        ctx.fillStyle = '#39efff';
        ctx.shadowColor = '#39efff';
        ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(x, y, selected?.id === sat.id ? 6 : 4, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = 'rgba(255,255,255,.75)';
        ctx.font = '11px ui-monospace, monospace';
        ctx.fillText(sat.id, x + 9, y - 8);
      });

      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, [satellites, selected]);

  const handleMapClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const closest = satellites
      .map(sat => ({ sat, point: positions.current.get(sat.id) }))
      .filter(item => item.point)
      .map(item => ({ ...item, distance: Math.hypot(x - item.point!.x, y - item.point!.y) }))
      .sort((a, b) => a.distance - b.distance)[0];
    setSelected(closest && closest.distance < 22 ? closest.sat : null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-black overflow-auto">
      <div className="min-h-screen p-4 md:p-6">
        <header className="panel flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white/55 text-sm font-mono">
              <Clock className="w-4 h-4" />
              {time.toISOString().replace('T', ' ').slice(0, 19)} UTC
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">OFFLINE MODE</span>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {(['Satellites', 'Global Detection', 'AI Analysis'] as const).map(item => (
              <button key={item} onClick={() => setMode(item)} className={`px-4 py-2 rounded-lg text-sm transition ${mode === item ? 'bg-cyan-400/10 text-cyan-300 border border-cyan-400/30' : 'text-white/55 hover:text-white'}`}>{item}</button>
            ))}
            <button onClick={onClose} className="ml-2 p-2 text-white/55 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
        </header>

        {mode === 'Satellites' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 panel">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-white text-lg flex items-center gap-2"><Globe2 className="w-5 h-5 text-cyan-300" />Global Satellite Tracking Map</h2>
                  <p className="text-white/40 text-xs mt-1">Deterministic orbital visualization using local sample telemetry</p>
                </div>
                <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter satellites..." className="field md:w-52" />
              </div>
              <canvas ref={canvasRef} onClick={handleMapClick} className="w-full h-[520px] rounded-xl border border-cyan-400/10 cursor-crosshair" />
            </div>

            <aside className="panel">
              <div className="flex items-center gap-2 text-cyan-300 mb-4"><Satellite className="w-5 h-5" /> Tracked Assets</div>
              <div className="space-y-2">
                {satellites.map(sat => (
                  <button key={sat.id} onClick={() => setSelected(sat)} className={`w-full text-left rounded-xl p-3 border transition ${selected?.id === sat.id ? 'border-cyan-400/40 bg-cyan-400/10' : 'border-white/10 bg-white/[.02] hover:bg-white/[.05]'}`}>
                    <div className="text-white text-sm">{sat.id}</div>
                    <div className="text-white/40 text-xs mt-1">{sat.alt} km · {sat.operator}</div>
                  </button>
                ))}
              </div>
              {selected && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                  <div className="text-white text-lg">{selected.id}</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><div className="metric-label">Altitude</div><div className="metric-value">{selected.alt} km</div></div>
                    <div><div className="metric-label">Speed</div><div className="metric-value">{selected.speed} km/s</div></div>
                    <div><div className="metric-label">Latitude</div><div className="metric-value">{selected.lat.toFixed(2)}°</div></div>
                    <div><div className="metric-label">Longitude</div><div className="metric-value">{selected.lon.toFixed(2)}°</div></div>
                  </div>
                  <div className="text-xs text-white/45">{selected.purpose} · {selected.band}</div>
                </div>
              )}
            </aside>
          </div>
        )}

        {mode === 'Global Detection' && <GlobalDetectionMapEnhanced onNavigateToAIAnalysis={() => setMode('AI Analysis')} />}
        {mode === 'AI Analysis' && <AIAnalysisEnhanced />}
      </div>
    </motion.div>
  );
}
