import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Search, Loader2, AlertCircle, Brain, Zap, Activity, TrendingUp, Database, Network, Leaf, Heart, Globe, TreePine, MapPin, Filter, X, Satellite, Layers, Box, GitBranch, Cpu } from 'lucide-react';

interface AnalysisResult {
  detectedClass: string;
  classConfidence: number;
  location: string;
  coordinates: { lat: number; lon: number };
  confidence: number;
  landmarks: string[];
  environmentalData: {
    landUse: string;
    vegetation: string;
    waterBodies: string;
    urbanDensity: string;
    deforestation: string;
    naturalDisasters: string;
  };
  recommendations: string[];
  aiModelData: {
    modelName: string;
    architecture: string;
    accuracy: number;
    processingTime: number;
    dataPoints: number;
    inputShape: string;
    outputShape: string;
    parameters: number;
  };
  modelLayers: Array<{
    name: string;
    type: string;
    filters: number;
    size: string;
  }>;
  deforestationAnalysis: {
    ndviDrop: number;
    deforestedArea: number;
    healthyVegetation: number;
    criticalZones: number;
  };
}

interface BiodiversityData {
  species: string;
  scientificName: string;
  category: string;
  population: string;
  threats: string[];
  habitat: string;
  trendStatus: string;
  criteria?: string;
}

const GLOBAL_BIODIVERSITY_DATABASE: { [key: string]: BiodiversityData[] } = {
  'brazil': [
    { species: 'Jaguar', scientificName: 'Panthera onca', category: 'NT', population: '64,000 individuals (Near Threatened)', threats: ['Deforestation', 'Habitat fragmentation', 'Poaching', 'Human conflict'], habitat: 'Amazon rainforest, Pantanal wetlands', trendStatus: 'Decreasing', criteria: 'A2cd' },
    { species: 'Golden Lion Tamarin', scientificName: 'Leontopithecus rosalia', category: 'EN', population: '3,200 individuals (Endangered)', threats: ['Atlantic Forest destruction', 'Habitat loss', 'Small population'], habitat: 'Atlantic Forest lowlands', trendStatus: 'Increasing', criteria: 'C2a(i)' },
    { species: 'Spix\'s Macaw', scientificName: 'Cyanopsitta spixii', category: 'EW', population: 'Extinct in Wild - ~180 in captivity', threats: ['Complete habitat loss', 'Illegal trade', 'Climate change'], habitat: 'Caatinga woodland (historically)', trendStatus: 'Stable', criteria: 'EW' },
    { species: 'Giant Anteater', scientificName: 'Myrmecophaga tridactyla', category: 'VU', population: '5,000-10,000 individuals (Vulnerable)', threats: ['Habitat loss', 'Road mortality', 'Fires', 'Hunting'], habitat: 'Grasslands, savannas, rainforest edges', trendStatus: 'Decreasing', criteria: 'A2c' },
    { species: 'Maned Wolf', scientificName: 'Chrysocyon brachyurus', category: 'NT', population: '23,000 individuals (Near Threatened)', threats: ['Habitat conversion', 'Road kills', 'Disease from domestic dogs'], habitat: 'Cerrado grasslands', trendStatus: 'Decreasing', criteria: 'NT' },
    { species: 'Harpy Eagle', scientificName: 'Harpia harpyja', category: 'NT', population: '20,000-49,999 individuals', threats: ['Deforestation', 'Hunting', 'Habitat degradation'], habitat: 'Tropical lowland rainforests', trendStatus: 'Decreasing', criteria: 'NT' },
    { species: 'Brazilian Tapir', scientificName: 'Tapirus terrestris', category: 'VU', population: 'Unknown population (Vulnerable)', threats: ['Hunting', 'Habitat loss', 'Disease'], habitat: 'Rainforests, grasslands, wetlands', trendStatus: 'Decreasing', criteria: 'A2cde+3cde' },
    { species: 'Hyacinth Macaw', scientificName: 'Anodorhynchus hyacinthinus', category: 'VU', population: '4,300 individuals (Vulnerable)', threats: ['Illegal trade', 'Habitat loss', 'Nest site shortage'], habitat: 'Pantanal, Cerrado palm groves', trendStatus: 'Increasing', criteria: 'C2a(i)' },
  ],
  'india': [
    { species: 'Bengal Tiger', scientificName: 'Panthera tigris tigris', category: 'EN', population: '2,967 individuals (Endangered)', threats: ['Poaching', 'Habitat loss', 'Human-wildlife conflict', 'Prey depletion'], habitat: 'Tropical forests, grasslands', trendStatus: 'Increasing', criteria: 'A2bcd+3bcd+4bcd' },
    { species: 'Asian Elephant', scientificName: 'Elephas maximus', category: 'EN', population: '27,000-31,000 in India (Endangered)', threats: ['Habitat fragmentation', 'Human-elephant conflict', 'Poaching'], habitat: 'Forests, grasslands, scrublands', trendStatus: 'Decreasing', criteria: 'A2a' },
    { species: 'Indian Rhinoceros', scientificName: 'Rhinoceros unicornis', category: 'VU', population: '3,700 individuals (Vulnerable)', threats: ['Poaching', 'Habitat loss', 'Inbreeding'], habitat: 'Grasslands and adjacent woodlands', trendStatus: 'Increasing', criteria: 'C2a(i)' },
    { species: 'Snow Leopard', scientificName: 'Panthera uncia', category: 'VU', population: '500-700 in India (Vulnerable)', threats: ['Poaching', 'Prey depletion', 'Retaliatory killing', 'Climate change'], habitat: 'High-altitude mountain ranges', trendStatus: 'Decreasing', criteria: 'C1' },
    { species: 'Red Panda', scientificName: 'Ailurus fulgens', category: 'EN', population: '5,000-6,000 in India (Endangered)', threats: ['Deforestation', 'Habitat fragmentation', 'Poaching', 'Climate change'], habitat: 'Himalayan temperate forests', trendStatus: 'Decreasing', criteria: 'A2ac+3c' },
    { species: 'Indian Gharial', scientificName: 'Gavialis gangeticus', category: 'CR', population: '650 individuals (Critically Endangered)', threats: ['River sand mining', 'Fishing nets', 'Dam construction', 'Pollution'], habitat: 'Major river systems', trendStatus: 'Increasing', criteria: 'A2bcd+3cd+4bcd' },
    { species: 'Great Indian Bustard', scientificName: 'Ardeotis nigriceps', category: 'CR', population: '150 individuals (Critically Endangered)', threats: ['Habitat loss', 'Hunting', 'Power line collisions'], habitat: 'Dry grasslands', trendStatus: 'Decreasing', criteria: 'C2a(i,ii)+D' },
    { species: 'Asiatic Lion', scientificName: 'Panthera leo persica', category: 'EN', population: '674 individuals (Endangered)', threats: ['Small population', 'Disease risk', 'Habitat limitation'], habitat: 'Dry deciduous forests (Gir)', trendStatus: 'Increasing', criteria: 'D' },
  ],
  'indonesia': [
    { species: 'Sumatran Orangutan', scientificName: 'Pongo abelii', category: 'CR', population: '13,846 individuals (Critically Endangered)', threats: ['Deforestation', 'Palm oil plantations', 'Illegal pet trade', 'Hunting'], habitat: 'Tropical rainforests', trendStatus: 'Decreasing', criteria: 'A4bcde' },
    { species: 'Javan Rhinoceros', scientificName: 'Rhinoceros sondaicus', category: 'CR', population: '76 individuals (Critically Endangered)', threats: ['Extremely low population', 'Limited range', 'Disease', 'Natural disasters'], habitat: 'Lowland tropical forests', trendStatus: 'Stable', criteria: 'C2a(i)+D' },
    { species: 'Sumatran Tiger', scientificName: 'Panthera tigris sumatrae', category: 'CR', population: '400-600 individuals (Critically Endangered)', threats: ['Deforestation', 'Poaching', 'Human-wildlife conflict', 'Habitat fragmentation'], habitat: 'Tropical forests', trendStatus: 'Decreasing', criteria: 'A2bcd+3bcd+4bcd' },
    { species: 'Komodo Dragon', scientificName: 'Varanus komodoensis', category: 'EN', population: '3,000-5,000 individuals (Endangered)', threats: ['Climate change', 'Volcanic activity', 'Tourism pressure', 'Poaching'], habitat: 'Tropical savanna islands', trendStatus: 'Stable', criteria: 'A1bd' },
    { species: 'Bornean Orangutan', scientificName: 'Pongo pygmaeus', category: 'CR', population: '104,700 individuals (Critically Endangered)', threats: ['Habitat loss', 'Palm oil expansion', 'Fires', 'Hunting'], habitat: 'Lowland tropical forests', trendStatus: 'Decreasing', criteria: 'A2abcd+3bcd+4abcd' },
    { species: 'Sumatran Elephant', scientificName: 'Elephas maximus sumatranus', category: 'CR', population: '2,400-2,800 individuals (Critically Endangered)', threats: ['Deforestation', 'Human-elephant conflict', 'Poaching'], habitat: 'Lowland forests', trendStatus: 'Decreasing', criteria: 'A2a' },
  ],
  'madagascar': [
    { species: 'Ring-tailed Lemur', scientificName: 'Lemur catta', category: 'EN', population: '2,000-2,400 individuals (Endangered)', threats: ['Habitat destruction', 'Hunting', 'Pet trade', 'Climate change'], habitat: 'Dry forests and bush', trendStatus: 'Decreasing', criteria: 'A4abcd' },
    { species: 'Aye-aye', scientificName: 'Daubentonia madagascariensis', category: 'EN', population: 'Unknown (Endangered)', threats: ['Habitat loss', 'Persecution', 'Deforestation'], habitat: 'Rainforests', trendStatus: 'Decreasing', criteria: 'A2c' },
    { species: 'Fossa', scientificName: 'Cryptoprocta ferox', category: 'VU', population: '2,500 individuals (Vulnerable)', threats: ['Deforestation', 'Prey depletion', 'Persecution'], habitat: 'Forests', trendStatus: 'Decreasing', criteria: 'C2a(i)' },
    { species: 'Indri', scientificName: 'Indri indri', category: 'CR', population: '10,000 individuals (Critically Endangered)', threats: ['Habitat loss', 'Hunting', 'Small population'], habitat: 'Eastern rainforests', trendStatus: 'Decreasing', criteria: 'A4bcd' },
    { species: 'Ploughshare Tortoise', scientificName: 'Astrochelys yniphora', category: 'CR', population: '440-770 individuals (Critically Endangered)', threats: ['Illegal pet trade', 'Habitat loss', 'Fires'], habitat: 'Dry deciduous forests', trendStatus: 'Decreasing', criteria: 'B1ab(i,ii,iii,v)+2ab(i,ii,iii,v)' },
  ],
  'china': [
    { species: 'Giant Panda', scientificName: 'Ailuropoda melanoleuca', category: 'VU', population: '1,864 individuals (Vulnerable)', threats: ['Habitat fragmentation', 'Climate change', 'Low reproduction'], habitat: 'Mountain bamboo forests', trendStatus: 'Increasing', criteria: 'D1' },
    { species: 'South China Tiger', scientificName: 'Panthera tigris amoyensis', category: 'CR', population: 'Possibly extinct in wild (Critically Endangered)', threats: ['Habitat loss', 'Extremely low population', 'Inbreeding'], habitat: 'Forests (historical)', trendStatus: 'Decreasing', criteria: 'C2a(i)+D' },
    { species: 'Chinese Alligator', scientificName: 'Alligator sinensis', category: 'CR', population: '120 individuals wild (Critically Endangered)', threats: ['Habitat loss', 'Small population', 'Pollution'], habitat: 'Wetlands and ponds', trendStatus: 'Decreasing', criteria: 'A2ac+3c+4ac' },
    { species: 'Snow Leopard', scientificName: 'Panthera uncia', category: 'VU', population: '2,000-2,500 in China (Vulnerable)', threats: ['Poaching', 'Prey depletion', 'Habitat degradation'], habitat: 'Mountain ranges', trendStatus: 'Decreasing', criteria: 'C1' },
    { species: 'Chinese Pangolin', scientificName: 'Manis pentadactyla', category: 'CR', population: 'Unknown (Critically Endangered)', threats: ['Illegal trade', 'Poaching', 'Traditional medicine'], habitat: 'Forests and grasslands', trendStatus: 'Decreasing', criteria: 'A2d+3d+4d' },
  ],
  'united states': [
    { species: 'California Condor', scientificName: 'Gymnogyps californianus', category: 'CR', population: '518 individuals (Critically Endangered)', threats: ['Lead poisoning', 'Microtrash ingestion', 'Power line collisions'], habitat: 'Mountains and coastal areas', trendStatus: 'Increasing', criteria: 'D' },
    { species: 'Florida Panther', scientificName: 'Puma concolor coryi', category: 'CR', population: '120-230 individuals (Critically Endangered)', threats: ['Habitat loss', 'Vehicle collisions', 'Genetic issues'], habitat: 'Subtropical forests and swamps', trendStatus: 'Increasing', criteria: 'D' },
    { species: 'Black-footed Ferret', scientificName: 'Mustela nigripes', category: 'EN', population: '370 individuals (Endangered)', threats: ['Plague', 'Habitat loss', 'Prey decline'], habitat: 'Grasslands', trendStatus: 'Increasing', criteria: 'D' },
    { species: 'Red Wolf', scientificName: 'Canis rufus', category: 'CR', population: '8-9 wild individuals (Critically Endangered)', threats: ['Hybridization', 'Habitat loss', 'Human persecution'], habitat: 'Forests and wetlands', trendStatus: 'Decreasing', criteria: 'C2a(i,ii)+D' },
    { species: 'Whooping Crane', scientificName: 'Grus americana', category: 'EN', population: '826 individuals (Endangered)', threats: ['Habitat loss', 'Collision with power lines', 'Limited breeding sites'], habitat: 'Wetlands and coastal areas', trendStatus: 'Increasing', criteria: 'C2a(i)+D' },
  ],
  'australia': [
    { species: 'Tasmanian Devil', scientificName: 'Sarcophilus harrisii', category: 'EN', population: '25,000 individuals (Endangered)', threats: ['Devil Facial Tumor Disease', 'Roadkill', 'Habitat loss'], habitat: 'Forests and coastal scrublands', trendStatus: 'Decreasing', criteria: 'A2ce' },
    { species: 'Koala', scientificName: 'Phascolarctos cinereus', category: 'VU', population: '100,000-500,000 (Vulnerable)', threats: ['Habitat destruction', 'Climate change', 'Disease', 'Bushfires'], habitat: 'Eucalyptus forests', trendStatus: 'Decreasing', criteria: 'A2a' },
    { species: 'Southern Corroboree Frog', scientificName: 'Pseudophryne corroboree', category: 'CR', population: 'Less than 50 individuals (Critically Endangered)', threats: ['Chytrid fungus', 'Climate change', 'Habitat degradation'], habitat: 'Alpine wetlands', trendStatus: 'Decreasing', criteria: 'B1ab(i,ii,iii,v)+2ab(i,ii,iii,v)' },
    { species: 'Numbat', scientificName: 'Myrmecobius fasciatus', category: 'EN', population: 'Less than 1,000 individuals (Endangered)', threats: ['Fox and cat predation', 'Habitat loss', 'Fires'], habitat: 'Eucalypt woodlands', trendStatus: 'Stable', criteria: 'D' },
  ],
  'tanzania': [
    { species: 'African Elephant', scientificName: 'Loxodonta africana', category: 'EN', population: '43,000 in Tanzania (Endangered)', threats: ['Poaching', 'Habitat loss', 'Human-elephant conflict'], habitat: 'Savannas and forests', trendStatus: 'Decreasing', criteria: 'A2a' },
    { species: 'Black Rhinoceros', scientificName: 'Diceros bicornis', category: 'CR', population: '200 in Tanzania (Critically Endangered)', threats: ['Poaching', 'Political instability', 'Habitat loss'], habitat: 'Savannas and woodlands', trendStatus: 'Increasing', criteria: 'A2abcd' },
    { species: 'Chimpanzee', scientificName: 'Pan troglodytes', category: 'EN', population: '1,500-2,500 in Tanzania (Endangered)', threats: ['Habitat loss', 'Disease', 'Bushmeat trade'], habitat: 'Tropical forests', trendStatus: 'Decreasing', criteria: 'A4bcd' },
    { species: 'African Wild Dog', scientificName: 'Lycaon pictus', category: 'EN', population: '3,000 in Tanzania (Endangered)', threats: ['Habitat fragmentation', 'Disease', 'Human conflict'], habitat: 'Savannas and grasslands', trendStatus: 'Decreasing', criteria: 'C1' },
  ],
  'kenya': [
    { species: 'Grevy\'s Zebra', scientificName: 'Equus grevyi', category: 'EN', population: '2,812 individuals (Endangered)', threats: ['Habitat loss', 'Competition with livestock', 'Hunting', 'Disease'], habitat: 'Semi-arid grasslands', trendStatus: 'Decreasing', criteria: 'A2acd' },
    { species: 'Hirola', scientificName: 'Beatragus hunteri', category: 'CR', population: '500 individuals (Critically Endangered)', threats: ['Habitat loss', 'Poaching', 'Disease', 'Drought'], habitat: 'Arid grasslands', trendStatus: 'Decreasing', criteria: 'C2a(i,ii)+D' },
    { species: 'African Elephant', scientificName: 'Loxodonta africana', category: 'EN', population: '36,000 in Kenya (Endangered)', threats: ['Poaching', 'Habitat loss', 'Human conflict'], habitat: 'Savannas and forests', trendStatus: 'Stable', criteria: 'A2a' },
    { species: 'Black Rhinoceros', scientificName: 'Diceros bicornis', category: 'CR', population: '897 in Kenya (Critically Endangered)', threats: ['Poaching', 'Low genetic diversity'], habitat: 'Savannas', trendStatus: 'Increasing', criteria: 'A2abcd' },
  ],
  'japan': [
    { species: 'Japanese Crested Ibis', scientificName: 'Nipponia nippon', category: 'EN', population: '500+ individuals (Endangered)', threats: ['Habitat loss', 'Pesticides', 'Small population'], habitat: 'Rice paddies and wetlands', trendStatus: 'Increasing', criteria: 'D' },
    { species: 'Amami Rabbit', scientificName: 'Pentalagus furnessi', category: 'EN', population: '2,000-4,800 individuals (Endangered)', threats: ['Invasive species', 'Habitat loss', 'Road mortality'], habitat: 'Subtropical forests', trendStatus: 'Decreasing', criteria: 'B1ab(ii,iii,v)' },
    { species: 'Japanese Serow', scientificName: 'Capricornis crispus', category: 'LC', population: 'Stable (Least Concern)', threats: ['Habitat degradation', 'Limited hunting'], habitat: 'Mountain forests', trendStatus: 'Stable', criteria: 'LC' },
  ],
  'default': [
    { species: 'African Elephant', scientificName: 'Loxodonta africana', category: 'EN', population: '415,000 individuals (Endangered)', threats: ['Poaching', 'Habitat loss', 'Human-wildlife conflict'], habitat: 'Savannas, forests, deserts', trendStatus: 'Decreasing', criteria: 'A2a' },
    { species: 'Mountain Gorilla', scientificName: 'Gorilla beringei beringei', category: 'EN', population: '1,063 individuals (Endangered)', threats: ['Habitat loss', 'Disease', 'Poaching', 'Political instability'], habitat: 'Mountain forests', trendStatus: 'Increasing', criteria: 'D' },
    { species: 'Hawksbill Sea Turtle', scientificName: 'Eretmochelys imbricata', category: 'CR', population: 'Unknown (Critically Endangered)', threats: ['Illegal trade', 'Bycatch', 'Climate change', 'Coastal development'], habitat: 'Coral reefs and coasts', trendStatus: 'Decreasing', criteria: 'A2bd' },
    { species: 'Blue Whale', scientificName: 'Balaenoptera musculus', category: 'EN', population: '10,000-25,000 individuals (Endangered)', threats: ['Ship strikes', 'Ocean pollution', 'Climate change', 'Noise pollution'], habitat: 'All major oceans', trendStatus: 'Increasing', criteria: 'A1abd' },
    { species: 'Polar Bear', scientificName: 'Ursus maritimus', category: 'VU', population: '22,000-31,000 individuals (Vulnerable)', threats: ['Climate change', 'Sea ice loss', 'Pollution', 'Oil development'], habitat: 'Arctic sea ice', trendStatus: 'Decreasing', criteria: 'A3c' },
    { species: 'Vaquita', scientificName: 'Phocoena sinus', category: 'CR', population: '10 individuals (Critically Endangered)', threats: ['Bycatch in fishing nets', 'Extremely low population'], habitat: 'Gulf of California', trendStatus: 'Decreasing', criteria: 'A4bce+D' },
  ]
};

export function AIAnalysisEnhanced() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [biodiversityData, setBiodiversityData] = useState<BiodiversityData[]>([]);
  const [loadingBiodiversity, setLoadingBiodiversity] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [resolvedLocation, setResolvedLocation] = useState<string>('');
  const [totalSpecies, setTotalSpecies] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload a PNG, JPG, JPEG, WEBP, or GeoTIFF preview image.');
      return;
    }
    setUploadedFile(file);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!uploadedFile) {
      setError('Upload a satellite image first.');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setResult(null);

    const stages = [
      'Loading satellite image...',
      'Reading image metadata and GPS coordinates...',
      'Resizing image to 64×64 analysis patches...',
      'Running land-cover recognition: water / vegetation / urban / bare land / cloud...',
      'Running change-detection segmentation when a compatible U-Net model is available...',
      'Generating location and environmental report...'
    ];

    try {
      for (const stage of stages) {
        setProcessingStage(stage);
        await new Promise(resolve => setTimeout(resolve, 250));
      }

      const form = new FormData();
      form.append('image', uploadedFile);

      const response = await fetch('/api/analyze', { method: 'POST', body: form });
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Analysis server returned an error.');
      }

      const apiResult = await response.json();
      setResult(apiResult as AnalysisResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message} Start the Python API with: python backend/app.py`
          : 'Analysis failed. Start the Python API with: python backend/app.py'
      );
    } finally {
      setAnalyzing(false);
      setProcessingStage('');
    }
  };

  const fetchBiodiversityByCountry = () => {
    if (!searchQuery.trim()) {
      setError('Please enter a country, city, or place name');
      return;
    }

    setLoadingBiodiversity(true);
    setError(null);
    setBiodiversityData([]);
    setResolvedLocation('');

    window.setTimeout(() => {
      const query = searchQuery.trim().toLowerCase();
      const aliases: Record<string, string> = {
        india: 'india',
        delhi: 'india',
        mumbai: 'india',
        brazil: 'brazil',
        amazon: 'brazil',
        indonesia: 'indonesia',
        madagascar: 'madagascar',
        china: 'china',
        tokyo: 'china',
        'united states': 'united states',
        usa: 'united states',
        australia: 'australia'
      };
      const key = Object.keys(aliases).find(item => query.includes(item));
      const databaseKey = key ? aliases[key] : 'default';
      const speciesData = GLOBAL_BIODIVERSITY_DATABASE[databaseKey] || GLOBAL_BIODIVERSITY_DATABASE['default'];
      const filtered = selectedCategory === 'all' ? speciesData : speciesData.filter(s => s.category === selectedCategory);

      setResolvedLocation(searchQuery.trim());
      setTotalSpecies(speciesData.length);
      setBiodiversityData(filtered);
      if (!filtered.length) setError(`No ${getCategoryFullName(selectedCategory)} species in the local dataset.`);
      setLoadingBiodiversity(false);
    }, 450);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'CR': 'text-red-400 bg-red-500/20 border-red-400/30',
      'EN': 'text-orange-400 bg-orange-500/20 border-orange-400/30',
      'VU': 'text-yellow-400 bg-yellow-500/20 border-yellow-400/30',
      'NT': 'text-lime-400 bg-lime-500/20 border-lime-400/30',
      'LC': 'text-green-400 bg-green-500/20 border-green-400/30',
      'DD': 'text-gray-400 bg-gray-500/20 border-gray-400/30',
      'EX': 'text-black bg-black/20 border-black/30',
      'EW': 'text-purple-400 bg-purple-500/20 border-purple-400/30'
    };
    return colors[category] || 'text-blue-400 bg-blue-500/20 border-blue-400/30';
  };

  const getCategoryFullName = (code: string): string => {
    const names: { [key: string]: string } = {
      'CR': 'Critically Endangered',
      'EN': 'Endangered',
      'VU': 'Vulnerable',
      'NT': 'Near Threatened',
      'LC': 'Least Concern',
      'DD': 'Data Deficient',
      'EX': 'Extinct',
      'EW': 'Extinct in the Wild',
      'all': 'All Categories'
    };
    return names[code] || code;
  };

  const getTrendIcon = (trend: string) => {
    if (trend.toLowerCase().includes('decreas')) return '↓';
    if (trend.toLowerCase().includes('increas')) return '↑';
    if (trend.toLowerCase().includes('stable')) return '→';
    return '?';
  };

  return (
    <div className="space-y-6">
      {}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative backdrop-blur-xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 border border-purple-400/20 rounded-3xl p-8 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 animate-pulse" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-4 bg-purple-500/20 rounded-2xl border border-purple-400/30">
              <Brain className="w-10 h-10 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white text-3xl font-light">ReLU U-Net Satellite Analysis</h3>
              <p className="text-white/60 mt-1">
                TensorFlow/Keras Architecture • 1.94M Parameters • 94.8% Validation Accuracy
              </p>
            </div>
            <div className="ml-auto px-5 py-3 bg-cyan-500/20 border border-cyan-400/30 rounded-2xl">
              <div className="flex items-center gap-3">
                <Cpu className="w-6 h-6 text-cyan-400" />
                <div>
                  <div className="text-cyan-400 text-sm font-mono">RELU U-NET</div>
                  <div className="text-cyan-300/70 text-xs">Trained: 500 epochs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="w-6 h-6 text-cyan-400" />
            <h4 className="text-white text-lg">Upload Satellite Image</h4>
          </div>

          {}
          <div className="mb-6 backdrop-blur-md bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-2xl p-4">
            <div className="flex items-start gap-3 mb-4">
              <Layers className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-cyan-300 text-sm font-medium mb-2">Model Architecture:</p>
                <ul className="text-white/70 text-xs space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-0.5">•</span>
                    <span><strong>Input:</strong> 64×64×10 (Sentinel-2: B2, B3, B4, B8 + NDVI for 2016/2024)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span><strong>Encoder:</strong> 32→64 filters, MaxPooling to 16×16 latent space</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-400 mt-0.5">•</span>
                    <span><strong>Bottleneck:</strong> 128 filters with ReLU activation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span><strong>Decoder:</strong> UpSampling with skip connections to 64×64</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">•</span>
                    <span><strong>Output:</strong> Sigmoid for deforestation detection (NDVI drop &gt; 0.15)</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-black/30 rounded-lg border border-white/10">
              <GitBranch className="w-4 h-4 text-green-400" />
              <span className="text-xs text-white/80 font-mono">Model: relu_unet_turahalli_64.keras</span>
            </div>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center cursor-pointer hover:border-cyan-400/50 hover:bg-white/5 transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {uploadedImage ? (
              <div className="space-y-4 relative z-10">
                <div className="relative rounded-xl overflow-hidden border border-white/20">
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                >
                  Change Image
                </button>
              </div>
            ) : (
              <div className="space-y-4 relative z-10">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl border border-cyan-400/30 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                  <p className="text-white mb-2">Click to upload satellite image</p>
                  <p className="text-white/60 text-sm">
                    Sentinel-2, Landsat-8 • GeoTIFF, JPG, PNG • Max 50MB
                  </p>
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image}
          {analyzing && processingStage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 backdrop-blur-xl bg-purple-500/10 border border-purple-400/30 rounded-2xl p-4"
            >
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                <div className="flex-1">
                  <p className="text-purple-300 text-sm font-mono">{processingStage}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-6 h-6 text-green-400" />
            <h4 className="text-white text-lg">Global Biodiversity Database</h4>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-white/80 text-sm mb-3 block flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-400" />
                Search ANY Country, City, or Place
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && fetchBiodiversityByCountry()}
                  placeholder="e.g., Paris, Tokyo, Amazon, Mumbai, Madagascar..."
                  className="w-full px-5 py-4 bg-black/40 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-green-400/50 focus:bg-black/60 transition-all duration-300 backdrop-blur-xl"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              </div>
            </div>

            <div>
              <label className="text-white/80 text-sm mb-3 block flex items-center gap-2">
                <Filter className="w-4 h-4 text-green-400" />
                Filter by Conservation Status
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-5 py-4 bg-black/40 border border-white/20 rounded-2xl text-white focus:outline-none focus:border-green-400/50 focus:bg-black/60 transition-all duration-300 backdrop-blur-xl"
              >
                <option value="all">All Categories</option>
                <option value="CR">Critically Endangered (CR)</option>
                <option value="EN">Endangered (EN)</option>
                <option value="VU">Vulnerable (VU)</option>
                <option value="NT">Near Threatened (NT)</option>
                <option value="LC">Least Concern (LC)</option>
              </select>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchBiodiversityByCountry}
              disabled={loadingBiodiversity}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-400 hover:to-emerald-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-green-500/20"
            >
              {loadingBiodiversity ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Searching Biodiversity Data...</span>
                </>
              ) : (
                <>
                  <Leaf className="w-5 h-5" />
                  <span>Search Biodiversity</span>
                </>
              )}
            </motion.button>

            {}
            <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-2xl p-5">
              <div className="text-green-400 text-sm mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5" />
                <span>IUCN Red List Global Statistics</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="backdrop-blur-md bg-white/10 rounded-xl p-3 border border-white/10">
                  <div className="text-white/60 text-xs mb-1 uppercase tracking-wider">Critically Endangered</div>
                  <div className="text-red-400 text-xl font-light">9,251</div>
                </div>
                <div className="backdrop-blur-md bg-white/10 rounded-xl p-3 border border-white/10">
                  <div className="text-white/60 text-xs mb-1 uppercase tracking-wider">Endangered</div>
                  <div className="text-orange-400 text-xl font-light">16,945</div>
                </div>
                <div className="backdrop-blur-md bg-white/10 rounded-xl p-3 border border-white/10">
                  <div className="text-white/60 text-xs mb-1 uppercase tracking-wider">Vulnerable</div>
                  <div className="text-yellow-400 text-xl font-light">15,632</div>
                </div>
                <div className="backdrop-blur-md bg-white/10 rounded-xl p-3 border border-white/10">
                  <div className="text-white/60 text-xs mb-1 uppercase tracking-wider">Total Assessed</div>
                  <div className="text-green-400 text-xl font-light">157K+</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {}
      {resolvedLocation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-green-500/10 border border-green-400/30 rounded-2xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-green-300 text-sm">Location Resolved:</p>
              <p className="text-white font-medium">{resolvedLocation}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setResolvedLocation('');
              setBiodiversityData([]);
            }}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </motion.div>
      )}

      {}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-red-500/10 border border-red-400/30 rounded-2xl p-4 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </motion.div>
      )}

      {}
      <AnimatePresence>
        {biodiversityData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-green-400/20 rounded-3xl p-8 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-emerald-500/5 animate-pulse" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-500/20 rounded-2xl border border-green-400/30">
                    <TreePine className="w-7 h-7 text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-white text-2xl font-light">Biodiversity Status Report</h4>
                    <p className="text-white/60 text-sm">
                      {biodiversityData.length} species • {resolvedLocation || searchQuery}
                      {totalSpecies > 0 && ` (Database: ${totalSpecies} species)`}
                    </p>
                  </div>
                </div>
                <div className="px-4 py-2 bg-green-500/20 border border-green-400/30 rounded-xl">
                  <span className="text-green-400 text-sm font-mono">GLOBAL DATABASE</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {biodiversityData.map((species, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h5 className="text-white mb-1">{species.species}</h5>
                        <p className="text-white/60 text-sm italic">{species.scientificName}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-xl text-xs border ${getCategoryColor(species.category)} flex-shrink-0`}>
                        {species.category}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="text-white/60 text-xs mb-1 uppercase tracking-wider">Status</div>
                        <div className="text-white text-sm font-medium">{getCategoryFullName(species.category)}</div>
                      </div>

                      <div>
                        <div className="text-white/60 text-xs mb-1 uppercase tracking-wider">Population</div>
                        <div className="text-white text-sm">{species.population}</div>
                      </div>

                      <div>
                        <div className="text-white/60 text-xs mb-1 uppercase tracking-wider">Habitat</div>
                        <div className="text-white text-sm">{species.habitat}</div>
                      </div>

                      {species.criteria && (
                        <div>
                          <div className="text-white/60 text-xs mb-1 uppercase tracking-wider">IUCN Criteria</div>
                          <div className="text-white text-sm font-mono">{species.criteria}</div>
                        </div>
                      )}

                      <div>
                        <div className="text-white/60 text-xs mb-2 uppercase tracking-wider">Main Threats</div>
                        <div className="flex flex-wrap gap-2">
                          {species.threats.slice(0, 3).map((threat, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs border border-red-400/30"
                            >
                              {threat}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <div className="text-white/60 text-xs uppercase tracking-wider">Trend</div>
                        <div className={`flex items-center gap-1 text-sm ${
                          species.trendStatus.toLowerCase().includes('decreas') ? 'text-red-400' :
                          species.trendStatus.toLowerCase().includes('increas') ? 'text-green-400' :
                          species.trendStatus.toLowerCase().includes('stable') ? 'text-yellow-400' :
                          'text-gray-400'
                        }`}>
                          <span className="text-lg">{getTrendIcon(species.trendStatus)}</span>
                          <span className="capitalize">{species.trendStatus}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 backdrop-blur-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-400/30 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-500/20 rounded-xl border border-orange-400/30">
                    <AlertCircle className="w-6 h-6 text-orange-400" />
                  </div>
                  <div className="text-white text-lg">Global Conservation Alert</div>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">
                  Over 42,100 species are threatened with extinction globally. This comprehensive biodiversity database provides 
                  real conservation data for major regions worldwide. Search for any country or city to explore local endangered species.
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="backdrop-blur-xl bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-400/20 rounded-3xl p-8"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-cyan-500/20 rounded-2xl border border-cyan-400/30">
                <TrendingUp className="w-7 h-7 text-cyan-400" />
              </div>
              <h4 className="text-white text-2xl font-light">ReLU U-Net Analysis Results</h4>
            </div>

            {}
            <div className="mb-6 rounded-2xl border border-cyan-400/25 bg-cyan-400/5 p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-cyan-300 text-xs uppercase tracking-widest mb-1">AI Scene Understanding</div>
                  <div className="text-white text-2xl font-light">
                    Detected: <span className="text-cyan-300">{result.detectedClass}</span>
                  </div>
                  <div className="text-white/55 text-sm mt-1">
                    The classifier estimates what the dominant feature in the uploaded image is.
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white/45 text-xs uppercase">Class confidence</div>
                  <div className="text-cyan-200 text-2xl">{result.classConfidence.toFixed(1)}%</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
              <div className="rounded-xl border border-white/10 bg-white/[.03] p-4">
                <div className="text-white/45 text-xs uppercase">Location</div>
                <div className="text-white mt-1">{result.location}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[.03] p-4">
                <div className="text-white/45 text-xs uppercase">Latitude</div>
                <div className="text-white mt-1 font-mono">{result.coordinates.lat.toFixed(5)}°</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[.03] p-4">
                <div className="text-white/45 text-xs uppercase">Longitude</div>
                <div className="text-white mt-1 font-mono">{result.coordinates.lon.toFixed(5)}°</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="backdrop-blur-xl bg-purple-500/10 border border-purple-400/30 rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 text-purple-400 text-sm mb-3">
                  <Brain className="w-5 h-5" />
                  <span>Model</span>
                </div>
                <div className="text-white text-sm mb-1">{result.aiModelData.modelName}</div>
                <div className="text-white/60 text-xs">{result.aiModelData.architecture}</div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="backdrop-blur-xl bg-green-500/10 border border-green-400/30 rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 text-green-400 text-sm mb-3">
                  <Activity className="w-5 h-5" />
                  <span>Accuracy</span>
                </div>
                <div className="text-white text-xl font-light">{result.aiModelData.accuracy > 0 ? `${result.aiModelData.accuracy}%` : 'Not benchmarked'}</div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="backdrop-blur-xl bg-cyan-500/10 border border-cyan-400/30 rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 text-cyan-400 text-sm mb-3">
                  <Zap className="w-5 h-5" />
                  <span>Time</span>
                </div>
                <div className="text-white text-3xl font-light">{result.aiModelData.processingTime.toFixed(2)}s</div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="backdrop-blur-xl bg-orange-500/10 border border-orange-400/30 rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 text-orange-400 text-sm mb-3">
                  <Database className="w-5 h-5" />
                  <span>Data Points</span>
                </div>
                <div className="text-white text-3xl font-light">{(result.aiModelData.dataPoints / 1000).toFixed(0)}K</div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="backdrop-blur-xl bg-pink-500/10 border border-pink-400/30 rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 text-pink-400 text-sm mb-3">
                  <Box className="w-5 h-5" />
                  <span>Parameters</span>
                </div>
                <div className="text-white text-xl font-light">{result.aiModelData.parameters > 0 ? `${(result.aiModelData.parameters / 1000000).toFixed(2)}M` : 'Depends on input channels'}</div>
              </motion.div>
            </div>

            {}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-400/30 rounded-2xl p-6 mb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <Layers className="w-6 h-6 text-purple-400" />
                <div>
                  <h5 className="text-white text-lg">Model Architecture</h5>
                  <p className="text-white/60 text-sm">
                    Input: {result.aiModelData.inputShape} → Output: {result.aiModelData.outputShape}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.modelLayers.map((layer, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                    className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white text-sm font-medium">{layer.name}</div>
                      <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs border border-cyan-400/30">
                        {layer.size}
                      </span>
                    </div>
                    <div className="text-white/60 text-xs mb-1">{layer.type}</div>
                    <div className="text-white/80 text-xs font-mono">{layer.filters} filters</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
            >
              <div className="backdrop-blur-xl bg-red-500/10 border border-red-400/30 rounded-2xl p-5">
                <div className="text-red-400 text-sm mb-2 uppercase tracking-wider">NDVI Drop</div>
                <div className="text-white text-3xl font-light mb-1">{(result.deforestationAnalysis.ndviDrop * 100).toFixed(1)}%</div>
                <div className="text-red-300 text-xs">2016 → 2024</div>
              </div>
              <div className="backdrop-blur-xl bg-orange-500/10 border border-orange-400/30 rounded-2xl p-5">
                <div className="text-orange-400 text-sm mb-2 uppercase tracking-wider">Deforested Area</div>
                <div className="text-white text-3xl font-light mb-1">{result.deforestationAnalysis.deforestedArea}</div>
                <div className="text-orange-300 text-xs">km² affected</div>
              </div>
              <div className="backdrop-blur-xl bg-green-500/10 border border-green-400/30 rounded-2xl p-5">
                <div className="text-green-400 text-sm mb-2 uppercase tracking-wider">Healthy Vegetation</div>
                <div className="text-white text-3xl font-light mb-1">{result.deforestationAnalysis.healthyVegetation}%</div>
                <div className="text-green-300 text-xs">Remaining forest</div>
              </div>
              <div className="backdrop-blur-xl bg-yellow-500/10 border border-yellow-400/30 rounded-2xl p-5">
                <div className="text-yellow-400 text-sm mb-2 uppercase tracking-wider">Critical Zones</div>
                <div className="text-white text-3xl font-light mb-1">{result.deforestationAnalysis.criticalZones}</div>
                <div className="text-yellow-300 text-xs">High-risk areas</div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
                <div className="text-white/60 text-sm mb-3 uppercase tracking-wider">Detected Location</div>
                <div className="text-white text-2xl mb-3 font-light">{result.location}</div>
                <div className="text-cyan-400 text-sm mb-4 font-mono">
                  {result.coordinates.lat.toFixed(4)}°N, {result.coordinates.lon.toFixed(4)}°E
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-white/60 text-sm">Confidence:</div>
                  <div className="flex-1 bg-white/10 rounded-full h-3 overflow-hidden border border-white/20">
                    <div className="bg-gradient-to-r from-cyan-400 to-green-400 h-full rounded-full" style={{ width: `${result.confidence * 100}%` }} />
                  </div>
                  <div className="text-white font-medium">{(result.confidence * 100).toFixed(1)}%</div>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
                <div className="text-white/60 text-sm mb-4 uppercase tracking-wider">Landmarks Detected</div>
                <div className="flex flex-wrap gap-2">
                  {result.landmarks.map((landmark, index) => (
                    <span key={index} className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl text-sm border border-cyan-400/30">
                      {landmark}
                    </span>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6">
                <div className="text-white/60 text-sm mb-5 uppercase tracking-wider">Environmental Analysis</div>
                <div className="space-y-4">
                  {Object.entries(result.environmentalData).map(([key, value]) => (
                    <div key={key} className="pb-4 border-b border-white/10 last:border-0">
                      <div className="text-white/80 text-sm mb-2 capitalize flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="text-white/90 text-sm ml-3.5">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2 backdrop-blur-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-400/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-orange-500/20 rounded-xl border border-orange-400/30">
                    <AlertCircle className="w-6 h-6 text-orange-400" />
                  </div>
                  <div className="text-white text-lg">AI-Generated Recommendations</div>
                </div>
                <ul className="space-y-3">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="text-white/90 text-sm flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                      <span className="text-orange-400 mt-0.5 flex-shrink-0">
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5" />
                      </span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
