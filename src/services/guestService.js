import { toast } from 'react-toastify'

class GuestService {
  constructor() {
    const { ApperClient } = window.ApperSDK
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = 'guest'
    this.fields = [
      'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy',
      'email', 'rsvp_status', 'event'
    ]
    this.updateableFields = [
      'Name', 'Tags', 'Owner', 'email', 'rsvp_status', 'event'
    ]
  }

  async fetchGuests(eventId = null) {
    try {
      const params = {
        fields: this.fields,
        orderBy: [{
          fieldName: 'CreatedOn',
          SortType: 'DESC'
        }]
      }

      // Filter by event if eventId is provided
      if (eventId) {
        params.where = [{
          fieldName: 'event',
          operator: 'EqualTo',
          values: [eventId]
        }]
      }

      const response = await this.apperClient.fetchRecords(this.tableName, params)
      
      if (!response || !response.data || response.data.length === 0) {
        return []
      }

      return response.data.map(guest => ({
        id: guest.Id,
        name: guest.Name || '',
        email: guest.email || '',
        rsvpStatus: guest.rsvp_status || 'pending',
        eventId: guest.event || '',
        tags: guest.Tags || '',
        createdAt: guest.CreatedOn ? new Date(guest.CreatedOn) : new Date()
      }))
    } catch (error) {
      console.error('Error fetching guests:', error)
      toast.error('Failed to load guests')
      return []
    }
  }

  async getGuestById(guestId) {
    try {
      const params = {
        fields: this.fields
      }

      const response = await this.apperClient.getRecordById(this.tableName, guestId, params)
      
      if (!response || !response.data) {
        return null
      }

      const guest = response.data
      return {
        id: guest.Id,
        name: guest.Name || '',
        email: guest.email || '',
        rsvpStatus: guest.rsvp_status || 'pending',
        eventId: guest.event || '',
        tags: guest.Tags || '',
        createdAt: guest.CreatedOn ? new Date(guest.CreatedOn) : new Date()
      }
    } catch (error) {
      console.error(`Error fetching guest with ID ${guestId}:`, error)
      toast.error('Failed to load guest details')
      return null
    }
  }

  async createGuests(guestData) {
    try {
      // Validate required fields
      if (!guestData.name || !guestData.email) {
        throw new Error('Guest name and email are required')
      }

      // Format data for API
      const formattedData = {
        Name: guestData.name,
        email: guestData.email,
        rsvp_status: guestData.rsvpStatus || 'pending',
        event: guestData.eventId || '',
        Tags: guestData.tags || ''
      }

      const params = {
        records: [formattedData]
      }

      const response = await this.apperClient.createRecord(this.tableName, params)
      
      if (response && response.success && response.results) {
        const successfulRecords = response.results.filter(result => result.success)
        
        if (successfulRecords.length > 0) {
          toast.success('Guest added successfully!')
          return successfulRecords.map(result => ({
            id: result.data.Id,
            name: result.data.Name,
            email: result.data.email,
            rsvpStatus: result.data.rsvp_status,
            eventId: result.data.event,
            tags: result.data.Tags,
            createdAt: new Date(result.data.CreatedOn)
          }))
        }
      }
      
      throw new Error('Failed to add guest')
    } catch (error) {
      console.error('Error creating guest:', error)
      toast.error(error.message || 'Failed to add guest')
      throw error
    }
  }

  async updateGuests(guestData) {
    try {
      if (!guestData.id) {
        throw new Error('Guest ID is required for update')
      }

      // Format data for API (only updateable fields)
      const formattedData = {
        Id: guestData.id,
        Name: guestData.name,
        email: guestData.email,
        rsvp_status: guestData.rsvpStatus || 'pending',
        event: guestData.eventId || '',
        Tags: guestData.tags || ''
      }

      const params = {
        records: [formattedData]
      }

      const response = await this.apperClient.updateRecord(this.tableName, params)
      
      if (response && response.success && response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        
        if (successfulUpdates.length > 0) {
          toast.success('Guest updated successfully!')
          return successfulUpdates.map(result => ({
            id: result.data.Id,
            name: result.data.Name,
            email: result.data.email,
            rsvpStatus: result.data.rsvp_status,
            eventId: result.data.event,
            tags: result.data.Tags
          }))
        }
      }
      
      throw new Error('Failed to update guest')
    } catch (error) {
      console.error('Error updating guest:', error)
      toast.error(error.message || 'Failed to update guest')
      throw error
    }
  }

  async deleteGuests(guestIds) {
    try {
      const params = {
        RecordIds: Array.isArray(guestIds) ? guestIds : [guestIds]
      }

      const response = await this.apperClient.deleteRecord(this.tableName, params)
      
      if (response && response.success && response.results) {
        const successfulDeletions = response.results.filter(result => result.success)
        
        if (successfulDeletions.length > 0) {
          toast.success(`${successfulDeletions.length} guest(s) deleted successfully!`)
          return true
        }
      }
      
      throw new Error('Failed to delete guest(s)')
    } catch (error) {
      console.error('Error deleting guests:', error)
      toast.error(error.message || 'Failed to delete guest(s)')
      throw error
    }
  }

  async updateRsvpStatus(guestId, status) {
    try {
      const formattedData = {
        Id: guestId,
        rsvp_status: status
      }

      const params = {
        records: [formattedData]
      }

      const response = await this.apperClient.updateRecord(this.tableName, params)
      
      if (response && response.success && response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        
        if (successfulUpdates.length > 0) {
          toast.success(`RSVP status updated to ${status}`)
          return true
        }
      }
      
      throw new Error('Failed to update RSVP status')
    } catch (error) {
      console.error('Error updating RSVP status:', error)
      toast.error('Failed to update RSVP status')
      throw error
    }
  }

  async searchGuests(searchTerm, eventId = null) {
    try {
      const whereConditions = [
        {
          fieldName: 'Name',
          operator: 'Contains',
          values: [searchTerm]
        }
      ]

      if (eventId) {
        whereConditions.push({
          fieldName: 'event',
          operator: 'EqualTo',
          values: [eventId]
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

      return response.data.map(guest => ({
        id: guest.Id,
        name: guest.Name || '',
        email: guest.email || '',
        rsvpStatus: guest.rsvp_status || 'pending',
        eventId: guest.event || ''
      }))
    } catch (error) {
      console.error('Error searching guests:', error)
      toast.error('Failed to search guests')
      return []
    }
  }
}

export default new GuestService()
