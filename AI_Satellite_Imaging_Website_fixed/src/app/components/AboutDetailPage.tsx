import { motion } from 'motion/react';
import { X, Satellite, Radio, Database, Zap, Globe2, TrendingUp, Activity, Wifi } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface AboutDetailPageProps {
  onClose: () => void;
}

export function AboutDetailPage({ onClose }: AboutDetailPageProps) {
  const satelliteDetails = [
    {
      title: 'Satellite Bandwidth',
      icon: Radio,
      color: 'cyan',
      details: [
        {
          name: 'L-Band (1-2 GHz)',
          bandwidth: '1 GHz',
          usage: 'GPS, mobile satellite communications, and aircraft surveillance',
          dataRate: '50-200 Kbps',
          applications: ['Navigation systems', 'Emergency beacons', 'Maritime communications']
        },
        {
          name: 'S-Band (2-4 GHz)',
          bandwidth: '2 GHz',
          usage: 'Weather radar, surface ship radar, and communications satellites',
          dataRate: '1-10 Mbps',
          applications: ['Weather monitoring', 'Satellite tracking', 'ISS communications']
        },
        {
          name: 'C-Band (4-8 GHz)',
          bandwidth: '4 GHz',
          usage: 'Satellite communications and long-distance radio telecommunications',
          dataRate: '10-50 Mbps',
          applications: ['TV broadcasting', 'Satellite internet', 'Military communications']
        },
        {
          name: 'X-Band (8-12 GHz)',
          bandwidth: '4 GHz',
          usage: 'Military satellite communications, radar, and space communications',
          dataRate: '50-300 Mbps',
          applications: ['Military radar', 'Deep space communications', 'Satellite imagery']
        },
        {
          name: 'Ku-Band (12-18 GHz)',
          bandwidth: '6 GHz',
          usage: 'Satellite TV broadcasting and high-speed satellite internet',
          dataRate: '100-500 Mbps',
          applications: ['Direct broadcast satellite TV', 'VSAT networks', 'Satellite internet']
        },
        {
          name: 'Ka-Band (26-40 GHz)',
          bandwidth: '14 GHz',
          usage: 'High-bandwidth satellite communications and next-gen internet',
          dataRate: '500+ Mbps to several Gbps',
          applications: ['5G satellite networks', 'High-speed internet', 'Earth observation']
        }
      ]
    },
    {
      title: 'Data Transmission & Usage',
      icon: Database,
      color: 'purple',
      metrics: [
        {
          name: 'Real-Time Telemetry',
          rate: '1-10 Mbps',
          description: 'Continuous streaming of satellite health data, position, velocity, and operational parameters',
          frequency: 'Every 1-5 seconds'
        },
        {
          name: 'Earth Observation Imagery',
          rate: '100-1000 Mbps',
          description: 'High-resolution satellite imagery for environmental monitoring, disaster response, and mapping',
          frequency: 'Multiple passes per day'
        },
        {
          name: 'Scientific Data Collection',
          rate: '50-500 Mbps',
          description: 'Climate data, atmospheric measurements, ocean temperatures, and space weather monitoring',
          frequency: 'Continuous or scheduled'
        },
        {
          name: 'Command & Control',
          rate: '10-100 Kbps',
          description: 'Ground station commands for satellite maneuvers, instrument activation, and configuration',
          frequency: 'On-demand'
        }
      ]
    },
    {
      title: 'Network Architecture',
      icon: Globe2,
      color: 'green',
      architecture: [
        {
          layer: 'Space Segment',
          components: ['Satellites in orbit (LEO, MEO, GEO)', 'Inter-satellite links', 'Onboard processors'],
          description: 'The constellation of satellites providing global coverage with mesh networking capabilities'
        },
        {
          layer: 'Ground Segment',
          components: ['Ground stations', 'Mission control centers', 'Data processing facilities'],
          description: 'Worldwide network of ground stations for satellite tracking, telemetry, and command operations'
        },
        {
          layer: 'User Segment',
          components: ['Satellite terminals', 'Receiving antennas', 'End-user devices'],
          description: 'Equipment used by customers to access satellite services and receive data'
        }
      ]
    },
    {
      title: 'Performance Metrics',
      icon: TrendingUp,
      color: 'orange',
      stats: [
        { metric: 'Orbital Velocity', value: '7.8 km/s', description: 'Average speed of satellites in Low Earth Orbit' },
        { metric: 'Coverage Area', value: '≈ 2M km²', description: 'Ground coverage per satellite at any given time' },
        { metric: 'Latency (LEO)', value: '20-40 ms', description: 'Round-trip signal delay for Low Earth Orbit satellites' },
        { metric: 'Latency (GEO)', value: '≈ 600 ms', description: 'Round-trip signal delay for Geostationary satellites' },
        { metric: 'Signal Strength', value: '-80 to -120 dBm', description: 'Typical received signal power at ground stations' },
        { metric: 'Uptime', value: '99.9%+', description: 'Average satellite system availability' }
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: { bg: string; border: string; text: string; icon: string } } = {
      cyan: { bg: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-400/30', text: 'text-cyan-400', icon: 'text-cyan-400' },
      purple: { bg: 'from-purple-500/20 to-fuchsia-500/20', border: 'border-purple-400/30', text: 'text-purple-400', icon: 'text-purple-400' },
      green: { bg: 'from-green-500/20 to-emerald-500/20', border: 'border-green-400/30', text: 'text-green-400', icon: 'text-green-400' },
      orange: { bg: 'from-orange-500/20 to-red-500/20', border: 'border-orange-400/30', text: 'text-orange-400', icon: 'text-orange-400' }
    };
    return colors[color] || colors.cyan;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black overflow-auto"
    >
      <div className="min-h-screen p-6 relative z-10">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
          <div>
            <h2 className="text-white text-2xl mb-1">Satellite Technology Deep Dive</h2>
            <p className="text-white/60 text-sm">Bandwidth, usage, and network architecture details</p>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="backdrop-blur-md bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-2xl p-6">
            <Satellite className="w-8 h-8 text-cyan-400 mb-3" />
            <div className="text-white/60 text-sm mb-1">Active Satellites</div>
            <div className="text-white text-3xl">5,000+</div>
          </div>
          
          <div className="backdrop-blur-md bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 border border-purple-400/30 rounded-2xl p-6">
            <Zap className="w-8 h-8 text-purple-400 mb-3" />
            <div className="text-white/60 text-sm mb-1">Total Bandwidth</div>
            <div className="text-white text-3xl">1+ Tbps</div>
          </div>
          
          <div className="backdrop-blur-md bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-2xl p-6">
            <Activity className="w-8 h-8 text-green-400 mb-3" />
            <div className="text-white/60 text-sm mb-1">Data Rate</div>
            <div className="text-white text-3xl">10 Gbps</div>
          </div>
          
          <div className="backdrop-blur-md bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-400/30 rounded-2xl p-6">
            <Wifi className="w-8 h-8 text-orange-400 mb-3" />
            <div className="text-white/60 text-sm mb-1">Global Coverage</div>
            <div className="text-white text-3xl">99%</div>
          </div>
        </div>

        {/* Satellite Bandwidth Details */}
        <div className="space-y-6">
          {satelliteDetails.map((section, sectionIdx) => {
            const Icon = section.icon;
            const colors = getColorClasses(section.color);

            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIdx * 0.1 }}
                className={`backdrop-blur-md bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-2xl p-6`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Icon className={`w-8 h-8 ${colors.icon}`} />
                  <h3 className="text-white text-2xl">{section.title}</h3>
                </div>

                {/* Bandwidth Details */}
                {section.details && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {section.details.map((detail, idx) => (
                      <div
                        key={idx}
                        className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-5"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-white text-lg mb-1">{detail.name}</h4>
                            <div className={`${colors.text} text-sm`}>
                              Bandwidth: {detail.bandwidth} • Data Rate: {detail.dataRate}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-white/70 text-sm mb-3">{detail.usage}</p>
                        
                        <div className="pt-3 border-t border-white/10">
                          <div className="text-white/60 text-xs mb-2">Applications:</div>
                          <div className="flex flex-wrap gap-2">
                            {detail.applications.map((app, appIdx) => (
                              <span
                                key={appIdx}
                                className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-white/80 text-xs"
                              >
                                {app}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Data Transmission Metrics */}
                {section.metrics && (
                  <div className="space-y-4">
                    {section.metrics.map((metric, idx) => (
                      <div
                        key={idx}
                        className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-5"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="text-white text-lg mb-1">{metric.name}</h4>
                            <div className={`${colors.text} mb-2`}>{metric.rate}</div>
                            <p className="text-white/70 text-sm">{metric.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-white/60 text-xs">Frequency</div>
                            <div className="text-white text-sm">{metric.frequency}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Network Architecture */}
                {section.architecture && (
                  <div className="space-y-4">
                    {section.architecture.map((arch, idx) => (
                      <div
                        key={idx}
                        className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-5"
                      >
                        <h4 className="text-white text-lg mb-3">{arch.layer}</h4>
                        <p className="text-white/70 text-sm mb-4">{arch.description}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          {arch.components.map((component, compIdx) => (
                            <span
                              key={compIdx}
                              className={`px-4 py-2 bg-white/10 border border-white/20 rounded-lg ${colors.text} text-sm`}
                            >
                              {component}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Performance Stats */}
                {section.stats && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {section.stats.map((stat, idx) => (
                      <div
                        key={idx}
                        className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-5 text-center"
                      >
                        <div className="text-white/60 text-xs mb-2">{stat.metric}</div>
                        <div className={`${colors.text} text-3xl mb-2`}>{stat.value}</div>
                        <div className="text-white/60 text-xs">{stat.description}</div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Visual Representation */}
        <div className="mt-6 backdrop-blur-md bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-2xl p-6">
          <h3 className="text-white text-xl mb-4 flex items-center gap-2">
            <Satellite className="w-6 h-6 text-blue-400" />
            Global Satellite Network Visualization
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl overflow-hidden border border-white/20">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1446776653964-20c1d3a81b06"
                alt="Satellite in orbit"
                className="w-full h-64 object-cover"
              />
              <div className="p-4 bg-white/5">
                <div className="text-white mb-1">Low Earth Orbit (LEO)</div>
                <div className="text-white/60 text-sm">160-2,000 km altitude • Low latency • Global coverage</div>
              </div>
            </div>
            
            <div className="rounded-xl overflow-hidden border border-white/20">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1454789548928-9efd52dc4031"
                alt="Satellite communications"
                className="w-full h-64 object-cover"
              />
              <div className="p-4 bg-white/5">
                <div className="text-white mb-1">Geostationary Orbit (GEO)</div>
                <div className="text-white/60 text-sm">35,786 km altitude • Fixed position • Weather & TV</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}