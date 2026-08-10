import { motion } from 'motion/react';
import { Orbit, Radio, TrendingUp, Globe } from 'lucide-react';

export function SpaceTracking() {
  const stats = [
    { label: 'Active Satellites', value: '5,465', change: '+12' },
    { label: 'Debris Objects', value: '34,000+', change: '+156' },
    { label: 'Tracked Orbits', value: 'LEO/MEO/GEO', change: 'All' },
  ];

  const satellites = [
    { orbit: 1, angle: 0, speed: 20, color: 'bg-cyan-400', size: 'w-2 h-2' },
    { orbit: 1, angle: 120, speed: 22, color: 'bg-cyan-400', size: 'w-2 h-2' },
    { orbit: 1, angle: 240, speed: 18, color: 'bg-cyan-400', size: 'w-2 h-2' },
    { orbit: 2, angle: 45, speed: 35, color: 'bg-purple-400', size: 'w-2.5 h-2.5' },
    { orbit: 2, angle: 180, speed: 30, color: 'bg-purple-400', size: 'w-2.5 h-2.5' },
    { orbit: 2, angle: 270, speed: 33, color: 'bg-purple-400', size: 'w-2.5 h-2.5' },
    { orbit: 3, angle: 90, speed: 50, color: 'bg-pink-400', size: 'w-3 h-3' },
    { orbit: 3, angle: 200, speed: 45, color: 'bg-pink-400', size: 'w-3 h-3' },
    { orbit: 3, angle: 315, speed: 48, color: 'bg-pink-400', size: 'w-3 h-3' },
    { orbit: 4, angle: 60, speed: 65, color: 'bg-blue-400', size: 'w-3.5 h-3.5' },
    { orbit: 4, angle: 150, speed: 70, color: 'bg-blue-400', size: 'w-3.5 h-3.5' },
  ];

  return (
    <section className="relative py-32 px-8">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6">
            <Orbit className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 text-sm">Orbital Intelligence</span>
          </div>
          <h2 className="text-white mb-4">Global Satellite Tracking Map</h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Real-time visualization of satellite orbits around Earth with live tracking data
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <Radio className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
                <div className="flex items-center gap-1 text-green-400 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>{stat.change}</span>
                </div>
              </div>
              <div className="text-white mb-1">{stat.value}</div>
              <p className="text-white/60 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative group"
        >
          <div className="relative overflow-hidden rounded-3xl backdrop-blur-md bg-gradient-to-br from-black/80 to-purple-900/20 border border-white/10 p-8 hover:border-purple-500/30 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative">
              {}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-black via-purple-950/20 to-black p-8 min-h-[600px] flex items-center justify-center">
                
                {}
                <div className="absolute inset-0">
                  {[...Array(50)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        opacity: Math.random() * 0.7 + 0.3,
                      }}
                      animate={{
                        opacity: [0.3, 1, 0.3],
                      }}
                      transition={{
                        duration: Math.random() * 3 + 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>

                {}
                <div className="relative w-full max-w-[550px] aspect-square flex items-center justify-center" style={{ perspective: '1000px' }}>
                  
                  {}
                  {[
                    { size: 140, label: 'LEO', color: 'border-cyan-500/40', glow: 'shadow-cyan-500/20', rotateX: 15, rotateY: 20 },
                    { size: 220, label: 'MEO', color: 'border-purple-500/40', glow: 'shadow-purple-500/20', rotateX: -25, rotateY: 45 },
                    { size: 300, label: 'GEO', color: 'border-pink-500/40', glow: 'shadow-pink-500/20', rotateX: 35, rotateY: -30 },
                    { size: 380, label: 'HEO', color: 'border-blue-500/30', glow: 'shadow-blue-500/20', rotateX: -10, rotateY: 60 },
                  ].map((orbit, index) => (
                    <motion.div
                      key={index}
                      className={`absolute border-2 ${orbit.color} rounded-full ${orbit.glow}`}
                      style={{
                        width: `${orbit.size}px`,
                        height: `${orbit.size}px`,
                        transform: `rotateX(${orbit.rotateX}deg) rotateY(${orbit.rotateY}deg)`,
                        transformStyle: 'preserve-3d',
                      }}
                      animate={{
                        rotateZ: index % 2 === 0 ? 360 : -360,
                      }}
                      transition={{
                        rotateZ: {
                          duration: 40 + index * 15,
                          repeat: Infinity,
                          ease: 'linear',
                        },
                      }}
                    >
                      {}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-white/60 text-xs font-mono bg-black/50 px-2 py-1 rounded backdrop-blur-md">
                        {orbit.label}
                      </div>
                    </motion.div>
                  ))}

                  {}
                  {satellites.map((sat, index) => {
                    const orbitSizes = [140, 220, 300, 380];
                    const radius = orbitSizes[sat.orbit - 1] / 2;
                    
                    return (
                      <motion.div
                        key={index}
                        className="absolute"
                        style={{
                          width: '10px',
                          height: '10px',
                        }}
                        animate={{
                          rotate: 360,
                        }}
                        transition={{
                          duration: sat.speed,
                          repeat: Infinity,
                          ease: 'linear',
                          delay: sat.angle / 360 * sat.speed,
                        }}
                      >
                        <div
                          className={`${sat.size} ${sat.color} rounded-full shadow-lg absolute`}
                          style={{
                            top: '50%',
                            left: `${radius}px`,
                            transform: 'translate(-50%, -50%)',
                            boxShadow: `0 0 10px currentColor`,
                          }}
                        >
                          {}
                          <div className={`absolute inset-0 ${sat.color} rounded-full animate-ping opacity-75`} />
                        </div>
                      </motion.div>
                    );
                  })}

                  {}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    {}
                    <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-2xl w-32 h-32 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 animate-pulse" />
                    
                    {}
                    <motion.div
                      className="relative w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 via-green-400 to-blue-600 shadow-2xl"
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      style={{
                        boxShadow: '0 0 40px rgba(59, 130, 246, 0.6), inset -10px -10px 30px rgba(0, 0, 0, 0.5)',
                      }}
                    >
                      {}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent via-green-600/30 to-transparent" />
                      
                      {}
                      <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-blue-300/20 to-transparent blur-sm" />
                      
                      {}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Globe className="w-12 h-12 text-white/30" />
                      </div>
                    </motion.div>

                    {}
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white text-xs font-mono bg-black/70 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/20 whitespace-nowrap">
                      🌍 Earth
                    </div>
                  </div>

                  {}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-px h-4 bg-white/30 absolute -top-8 left-1/2 -translate-x-1/2" />
                    <div className="w-px h-4 bg-white/30 absolute -bottom-8 left-1/2 -translate-x-1/2" />
                    <div className="h-px w-4 bg-white/30 absolute top-1/2 -left-8 -translate-y-1/2" />
                    <div className="h-px w-4 bg-white/30 absolute top-1/2 -right-8 -translate-y-1/2" />
                  </div>
                </div>

                {}
                <div className="absolute bottom-8 left-8 right-8 flex gap-4 flex-wrap">
                  {[
                    { label: 'LEO (Low Earth Orbit)', value: '2,456 sats', color: 'bg-cyan-400' },
                    { label: 'MEO (Medium Earth Orbit)', value: '1,234 sats', color: 'bg-purple-400' },
                    { label: 'GEO (Geostationary)', value: '892 sats', color: 'bg-pink-400' },
                  ].map((info) => (
                    <div
                      key={info.label}
                      className="flex-1 min-w-[200px] backdrop-blur-xl bg-black/60 border border-white/20 rounded-xl p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 ${info.color} rounded-full shadow-lg`} style={{ boxShadow: `0 0 10px currentColor` }} />
                        <div className="text-white/60 text-xs">{info.label}</div>
                      </div>
                      <div className="text-white font-mono">{info.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-3xl blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </motion.div>
      </div>
    </section>
  );
}