import { toast } from 'react-toastify'

class EventService {
  constructor() {
    const { ApperClient } = window.ApperSDK
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = 'event2'
    this.fields = [
      'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy',
      'description', 'date', 'venue', 'status', 'budget', 'guest_count'
    ]
    this.updateableFields = [
      'Name', 'Tags', 'Owner', 'description', 'date', 'venue', 'status', 'budget', 'guest_count'
    ]
  }

  async fetchEvents() {
    try {
      const params = {
        fields: this.fields,
        orderBy: [{
          fieldName: 'CreatedOn',
          SortType: 'DESC'
        }]
      }

      const response = await this.apperClient.fetchRecords(this.tableName, params)
      
      if (!response || !response.data || response.data.length === 0) {
        return []
      }

      return response.data.map(event => ({
        id: event.Id,
        name: event.Name || '',
        description: event.description || '',
        date: event.date ? new Date(event.date) : new Date(),
        venue: event.venue || '',
        status: event.status || 'planning',
        budget: parseFloat(event.budget) || 0,
        guestCount: parseInt(event.guest_count) || 0,
        tags: event.Tags || '',
        createdAt: event.CreatedOn ? new Date(event.CreatedOn) : new Date(),
        tasks: [] // Tasks will be loaded separately
      }))
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Failed to load events')
      return []
    }
  }

  async getEventById(eventId) {
    try {
      const params = {
        fields: this.fields
      }

      const response = await this.apperClient.getRecordById(this.tableName, eventId, params)
      
      if (!response || !response.data) {
        return null
      }

      const event = response.data
      return {
        id: event.Id,
        name: event.Name || '',
        description: event.description || '',
        date: event.date ? new Date(event.date) : new Date(),
        venue: event.venue || '',
        status: event.status || 'planning',
        budget: parseFloat(event.budget) || 0,
        guestCount: parseInt(event.guest_count) || 0,
        tags: event.Tags || '',
        createdAt: event.CreatedOn ? new Date(event.CreatedOn) : new Date()
      }
    } catch (error) {
      console.error(`Error fetching event with ID ${eventId}:`, error)
      toast.error('Failed to load event details')
      return null
    }
  }

  async createEvents(eventData) {
    try {
      // Validate required fields
      if (!eventData.name || !eventData.date || !eventData.venue) {
        throw new Error('Please fill in all required fields')
      }

      // Format data for API
      const formattedData = {
        Name: eventData.name,
        description: eventData.description || '',
        date: new Date(eventData.date).toISOString(),
        venue: eventData.venue,
        status: eventData.status || 'planning',
        budget: parseFloat(eventData.budget) || 0,
        guest_count: parseInt(eventData.guestCount) || 0,
        Tags: eventData.tags || ''
      }

      const params = {
        records: [formattedData]
      }

      const response = await this.apperClient.createRecord(this.tableName, params)
      
      if (response && response.success && response.results) {
        const successfulRecords = response.results.filter(result => result.success)
        
        if (successfulRecords.length > 0) {
          toast.success('Event created successfully!')
          return successfulRecords.map(result => ({
            id: result.data.Id,
            name: result.data.Name,
            description: result.data.description,
            date: new Date(result.data.date),
            venue: result.data.venue,
            status: result.data.status,
            budget: parseFloat(result.data.budget) || 0,
            guestCount: parseInt(result.data.guest_count) || 0,
            createdAt: new Date(result.data.CreatedOn)
          }))
        }
      }
      
      throw new Error('Failed to create event')
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error(error.message || 'Failed to create event')
      throw error
    }
  }

  async updateEvents(eventData) {
    try {
      if (!eventData.id) {
        throw new Error('Event ID is required for update')
      }

      // Format data for API (only updateable fields)
      const formattedData = {
        Id: eventData.id,
        Name: eventData.name,
        description: eventData.description || '',
        date: new Date(eventData.date).toISOString(),
        venue: eventData.venue,
        status: eventData.status || 'planning',
        budget: parseFloat(eventData.budget) || 0,
        guest_count: parseInt(eventData.guestCount) || 0,
        Tags: eventData.tags || ''
      }

      const params = {
        records: [formattedData]
      }

      const response = await this.apperClient.updateRecord(this.tableName, params)
      
      if (response && response.success && response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        
        if (successfulUpdates.length > 0) {
          toast.success('Event updated successfully!')
          return successfulUpdates.map(result => ({
            id: result.data.Id,
            name: result.data.Name,
            description: result.data.description,
            date: new Date(result.data.date),
            venue: result.data.venue,
            status: result.data.status,
            budget: parseFloat(result.data.budget) || 0,
            guestCount: parseInt(result.data.guest_count) || 0
          }))
        }
      }
      
      throw new Error('Failed to update event')
    } catch (error) {
      console.error('Error updating event:', error)
      toast.error(error.message || 'Failed to update event')
      throw error
    }
  }

  async deleteEvents(eventIds) {
    try {
      const params = {
        RecordIds: Array.isArray(eventIds) ? eventIds : [eventIds]
      }

      const response = await this.apperClient.deleteRecord(this.tableName, params)
      
      if (response && response.success && response.results) {
        const successfulDeletions = response.results.filter(result => result.success)
        
        if (successfulDeletions.length > 0) {
          toast.success(`${successfulDeletions.length} event(s) deleted successfully!`)
          return true
        }
      }
      
      throw new Error('Failed to delete event(s)')
    } catch (error) {
      console.error('Error deleting events:', error)
      toast.error(error.message || 'Failed to delete event(s)')
      throw error
    }
  }

  async searchEvents(searchTerm) {
    try {
      const params = {
        fields: this.fields,
        where: [
          {
            fieldName: 'Name',
            operator: 'Contains',
            values: [searchTerm]
          }
        ]
      }

      const response = await this.apperClient.fetchRecords(this.tableName, params)
      
      if (!response || !response.data) {
        return []
      }

      return response.data.map(event => ({
        id: event.Id,
        name: event.Name || '',
        description: event.description || '',
        date: event.date ? new Date(event.date) : new Date(),
        venue: event.venue || '',
        status: event.status || 'planning',
        budget: parseFloat(event.budget) || 0,
        guestCount: parseInt(event.guest_count) || 0
      }))
    } catch (error) {
      console.error('Error searching events:', error)
      toast.error('Failed to search events')
      return []
    }
  }
}

export default new EventService()
