import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '../ApperIcon'
import StarRating from '../StarRating'
import vendorService from '../../services/vendorService'
import { availabilityColors, priceRangeColors } from '../../constants/colors'
import { specialtyOptions } from '../../constants/vendorConstants'


const VendorsTab = () => {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [vendorSearch, setVendorSearch] = useState('')
  const [vendorFilter, setVendorFilter] = useState({
    specialty: '',
    rating: '',
    availability: '',
    priceRange: ''
  })

  
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [showVendorForm, setShowVendorForm] = useState(false)
  const [showVendorDetails, setShowVendorDetails] = useState(false)
  const [newVendor, setNewVendor] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    specialty: '',
    location: '',
    description: '',
    website: '',
    priceRange: '$$'
  })

  // Load vendors on component mount
  useEffect(() => {
    loadVendors()
  }, [])

  const loadVendors = async () => {
    setLoading(true)
    setError(null)
    try {
      const vendorsData = await vendorService.fetchVendors()
      setVendors(vendorsData)
    } catch (err) {
      setError('Failed to load vendors')
      console.error('Error loading vendors:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(vendorSearch.toLowerCase()) ||
                         vendor.company.toLowerCase().includes(vendorSearch.toLowerCase()) ||
                         vendor.specialty.toLowerCase().includes(vendorSearch.toLowerCase())
    
    const matchesSpecialty = !vendorFilter.specialty || vendor.specialty === vendorFilter.specialty
    const matchesRating = !vendorFilter.rating || vendor.rating >= parseFloat(vendorFilter.rating)
    const matchesAvailability = !vendorFilter.availability || vendor.availability === vendorFilter.availability
    const matchesPriceRange = !vendorFilter.priceRange || vendor.priceRange === vendorFilter.priceRange
    
    return matchesSearch && matchesSpecialty && matchesRating && matchesAvailability && matchesPriceRange
  })


  const handleCreateVendor = async (e) => {
    e.preventDefault()
    if (!newVendor.name || !newVendor.company || !newVendor.email || !newVendor.specialty) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const createdVendors = await vendorService.createVendors({
        name: newVendor.name,
        company: newVendor.company,
        email: newVendor.email,
        phone: newVendor.phone,
        specialty: newVendor.specialty,
        location: newVendor.location,
        description: newVendor.description,
        website: newVendor.website,
        priceRange: newVendor.priceRange,
        rating: 0,
        reviewCount: 0,
        availability: 'available',
        portfolioImages: []
      })

      if (createdVendors && createdVendors.length > 0) {
        setVendors(prev => [...prev, ...createdVendors])
        setNewVendor({
          name: '', company: '', email: '', phone: '', specialty: '',
          location: '', description: '', website: '', priceRange: '$$'
        })
        setShowVendorForm(false)
        toast.success('Vendor added successfully!')
      }
    } catch (error) {
      console.error('Error creating vendor:', error)
    } finally {
      setLoading(false)
    }
  }


  const updateVendorRating = async (vendorId, newRating) => {
    try {
      await vendorService.updateVendorRating(vendorId, newRating)
      // Reload vendors to get updated data
      loadVendors()
    } catch (err) {
      console.error('Error updating vendor rating:', err)
    }
  }


  const toggleVendorAvailability = async (vendorId) => {
    try {
      const vendor = vendors.find(v => v.id === vendorId)
      if (!vendor) return

      const newAvailability = vendor.availability === 'available' ? 'busy' : 'available'
      await vendorService.updateAvailability(vendorId, newAvailability)
      
      setVendors(prev => prev.map(vendor => {
        if (vendor.id === vendorId) {
          return { ...vendor, availability: newAvailability }
        }
        return vendor
      }))
    } catch (err) {
      console.error('Error updating vendor availability:', err)
    }
  }


  const deleteVendor = async (vendorId) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        await vendorService.deleteVendors(vendorId)
        setVendors(prev => prev.filter(vendor => vendor.id !== vendorId))
      } catch (err) {
        console.error('Error deleting vendor:', err)
      }
    }
  }

  if (loading && vendors.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-12"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-surface-600">Loading vendors...</span>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={loadVendors}
          className="btn-primary"
        >
          Try Again
        </button>
      </motion.div>
    )
  }


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h3 className="text-2xl sm:text-3xl font-bold text-surface-900">Vendor Directory</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowVendorForm(true)}
          className="btn-primary inline-flex items-center space-x-2"
        >
          <ApperIcon name="Plus" className="w-5 h-5" />
          <span>Add Vendor</span>
        </motion.button>
      </div>

      {/* Search and Filters */}
      <div className="card-neu">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input
                type="text"
                value={vendorSearch}
                onChange={(e) => setVendorSearch(e.target.value)}
                className="input-field pl-10"
                placeholder="Search vendors by name, company, or specialty..."
              />
            </div>
          </div>
          
          <select
            value={vendorFilter.specialty}
            onChange={(e) => setVendorFilter(prev => ({ ...prev, specialty: e.target.value }))}
            className="input-field"
          >
            <option value="">All Specialties</option>
            {specialtyOptions.map(specialty => (
              <option key={specialty} value={specialty}>{specialty}</option>
            ))}
          </select>
          
          <select
            value={vendorFilter.rating}
            onChange={(e) => setVendorFilter(prev => ({ ...prev, rating: e.target.value }))}
            className="input-field"
          >
            <option value="">All Ratings</option>
            <option value="4.5">4.5+ Stars</option>
            <option value="4.0">4.0+ Stars</option>
            <option value="3.5">3.5+ Stars</option>
            <option value="3.0">3.0+ Stars</option>
          </select>
          
          <select
            value={vendorFilter.availability}
            onChange={(e) => setVendorFilter(prev => ({ ...prev, availability: e.target.value }))}
            className="input-field"
          >
            <option value="">All Availability</option>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="partially-available">Partially Available</option>
          </select>
        </div>
        
        {(vendorSearch || Object.values(vendorFilter).some(Boolean)) && (
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-surface-600">
              Found {filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => {
                setVendorSearch('')
                setVendorFilter({ specialty: '', rating: '', availability: '', priceRange: '' })
              }}
              className="text-sm text-primary hover:text-primary-dark transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Vendor Creation Form Modal */}
      <AnimatePresence>
        {showVendorForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowVendorForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-2xl font-bold text-surface-900">Add New Vendor</h4>
                <button
                  onClick={() => setShowVendorForm(false)}
                  className="p-2 hover:bg-surface-100 rounded-xl transition-colors"
                >
                  <ApperIcon name="X" className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleCreateVendor} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      value={newVendor.name}
                      onChange={(e) => setNewVendor(prev => ({ ...prev, name: e.target.value }))}
                      className="input-field"
                      placeholder="Enter contact name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={newVendor.company}
                      onChange={(e) => setNewVendor(prev => ({ ...prev, company: e.target.value }))}
                      className="input-field"
                      placeholder="Enter company name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={newVendor.email}
                      onChange={(e) => setNewVendor(prev => ({ ...prev, email: e.target.value }))}
                      className="input-field"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Specialty *
                    </label>
                    <select
                      value={newVendor.specialty}
                      onChange={(e) => setNewVendor(prev => ({ ...prev, specialty: e.target.value }))}
                      className="input-field"
                      required
                    >
                      <option value="">Select Specialty</option>
                      {specialtyOptions.map(specialty => (
                        <option key={specialty} value={specialty}>{specialty}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Vendor'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowVendorForm(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredVendors.map((vendor, index) => (
          <motion.div
            key={vendor.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card-neu group hover:shadow-glow cursor-pointer"
            onClick={() => {
              setSelectedVendor(vendor)
              setShowVendorDetails(true)
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="text-lg font-bold text-surface-900 mb-1 group-hover:text-primary transition-colors">
                  {vendor.company}
                </h4>
                <p className="text-surface-600 text-sm mb-2">{vendor.name}</p>
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {vendor.specialty}
                </span>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${availabilityColors[vendor.availability]}`}>
                  {vendor.availability === 'available' ? 'Available' : vendor.availability === 'busy' ? 'Busy' : 'Partial'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${priceRangeColors[vendor.priceRange]}`}>
                  {vendor.priceRange}
                </span>
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2 text-sm text-surface-600">
                <ApperIcon name="Mail" className="w-4 h-4" />
                <span className="truncate">{vendor.email}</span>
              </div>
            </div>
            
            <div className="mb-4">
              <StarRating rating={vendor.rating} readonly={true} size="w-4 h-4" />
            </div>
            
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(`mailto:${vendor.email}`, '_blank')
                }}
                className="flex-1 px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
              >
                <ApperIcon name="Mail" className="w-4 h-4 mr-1 inline" />
                Contact
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
      
      {filteredVendors.length === 0 && (
        <div className="text-center py-12">
          <ApperIcon name="Building2" className="w-16 h-16 text-surface-300 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-surface-900 mb-2">No vendors found</h4>
          <p className="text-surface-600 mb-6">
            {vendorSearch || Object.values(vendorFilter).some(Boolean)
              ? 'Try adjusting your search criteria or filters'
              : 'Get started by adding your first vendor to the directory'}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowVendorForm(true)}
            className="btn-primary"
          >
            <ApperIcon name="Plus" className="w-5 h-5 mr-2" />
            Add First Vendor
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}

export default VendorsTab