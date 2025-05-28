import { toast } from 'react-toastify'

class BudgetItemService {
  constructor() {
    const { ApperClient } = window.ApperSDK
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = 'budget_item'
    this.fields = [
      'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy',
      'event', 'category', 'allocated_amount', 'spent_amount'
    ]
    this.updateableFields = [
      'Name', 'Tags', 'Owner', 'event', 'category', 'allocated_amount', 'spent_amount'
    ]
  }

  async fetchBudgetItems(eventId = null) {
    try {
      const params = {
        fields: this.fields,
        orderBy: [{
          fieldName: 'category',
          SortType: 'ASC'
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

      return response.data.map(item => ({
        id: item.Id,
        name: item.Name || '',
        eventId: item.event || '',
        category: item.category || '',
        allocatedAmount: parseFloat(item.allocated_amount) || 0,
        spentAmount: parseFloat(item.spent_amount) || 0,
        tags: item.Tags || '',
        createdAt: item.CreatedOn ? new Date(item.CreatedOn) : new Date()
      }))
    } catch (error) {
      console.error('Error fetching budget items:', error)
      toast.error('Failed to load budget items')
      return []
    }
  }

  async getBudgetItemById(itemId) {
    try {
      const params = {
        fields: this.fields
      }

      const response = await this.apperClient.getRecordById(this.tableName, itemId, params)
      
      if (!response || !response.data) {
        return null
      }

      const item = response.data
      return {
        id: item.Id,
        name: item.Name || '',
        eventId: item.event || '',
        category: item.category || '',
        allocatedAmount: parseFloat(item.allocated_amount) || 0,
        spentAmount: parseFloat(item.spent_amount) || 0,
        tags: item.Tags || '',
        createdAt: item.CreatedOn ? new Date(item.CreatedOn) : new Date()
      }
    } catch (error) {
      console.error(`Error fetching budget item with ID ${itemId}:`, error)
      toast.error('Failed to load budget item details')
      return null
    }
  }

  async createBudgetItems(itemData) {
    try {
      // Validate required fields
      if (!itemData.name || !itemData.category || !itemData.eventId) {
        throw new Error('Budget item name, category, and event are required')
      }

      // Format data for API
      const formattedData = {
        Name: itemData.name,
        event: itemData.eventId,
        category: itemData.category,
        allocated_amount: parseFloat(itemData.allocatedAmount) || 0,
        spent_amount: parseFloat(itemData.spentAmount) || 0,
        Tags: itemData.tags || ''
      }

      const params = {
        records: [formattedData]
      }

      const response = await this.apperClient.createRecord(this.tableName, params)
      
      if (response && response.success && response.results) {
        const successfulRecords = response.results.filter(result => result.success)
        
        if (successfulRecords.length > 0) {
          toast.success('Budget item created successfully!')
          return successfulRecords.map(result => ({
            id: result.data.Id,
            name: result.data.Name,
            eventId: result.data.event,
            category: result.data.category,
            allocatedAmount: parseFloat(result.data.allocated_amount) || 0,
            spentAmount: parseFloat(result.data.spent_amount) || 0,
            tags: result.data.Tags,
            createdAt: new Date(result.data.CreatedOn)
          }))
        }
      }
      
      throw new Error('Failed to create budget item')
    } catch (error) {
      console.error('Error creating budget item:', error)
      toast.error(error.message || 'Failed to create budget item')
      throw error
    }
  }

  async updateBudgetItems(itemData) {
    try {
      if (!itemData.id) {
        throw new Error('Budget item ID is required for update')
      }

      // Format data for API (only updateable fields)
      const formattedData = {
        Id: itemData.id,
        Name: itemData.name,
        event: itemData.eventId,
        category: itemData.category,
        allocated_amount: parseFloat(itemData.allocatedAmount) || 0,
        spent_amount: parseFloat(itemData.spentAmount) || 0,
        Tags: itemData.tags || ''
      }

      const params = {
        records: [formattedData]
      }

      const response = await this.apperClient.updateRecord(this.tableName, params)
      
      if (response && response.success && response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        
        if (successfulUpdates.length > 0) {
          toast.success('Budget item updated successfully!')
          return successfulUpdates.map(result => ({
            id: result.data.Id,
            name: result.data.Name,
            eventId: result.data.event,
            category: result.data.category,
            allocatedAmount: parseFloat(result.data.allocated_amount) || 0,
            spentAmount: parseFloat(result.data.spent_amount) || 0,
            tags: result.data.Tags
          }))
        }
      }
      
      throw new Error('Failed to update budget item')
    } catch (error) {
      console.error('Error updating budget item:', error)
      toast.error(error.message || 'Failed to update budget item')
      throw error
    }
  }

  async deleteBudgetItems(itemIds) {
    try {
      const params = {
        RecordIds: Array.isArray(itemIds) ? itemIds : [itemIds]
      }

      const response = await this.apperClient.deleteRecord(this.tableName, params)
      
      if (response && response.success && response.results) {
        const successfulDeletions = response.results.filter(result => result.success)
        
        if (successfulDeletions.length > 0) {
          toast.success(`${successfulDeletions.length} budget item(s) deleted successfully!`)
          return true
        }
      }
      
      throw new Error('Failed to delete budget item(s)')
    } catch (error) {
      console.error('Error deleting budget items:', error)
      toast.error(error.message || 'Failed to delete budget item(s)')
      throw error
    }
  }

  async updateSpentAmount(itemId, spentAmount) {
    try {
      const formattedData = {
        Id: itemId,
        spent_amount: parseFloat(spentAmount) || 0
      }

      const params = {
        records: [formattedData]
      }

      const response = await this.apperClient.updateRecord(this.tableName, params)
      
      if (response && response.success && response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        
        if (successfulUpdates.length > 0) {
          toast.success('Spent amount updated successfully!')
          return true
        }
      }
      
      throw new Error('Failed to update spent amount')
    } catch (error) {
      console.error('Error updating spent amount:', error)
      toast.error('Failed to update spent amount')
      throw error
    }
  }

  async getBudgetSummary(eventId) {
    try {
      const items = await this.fetchBudgetItems(eventId)
      
      const totalAllocated = items.reduce((sum, item) => sum + item.allocatedAmount, 0)
      const totalSpent = items.reduce((sum, item) => sum + item.spentAmount, 0)
      const utilization = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0
      
      return {
        totalAllocated,
        totalSpent,
        utilization,
        remaining: totalAllocated - totalSpent,
        itemCount: items.length
      }
    } catch (error) {
      console.error('Error calculating budget summary:', error)
      return {
        totalAllocated: 0,
        totalSpent: 0,
        utilization: 0,
        remaining: 0,
        itemCount: 0
      }
    }
  }
}

export default new BudgetItemService()
