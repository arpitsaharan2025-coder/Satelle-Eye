import { motion } from 'motion/react';
import { Rocket, Zap, Monitor } from 'lucide-react';

export function MissionServices() {
  const steps = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Build',
      description: 'Design and configure your satellite mission parameters with our intuitive mission planner',
      color: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: 'Launch',
      description: 'Deploy your satellite constellation and activate real-time data collection systems',
      color: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400',
    },
    {
      icon: <Monitor className="w-8 h-8" />,
      title: 'Monitor',
      description: 'Track performance, analyze data streams, and receive AI-powered insights 24/7',
      color: 'from-cyan-500 to-blue-500',
      iconBg: 'bg-cyan-500/20',
      iconColor: 'text-cyan-400',
    },
  ];

  return (
    <section className="relative py-32 px-8">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6">
            <Rocket className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm">Mission Pipeline</span>
          </div>
          <h2 className="text-white mb-4">Mission Services</h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            From concept to deployment — a streamlined three-step process for satellite operations
          </p>
        </motion.div>

        <div className="relative">
          {}
          <div className="absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 opacity-20 hidden lg:block" />

          <div className="grid lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                {}
                <div className="relative backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-500 group h-full">
                  {}
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`} />

                  {}
                  <div className="absolute -top-4 -right-4 w-12 h-12 backdrop-blur-md bg-white/10 border border-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white">{index + 1}</span>
                  </div>

                  {}
                  <div className={`relative w-16 h-16 ${step.iconBg} border border-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <span className={step.iconColor}>{step.icon}</span>
                  </div>

                  {}
                  <h3 className="text-white mb-4">{step.title}</h3>
                  <p className="text-white/60">{step.description}</p>

                  {}
                  <div className="mt-6 flex items-center gap-2 text-white/40 group-hover:text-white/80 transition-colors">
                    <span className="text-sm">Learn more</span>
                    <motion.svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </motion.svg>
                  </div>
                </div>

                {}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.2 + 0.3 }}
                  viewport={{ once: true }}
                  className={`absolute top-24 left-1/2 -translate-x-1/2 w-4 h-4 bg-gradient-to-br ${step.color} rounded-full hidden lg:block shadow-lg`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-full animate-ping opacity-75`} />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
