import { motion } from 'motion/react';
import { Leaf, Globe, Trash2, ArrowRight } from 'lucide-react';

export function ProductCards() {
  const products = [
    {
      icon: <Leaf className="w-8 h-8" />,
      title: 'Environmental AI',
      description: 'Advanced machine learning models for climate monitoring, deforestation tracking, and ecosystem analysis',
      features: ['Forest Coverage', 'Ocean Health', 'Air Quality', 'Carbon Monitoring'],
      gradient: 'from-green-500 to-emerald-500',
      glowColor: 'shadow-[0_0_50px_rgba(16,185,129,0.3)]',
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Earth Observation API',
      description: 'Access real-time and historical satellite imagery with powerful API endpoints for developers',
      features: ['REST API', 'Webhooks', 'SDKs', 'Documentation'],
      gradient: 'from-blue-500 to-cyan-500',
      glowColor: 'shadow-[0_0_50px_rgba(59,130,246,0.3)]',
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
          <h2 className="text-white mb-4">Our Products</h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Powerful tools and APIs to integrate satellite intelligence into your applications
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              {}
              <div className={`relative backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-500 h-full flex flex-col hover:${product.glowColor}`}>
                {}
                <div className={`absolute inset-0 bg-gradient-to-br ${product.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`} />

                {}
                <div className="relative">
                  <div className={`w-16 h-16 bg-gradient-to-br ${product.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-white">{product.icon}</span>
                  </div>
                </div>

                {}
                <div className="relative flex-1">
                  <h3 className="text-white mb-4">{product.title}</h3>
                  <p className="text-white/60 mb-6">{product.description}</p>

                  {}
                  <div className="space-y-2 mb-8">
                    {product.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 bg-gradient-to-r ${product.gradient} rounded-full`} />
                        <span className="text-white/70 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {}
                <button className="relative w-full py-3 backdrop-blur-md bg-white/5 border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 group/btn">
                  <span>Explore Product</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>

                {}
                <div className={`absolute -inset-1 bg-gradient-to-br ${product.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10 rounded-3xl`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}