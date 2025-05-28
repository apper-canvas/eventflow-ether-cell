import { toast } from 'react-toastify'

class TaskService {
  constructor() {
    const { ApperClient } = window.ApperSDK
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = 'task5'
    this.fields = [
      'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy',
      'title', 'status', 'priority', 'event'
    ]
    this.updateableFields = [
      'Name', 'Tags', 'Owner', 'title', 'status', 'priority', 'event'
    ]
  }

  async fetchTasks(eventId = null) {
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

      return response.data.map(task => ({
        id: task.Id,
        name: task.Name || '',
        title: task.title || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        eventId: task.event || '',
        tags: task.Tags || '',
        createdAt: task.CreatedOn ? new Date(task.CreatedOn) : new Date()
      }))
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error('Failed to load tasks')
      return []
    }
  }

  async getTaskById(taskId) {
    try {
      const params = {
        fields: this.fields
      }

      const response = await this.apperClient.getRecordById(this.tableName, taskId, params)
      
      if (!response || !response.data) {
        return null
      }

      const task = response.data
      return {
        id: task.Id,
        name: task.Name || '',
        title: task.title || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        eventId: task.event || '',
        tags: task.Tags || '',
        createdAt: task.CreatedOn ? new Date(task.CreatedOn) : new Date()
      }
    } catch (error) {
      console.error(`Error fetching task with ID ${taskId}:`, error)
      toast.error('Failed to load task details')
      return null
    }
  }

  async createTasks(taskData) {
    try {
      // Validate required fields
      if (!taskData.title || !taskData.eventId) {
        throw new Error('Task title and event are required')
      }

      // Format data for API
      const formattedData = {
        Name: taskData.name || taskData.title,
        title: taskData.title,
        status: taskData.status || 'pending',
        priority: taskData.priority || 'medium',
        event: taskData.eventId,
        Tags: taskData.tags || ''
      }

      const params = {
        records: [formattedData]
      }

      const response = await this.apperClient.createRecord(this.tableName, params)
      
      if (response && response.success && response.results) {
        const successfulRecords = response.results.filter(result => result.success)
        
        if (successfulRecords.length > 0) {
          toast.success('Task created successfully!')
          return successfulRecords.map(result => ({
            id: result.data.Id,
            name: result.data.Name,
            title: result.data.title,
            status: result.data.status,
            priority: result.data.priority,
            eventId: result.data.event,
            tags: result.data.Tags,
            createdAt: new Date(result.data.CreatedOn)
          }))
        }
      }
      
      throw new Error('Failed to create task')
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error(error.message || 'Failed to create task')
      throw error
    }
  }

  async updateTasks(taskData) {
    try {
      if (!taskData.id) {
        throw new Error('Task ID is required for update')
      }

      // Format data for API (only updateable fields)
      const formattedData = {
        Id: taskData.id,
        Name: taskData.name || taskData.title,
        title: taskData.title,
        status: taskData.status,
        priority: taskData.priority,
        event: taskData.eventId,
        Tags: taskData.tags || ''
      }

      const params = {
        records: [formattedData]
      }

      const response = await this.apperClient.updateRecord(this.tableName, params)
      
      if (response && response.success && response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        
        if (successfulUpdates.length > 0) {
          toast.success('Task updated successfully!')
          return successfulUpdates.map(result => ({
            id: result.data.Id,
            name: result.data.Name,
            title: result.data.title,
            status: result.data.status,
            priority: result.data.priority,
            eventId: result.data.event,
            tags: result.data.Tags
          }))
        }
      }
      
      throw new Error('Failed to update task')
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error(error.message || 'Failed to update task')
      throw error
    }
  }

  async deleteTasks(taskIds) {
    try {
      const params = {
        RecordIds: Array.isArray(taskIds) ? taskIds : [taskIds]
      }

      const response = await this.apperClient.deleteRecord(this.tableName, params)
      
      if (response && response.success && response.results) {
        const successfulDeletions = response.results.filter(result => result.success)
        
        if (successfulDeletions.length > 0) {
          toast.success(`${successfulDeletions.length} task(s) deleted successfully!`)
          return true
        }
      }
      
      throw new Error('Failed to delete task(s)')
    } catch (error) {
      console.error('Error deleting tasks:', error)
      toast.error(error.message || 'Failed to delete task(s)')
      throw error
    }
  }

  async updateTaskStatus(taskId, status) {
    try {
      const formattedData = {
        Id: taskId,
        status: status
      }

      const params = {
        records: [formattedData]
      }

      const response = await this.apperClient.updateRecord(this.tableName, params)
      
      if (response && response.success && response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        
        if (successfulUpdates.length > 0) {
          toast.success(`Task status updated to ${status}`)
          return true
        }
      }
      
      throw new Error('Failed to update task status')
    } catch (error) {
      console.error('Error updating task status:', error)
      toast.error('Failed to update task status')
      throw error
    }
  }

  async updateTaskPriority(taskId, priority) {
    try {
      const formattedData = {
        Id: taskId,
        priority: priority
      }

      const params = {
        records: [formattedData]
      }

      const response = await this.apperClient.updateRecord(this.tableName, params)
      
      if (response && response.success && response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        
        if (successfulUpdates.length > 0) {
          toast.success(`Task priority updated to ${priority}`)
          return true
        }
      }
      
      throw new Error('Failed to update task priority')
    } catch (error) {
      console.error('Error updating task priority:', error)
      toast.error('Failed to update task priority')
      throw error
    }
  }

  async getTasksByStatus(eventId, status) {
    try {
      const whereConditions = [
        {
          fieldName: 'status',
          operator: 'ExactMatch',
          values: [status]
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

      return response.data.map(task => ({
        id: task.Id,
        name: task.Name || '',
        title: task.title || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        eventId: task.event || ''
      }))
    } catch (error) {
      console.error('Error fetching tasks by status:', error)
      return []
    }
  }

  async getTasksByPriority(eventId, priority) {
    try {
      const whereConditions = [
        {
          fieldName: 'priority',
          operator: 'ExactMatch',
          values: [priority]
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

      return response.data.map(task => ({
        id: task.Id,
        name: task.Name || '',
        title: task.title || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        eventId: task.event || ''
      }))
    } catch (error) {
      console.error('Error fetching tasks by priority:', error)
      return []
    }
  }

  async getTaskAnalytics(eventId = null) {
    try {
      const tasks = await this.fetchTasks(eventId)
      
      const analytics = {
        total: tasks.length,
        completed: tasks.filter(task => task.status === 'completed').length,
        inProgress: tasks.filter(task => task.status === 'in-progress').length,
        pending: tasks.filter(task => task.status === 'pending').length,
        highPriority: tasks.filter(task => task.priority === 'high').length,
        mediumPriority: tasks.filter(task => task.priority === 'medium').length,
        lowPriority: tasks.filter(task => task.priority === 'low').length
      }
      
      analytics.completionRate = analytics.total > 0 ? (analytics.completed / analytics.total) * 100 : 0
      
      return analytics
    } catch (error) {
      console.error('Error calculating task analytics:', error)
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        highPriority: 0,
        mediumPriority: 0,
        lowPriority: 0,
        completionRate: 0
      }
    }
  }
}

export default new TaskService()
