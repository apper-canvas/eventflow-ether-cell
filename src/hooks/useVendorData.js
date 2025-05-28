import { useState } from 'react'

export const useVendorData = () => {
  const [vendors, setVendors] = useState([
    {
      id: '1',
      name: 'Sarah Mitchell',
      company: 'Elite Catering Co.',
      email: 'sarah@elitecatering.com',
      phone: '+1 (555) 123-4567',
      specialty: 'Catering',
      location: 'New York, NY',
      rating: 4.8,
      reviewCount: 32,
      description: 'Premium catering services for corporate and private events with over 10 years of experience.',
      website: 'www.elitecatering.com',
      priceRange: '$$$',
      availability: 'available',
      portfolioImages: [
        'https://images.unsplash.com/photo-1555244162-803834f70033?w=400',
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400'
      ]
    },
    {
      id: '2',
      name: 'David Rodriguez',
      company: 'Sound & Light Pro',
      email: 'david@soundlightpro.com',
      phone: '+1 (555) 987-6543',
      specialty: 'Audio/Visual',
      location: 'Los Angeles, CA',
      rating: 4.6,
      reviewCount: 28,
      description: 'Professional audio-visual equipment and technical support for events of all sizes.',
      website: 'www.soundlightpro.com',
      priceRange: '$$',
      availability: 'busy',
      portfolioImages: [
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400'
      ]
    }
  ])

  const [vendorSearch, setVendorSearch] = useState('')
  const [vendorFilter, setVendorFilter] = useState({
    specialty: '',
    rating: '',
    availability: '',
    priceRange: ''
  })

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

  return {
    vendors,
    setVendors,
    vendorSearch,
    setVendorSearch,
    vendorFilter,
    setVendorFilter,
    filteredVendors
  }
}
