import { useRef, useState, type ReactNode } from 'react';
import { AlertCircle, Activity, Brain, Database, Image as ImageIcon, Loader2, MapPin, Search, TrendingUp, Upload, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AnalysisResult {
  detectedClass: string;
  classConfidence: number;
  location: string;
  coordinates: { lat: number; lon: number };
  confidence: number;
  landCoverScores: Record<string, number>;
  environmentalData: Record<string, string>;
  recommendations: string[];
  aiModelData: {
    modelName: string;
    accuracy: number;
    processingTime: number;
    dataPoints: number;
    source?: string;
  };
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export function AIAnalysis() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [locationQuery, setLocationQuery] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setResult(null);
    setError('');
    const reader = new FileReader();
    reader.onload = event => setUploadedImage(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    setError('');
    try {
      const form = new FormData();
      form.append('image', selectedFile);
      const response = await fetch(`${API_BASE}/api/analyze`, { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Analysis failed.');
      setResult(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const analyzeLocation = () => {
    const coordinates = locationQuery.match(/(-?\\d+(?:\\.\\d+)?)\\s*[, ]\\s*(-?\\d+(?:\\.\\d+)?)/);
    setResult({
      detectedClass: 'Location selected',
      classConfidence: 100,
      location: locationQuery,
      coordinates: {
        lat: coordinates ? Number(coordinates[1]) : 0,
        lon: coordinates ? Number(coordinates[2]) : 0,
      },
      confidence: 1,
      landCoverScores: {},
      environmentalData: {
        landUse: 'Upload a satellite image for land-cover classification.',
        vegetation: 'Not analyzed.',
        waterBodies: 'Not analyzed.',
        urbanDensity: 'Not analyzed.',
        deforestation: 'Not analyzed.',
        naturalDisasters: 'Not analyzed.',
      },
      recommendations: ['Upload a geotagged satellite image for AI classification and exact coordinates.'],
      aiModelData: {
        modelName: 'Location mode',
        accuracy: 0,
        processingTime: 0,
        dataPoints: 0,
        source: 'Manual location',
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-md bg-gradient-to-br from-purple-500/20 to-cyan-500/10 border border-purple-400/30 rounded-2xl p-6">
        <h3 className="text-white text-2xl mb-2 flex items-center gap-2">
          <Brain className="w-7 h-7 text-purple-400" />
          AI-Powered Satellite Image Analysis
        </h3>
        <p className="text-white/60">Upload an image and the local Python service classifies water, vegetation, urban, bare land and cloud classes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6">
          <h4 className="text-white mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-cyan-400" />
            Upload Satellite Image
          </h4>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-cyan-400/50 hover:bg-white/5 transition-all"
          >
            {uploadedImage ? (
              <img src={uploadedImage} alt="Uploaded satellite image" className="w-full h-64 object-cover rounded-lg" />
            ) : (
              <div className="space-y-3 py-8">
                <ImageIcon className="w-12 h-12 text-white/40 mx-auto" />
                <p className="text-white">Click to upload a satellite image</p>
                <p className="text-white/50 text-sm">JPG and PNG with optional GPS EXIF</p>
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleImageUpload} />
          <button
            onClick={analyzeImage}
            disabled={!selectedFile || analyzing}
            className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
            {analyzing ? 'Analyzing satellite image...' : 'Run AI Analysis'}
          </button>
          {error && <div className="mt-4 text-red-300 text-sm">{error}</div>}
        </div>

        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6">
          <h4 className="text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-pink-400" />
            Location
          </h4>
          <input
            value={locationQuery}
            onChange={event => setLocationQuery(event.target.value)}
            onKeyDown={event => event.key === 'Enter' && analyzeLocation()}
            placeholder="Place name or latitude, longitude"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40"
          />
          <button onClick={analyzeLocation} disabled={!locationQuery.trim()} className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl disabled:opacity-40 flex items-center justify-center gap-2">
            <Search className="w-5 h-5" />
            Set Location
          </button>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="p-3 bg-white/5 rounded-xl">
              <div className="text-white/50 text-xs">Model</div>
              <div className="text-white text-sm">Multi-Class U-Net</div>
            </div>
            <div className="p-3 bg-white/5 rounded-xl">
              <div className="text-white/50 text-xs">Classes</div>
              <div className="text-white text-sm">6 land-cover classes</div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="backdrop-blur-md bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-2xl p-6">
            <h4 className="text-white text-xl mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
              AI Analysis Results
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Metric icon={<Brain />} title="Detected" value={result.detectedClass} />
              <Metric icon={<Activity />} title="Confidence" value={`${result.classConfidence.toFixed(1)}%`} />
              <Metric icon={<Zap />} title="Processing" value={`${result.aiModelData.processingTime.toFixed(2)}s`} />
              <Metric icon={<Database />} title="Model" value={result.aiModelData.modelName} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-white/50 text-sm mb-2">Location</div>
                  <div className="text-white text-lg">{result.location}</div>
                  {result.coordinates.lat !== 0 || result.coordinates.lon !== 0 ? (
                    <div className="text-cyan-400 text-sm mt-2">
                      {result.coordinates.lat.toFixed(5)}°, {result.coordinates.lon.toFixed(5)}°
                    </div>
                  ) : null}
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-white/50 text-sm mb-3">Land-Cover Scores</div>
                  <div className="space-y-3">
                    {Object.entries(result.landCoverScores).map(([name, score]) => (
                      <div key={name}>
                        <div className="flex justify-between text-sm text-white/80">
                          <span>{name}</span>
                          <span>{score.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 mt-1 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full bg-cyan-400" style={{ width: `${Math.min(100, score)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-white/50 text-sm mb-3">Environmental Analysis</div>
                  {Object.entries(result.environmentalData).map(([key, value]) => (
                    <div key={key} className="mb-3">
                      <div className="text-white/70 text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                      <div className="text-white/90 text-sm">{value}</div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-orange-500/10 border border-orange-400/30 rounded-xl">
                  <div className="text-white mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-400" />
                    Recommendations
                  </div>
                  {result.recommendations.map(item => <div key={item} className="text-white/80 text-sm mb-2">• {item}</div>)}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Metric({ icon, title, value }: { icon: ReactNode; title: string; value: string }) {
  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
      <div className="text-cyan-400 text-sm mb-2 flex items-center gap-2">{icon}{title}</div>
      <div className="text-white text-lg break-words">{value}</div>
    </div>
  );
}
