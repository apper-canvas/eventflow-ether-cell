import { useState } from 'react'
import { motion } from 'framer-motion'
import Dashboard from '../components/Dashboard'

import ApperIcon from '../components/ApperIcon'

const Home = () => {
  const [darkMode, setDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-surface-200/50 shadow-soft"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-glow">
                <ApperIcon name="Calendar" className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold gradient-text">EventFlow</h1>
                <p className="text-xs sm:text-sm text-surface-600 hidden sm:block">Event Management Platform</p>
              </div>
            </motion.div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleDarkMode}
                className="p-2 sm:p-3 rounded-xl bg-surface-100 hover:bg-surface-200 transition-colors duration-300"
              >
                <ApperIcon name={darkMode ? "Sun" : "Moon"} className="w-5 h-5 sm:w-6 sm:h-6 text-surface-600" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
              >
                <span className="hidden sm:inline">Create Event</span>
                <span className="sm:hidden">Create</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-20 sm:pt-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1920&q=80')] opacity-5 bg-cover bg-center"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-6 sm:space-y-8"
              >
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-surface-900 leading-tight">
                    Manage Your Events{' '}
                    <span className="gradient-text">Seamlessly</span>
                  </h2>
                  <p className="text-lg sm:text-xl text-surface-600 max-w-lg">
                    Streamline your event planning process with our comprehensive platform. 
                    From guest management to budget tracking, everything you need in one place.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary text-base sm:text-lg"
                  >
                    Get Started Free
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-secondary text-base sm:text-lg"
                  >
                    Watch Demo
                  </motion.button>
                </div>

                <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-6 sm:pt-8">
                  {[
                    { icon: 'Users', label: '10K+ Events', value: 'Managed' },
                    { icon: 'Award', label: '98% Success', value: 'Rate' },
                    { icon: 'Clock', label: '24/7 Support', value: 'Available' }
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="text-center"
                    >
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                        <ApperIcon name={stat.icon} className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                      </div>
                      <div className="text-lg sm:text-xl font-bold text-surface-900">{stat.label}</div>
                      <div className="text-sm sm:text-base text-surface-600">{stat.value}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl"></div>
                <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl p-6 sm:p-8 shadow-card border border-white/50">
                  <img 
                    src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80"
                    alt="Event Management Dashboard"
                    className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-2xl shadow-soft"
                  />
                  
                  <div className="absolute top-8 sm:top-12 right-8 sm:right-12 bg-white rounded-xl p-3 sm:p-4 shadow-card">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                      <span className="text-sm sm:text-base font-medium text-surface-700">Live Updates</span>
                    </div>
                  </div>

                  <div className="absolute bottom-8 sm:bottom-12 left-8 sm:left-12 bg-white rounded-xl p-3 sm:p-4 shadow-card">
                    <div className="text-xs sm:text-sm text-surface-600">Next Event</div>
                    <div className="font-bold text-surface-900 text-sm sm:text-base">Product Launch</div>
                    <div className="text-xs sm:text-sm text-primary">In 3 days</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Main Feature Section */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12 sm:mb-16"
            >
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-surface-900 mb-4 sm:mb-6">
                Your Event Command Center
              </h3>
              <p className="text-lg sm:text-xl text-surface-600 max-w-3xl mx-auto">
                Take control of every aspect of your events with our intuitive dashboard
              </p>
            </motion.div>
            
            <Dashboard />

          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <ApperIcon name="Calendar" className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">EventFlow</span>
              </div>
              <p className="text-surface-400 text-sm sm:text-base">
                Streamlining event management for businesses worldwide.
              </p>
            </div>
            
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Enterprise', 'Security'] },
              { title: 'Company', links: ['About', 'Careers', 'Blog', 'Press'] },
              { title: 'Support', links: ['Help Center', 'Contact', 'Status', 'Documentation'] }
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">{section.title}</h4>
                <ul className="space-y-2 sm:space-y-3">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-surface-400 hover:text-white transition-colors text-sm sm:text-base">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-surface-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center">
            <p className="text-surface-400 text-sm sm:text-base">
              © 2024 EventFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home