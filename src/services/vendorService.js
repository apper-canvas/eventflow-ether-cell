import { toast } from 'react-toastify'

class VendorService {
  constructor() {
    const { ApperClient } = window.ApperSDK
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = 'vendor2'
    this.fields = [
      'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy',
      'company', 'email', 'phone', 'specialty', 'location', 'rating', 'review_count',
      'description', 'website', 'price_range', 'availability', 'portfolio_images'
    ]
    this.updateableFields = [
      'Name', 'Tags', 'Owner', 'company', 'email', 'phone', 'specialty', 'location',
      'rating', 'review_count', 'description', 'website', 'price_range', 'availability', 'portfolio_images'
    ]
  }

  async fetchVendors() {
    try {
      const params = {
        fields: this.fields,
        orderBy: [{
          fieldName: 'rating',
          SortType: 'DESC'
        }]
      }

      const response = await this.apperClient.fetchRecords(this.tableName, params)
      
      if (!response || !response.data || response.data.length === 0) {
        return []
      }

      return response.data.map(vendor => ({
        id: vendor.Id,
        name: vendor.Name || '',
        company: vendor.company || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        specialty: vendor.specialty || '',
        location: vendor.location || '',
        rating: parseFloat(vendor.rating) || 0,
        reviewCount: parseInt(vendor.review_count) || 0,
        description: vendor.description || '',
        website: vendor.website || '',
        priceRange: vendor.price_range || '$$',
        availability: vendor.availability || 'available',
        portfolioImages: vendor.portfolio_images ? vendor.portfolio_images.split(',').filter(img => img.trim()) : [],
        tags: vendor.Tags || '',
        createdAt: vendor.CreatedOn ? new Date(vendor.CreatedOn) : new Date()
      }))
    } catch (error) {
      console.error('Error fetching vendors:', error)
      toast.error('Failed to load vendors')
      return []
    }
  }

  async getVendorById(vendorId) {
    try {
      const params = {
        fields: this.fields
      }

      const response = await this.apperClient.getRecordById(this.tableName, vendorId, params)
      
      if (!response || !response.data) {
        return null
      }

      const vendor = response.data
      return {
        id: vendor.Id,
        name: vendor.Name || '',
        company: vendor.company || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        specialty: vendor.specialty || '',
        location: vendor.location || '',
        rating: parseFloat(vendor.rating) || 0,
        reviewCount: parseInt(vendor.review_count) || 0,
        description: vendor.description || '',
        website: vendor.website || '',
        priceRange: vendor.price_range || '$$',
        availability: vendor.availability || 'available',
        portfolioImages: vendor.portfolio_images ? vendor.portfolio_images.split(',').filter(img => img.trim()) : [],
        tags: vendor.Tags || '',
        createdAt: vendor.CreatedOn ? new Date(vendor.CreatedOn) : new Date()
      }
    } catch (error) {
      console.error(`Error fetching vendor with ID ${vendorId}:`, error)
      toast.error('Failed to load vendor details')
      return null
    }
  }

  async createVendors(vendorData) {
    try {
      // Validate required fields
      if (!vendorData.name || !vendorData.company || !vendorData.email || !vendorData.specialty) {
        throw new Error('Vendor name, company, email, and specialty are required')
      }

      // Format data for API
      const formattedData = {
        Name: vendorData.name,
        company: vendorData.company,
        email: vendorData.email,
        phone: vendorData.phone || '',
        specialty: vendorData.specialty,
        location: vendorData.location || '',
        rating: parseFloat(vendorData.rating) || 0,
        review_count: parseInt(vendorData.reviewCount) || 0,
        description: vendorData.description || '',
        website: vendorData.website || '',
        price_range: vendorData.priceRange || '$$',
        availability: vendorData.availability || 'available',
        portfolio_images: Array.isArray(vendorData.portfolioImages) ? vendorData.portfolioImages.join(',') : '',
        Tags: vendorData.tags || ''
      }

      const params = {
        records: [formattedData]
      }

      const response = await this.apperClient.createRecord(this.tableName, params)
      
      if (response && response.success && response.results) {
        const successfulRecords = response.results.filter(result => result.success)
        
        if (successfulRecords.length > 0) {
          toast.success('Vendor added successfully!')
          return successfulRecords.map(result => ({
            id: result.data.Id,
            name: result.data.Name,
            company: result.data.company,
            email: result.data.email,
            phone: result.data.phone,
            specialty: result.data.specialty,
            location: result.data.location,
            rating: parseFloat(result.data.rating) || 0,
            reviewCount: parseInt(result.data.review_count) || 0,
            description: result.data.description,
            website: result.data.website,
            priceRange: result.data.price_range,
            availability: result.data.availability,
            portfolioImages: result.data.portfolio_images ? result.data.portfolio_images.split(',').filter(img => img.trim()) : [],
            tags: result.data.Tags,
            createdAt: new Date(result.data.CreatedOn)
          }))
        }
      }
      
      throw new Error('Failed to add vendor')
    } catch (error) {
      console.error('Error creating vendor:', error)
      toast.error(error.message || 'Failed to add vendor')
      throw error
    }
  }

  async updateVendors(vendorData) {
    try {
      if (!vendorData.id) {
        throw new Error('Vendor ID is required for update')
      }

      // Format data for API (only updateable fields)
      const formattedData = {
        Id: vendorData.id,
        Name: vendorData.name,
        company: vendorData.company,
        email: vendorData.email,
        phone: vendorData.phone || '',
        specialty: vendorData.specialty,
        location: vendorData.location || '',
        rating: parseFloat(vendorData.rating) || 0,
        review_count: parseInt(vendorData.reviewCount) || 0,
        description: vendorData.description || '',
        website: vendorData.website || '',
        price_range: vendorData.priceRange || '$$',
        availability: vendorData.availability || 'available',
        portfolio_images: Array.isArray(vendorData.portfolioImages) ? vendorData.portfolioImages.join(',') : '',
        Tags: vendorData.tags || ''
      }

      const params = {
        records: [formattedData]
      }

      const response = await this.apperClient.updateRecord(this.tableName, params)
      
      if (response && response.success && response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        
        if (successfulUpdates.length > 0) {
          toast.success('Vendor updated successfully!')
          return successfulUpdates.map(result => ({
            id: result.data.Id,
            name: result.data.Name,
            company: result.data.company,
            email: result.data.email,
            phone: result.data.phone,
            specialty: result.data.specialty,
            location: result.data.location,
            rating: parseFloat(result.data.rating) || 0,
            reviewCount: parseInt(result.data.review_count) || 0,
            description: result.data.description,
            website: result.data.website,
            priceRange: result.data.price_range,
            availability: result.data.availability,
            portfolioImages: result.data.portfolio_images ? result.data.portfolio_images.split(',').filter(img => img.trim()) : [],
            tags: result.data.Tags
          }))
        }
      }
      
      throw new Error('Failed to update vendor')
    } catch (error) {
      console.error('Error updating vendor:', error)
      toast.error(error.message || 'Failed to update vendor')
      throw error
    }
  }

  async deleteVendors(vendorIds) {
    try {
      const params = {
        RecordIds: Array.isArray(vendorIds) ? vendorIds : [vendorIds]
      }

      const response = await this.apperClient.deleteRecord(this.tableName, params)
      
      if (response && response.success && response.results) {
        const successfulDeletions = response.results.filter(result => result.success)
        
        if (successfulDeletions.length > 0) {
          toast.success(`${successfulDeletions.length} vendor(s) deleted successfully!`)
          return true
        }
      }
      
      throw new Error('Failed to delete vendor(s)')
    } catch (error) {
      console.error('Error deleting vendors:', error)
      toast.error(error.message || 'Failed to delete vendor(s)')
      throw error
    }
  }

  async updateVendorRating(vendorId, newRating) {
    try {
      // First get current vendor data to calculate new average
      const vendor = await this.getVendorById(vendorId)
      if (!vendor) {
        throw new Error('Vendor not found')
      }

      const totalRating = (vendor.rating * vendor.reviewCount) + newRating
      const newReviewCount = vendor.reviewCount + 1
      const newAverageRating = totalRating / newReviewCount

      const formattedData = {
        Id: vendorId,
        rating: newAverageRating,
        review_count: newReviewCount
      }

      const params = {
        records: [formattedData]
      }

      const response = await this.apperClient.updateRecord(this.tableName, params)
      
      if (response && response.success && response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        
        if (successfulUpdates.length > 0) {
          toast.success('Rating updated successfully!')
          return true
        }
      }
      
      throw new Error('Failed to update rating')
    } catch (error) {
      console.error('Error updating vendor rating:', error)
      toast.error('Failed to update rating')
      throw error
    }
  }

  async updateAvailability(vendorId, availability) {
    try {
      const formattedData = {
        Id: vendorId,
        availability: availability
      }

      const params = {
        records: [formattedData]
      }

      const response = await this.apperClient.updateRecord(this.tableName, params)
      
      if (response && response.success && response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        
        if (successfulUpdates.length > 0) {
          toast.success('Vendor availability updated!')
          return true
        }
      }
      
      throw new Error('Failed to update availability')
    } catch (error) {
      console.error('Error updating vendor availability:', error)
      toast.error('Failed to update availability')
      throw error
    }
  }

  async searchVendors(searchTerm, filters = {}) {
    try {
      const whereConditions = []

      // Search term condition
      if (searchTerm) {
        whereConditions.push({
          fieldName: 'Name',
          operator: 'Contains',
          values: [searchTerm]
        })
      }

      // Filter conditions
      if (filters.specialty) {
        whereConditions.push({
          fieldName: 'specialty',
          operator: 'ExactMatch',
          values: [filters.specialty]
        })
      }

      if (filters.availability) {
        whereConditions.push({
          fieldName: 'availability',
          operator: 'ExactMatch',
          values: [filters.availability]
        })
      }

      if (filters.priceRange) {
        whereConditions.push({
          fieldName: 'price_range',
          operator: 'ExactMatch',
          values: [filters.priceRange]
        })
      }

      if (filters.rating) {
        whereConditions.push({
          fieldName: 'rating',
          operator: 'GreaterThanOrEqualTo',
          values: [parseFloat(filters.rating)]
        })
      }

      const params = {
        fields: this.fields,
        where: whereConditions
      }

      const response = await this.apperClient.fetchRecords(this.tableName, params)
      
      if (!response || !response.data) {
        return []
      }

      return response.data.map(vendor => ({
        id: vendor.Id,
        name: vendor.Name || '',
        company: vendor.company || '',
        email: vendor.email || '',
        specialty: vendor.specialty || '',
        location: vendor.location || '',
        rating: parseFloat(vendor.rating) || 0,
        reviewCount: parseInt(vendor.review_count) || 0,
        priceRange: vendor.price_range || '$$',
        availability: vendor.availability || 'available'
      }))
    } catch (error) {
      console.error('Error searching vendors:', error)
      toast.error('Failed to search vendors')
      return []
    }
  }
}

export default new VendorService()
