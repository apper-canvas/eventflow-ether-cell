import { toast } from 'react-toastify'

class PaymentService {
  constructor() {
    const { ApperClient } = window.ApperSDK
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = 'payment2'
    this.fields = [
      'Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy',
      'type', 'amount', 'description', 'status', 'due_date', 'paid_date', 'payment_method',
      'client_name', 'vendor_name', 'invoice_number', 'transaction_id', 'processing_fee',
      'net_amount', 'confirmation_number', 'event'
    ]
    this.updateableFields = [
      'Name', 'Tags', 'Owner', 'type', 'amount', 'description', 'status', 'due_date',
      'paid_date', 'payment_method', 'client_name', 'vendor_name', 'invoice_number',
      'transaction_id', 'processing_fee', 'net_amount', 'confirmation_number', 'event'
    ]
  }

  async fetchPayments(eventId = null) {
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

      return response.data.map(payment => ({
        id: payment.Id,
        name: payment.Name || '',
        eventId: payment.event || '',
        type: payment.type || 'client',
        amount: parseFloat(payment.amount) || 0,
        description: payment.description || '',
        status: payment.status || 'pending',
        dueDate: payment.due_date ? new Date(payment.due_date) : new Date(),
        paidDate: payment.paid_date ? new Date(payment.paid_date) : null,
        paymentMethod: payment.payment_method || null,
        clientName: payment.client_name || '',
        vendorName: payment.vendor_name || '',
        invoiceNumber: payment.invoice_number || '',
        transactionId: payment.transaction_id || '',
        processingFee: parseFloat(payment.processing_fee) || 0,
        netAmount: parseFloat(payment.net_amount) || 0,
        confirmationNumber: payment.confirmation_number || '',
        tags: payment.Tags || '',
        createdAt: payment.CreatedOn ? new Date(payment.CreatedOn) : new Date()
      }))
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast.error('Failed to load payments')
      return []
    }
  }

  async getPaymentById(paymentId) {
    try {
      const params = {
        fields: this.fields
      }

      const response = await this.apperClient.getRecordById(this.tableName, paymentId, params)
      
      if (!response || !response.data) {
        return null
      }

      const payment = response.data
      return {
        id: payment.Id,
        name: payment.Name || '',
        eventId: payment.event || '',
        type: payment.type || 'client',
        amount: parseFloat(payment.amount) || 0,
        description: payment.description || '',
        status: payment.status || 'pending',
        dueDate: payment.due_date ? new Date(payment.due_date) : new Date(),
        paidDate: payment.paid_date ? new Date(payment.paid_date) : null,
        paymentMethod: payment.payment_method || null,
        clientName: payment.client_name || '',
        vendorName: payment.vendor_name || '',
        invoiceNumber: payment.invoice_number || '',
        transactionId: payment.transaction_id || '',
        processingFee: parseFloat(payment.processing_fee) || 0,
        netAmount: parseFloat(payment.net_amount) || 0,
        confirmationNumber: payment.confirmation_number || '',
        tags: payment.Tags || '',
        createdAt: payment.CreatedOn ? new Date(payment.CreatedOn) : new Date()
      }
    } catch (error) {
      console.error(`Error fetching payment with ID ${paymentId}:`, error)
      toast.error('Failed to load payment details')
      return null
    }
  }

  async createPayments(paymentData) {
    try {
      // Validate required fields
      if (!paymentData.eventId || !paymentData.amount || !paymentData.description || !paymentData.dueDate) {
        throw new Error('Event, amount, description, and due date are required')
      }

      // Generate invoice number for client payments
      const invoiceNumber = paymentData.type === 'client' 
        ? `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
        : ''

      // Format data for API
      const formattedData = {
        Name: paymentData.name || paymentData.description,
        event: paymentData.eventId,
        type: paymentData.type || 'client',
        amount: parseFloat(paymentData.amount),
        description: paymentData.description,
        status: 'pending',
        due_date: new Date(paymentData.dueDate).toISOString().split('T')[0],
        payment_method: paymentData.paymentMethod || '',
        client_name: paymentData.clientName || '',
        vendor_name: paymentData.vendorName || '',
        invoice_number: invoiceNumber,
        Tags: paymentData.tags || ''
      }

      const params = {
        records: [formattedData]
      }

      const response = await this.apperClient.createRecord(this.tableName, params)
      
      if (response && response.success && response.results) {
        const successfulRecords = response.results.filter(result => result.success)
        
        if (successfulRecords.length > 0) {
          toast.success('Payment record created successfully!')
          return successfulRecords.map(result => ({
            id: result.data.Id,
            name: result.data.Name,
            eventId: result.data.event,
            type: result.data.type,
            amount: parseFloat(result.data.amount),
            description: result.data.description,
            status: result.data.status,
            dueDate: new Date(result.data.due_date),
            paidDate: result.data.paid_date ? new Date(result.data.paid_date) : null,
            paymentMethod: result.data.payment_method,
            clientName: result.data.client_name,
            vendorName: result.data.vendor_name,
            invoiceNumber: result.data.invoice_number,
            tags: result.data.Tags,
            createdAt: new Date(result.data.CreatedOn)
          }))
        }
      }
      
      throw new Error('Failed to create payment record')
    } catch (error) {
      console.error('Error creating payment:', error)
      toast.error(error.message || 'Failed to create payment record')
      throw error
    }
  }

  async updatePayments(paymentData) {
    try {
      if (!paymentData.id) {
        throw new Error('Payment ID is required for update')
      }

      // Format data for API (only updateable fields)
      const formattedData = {
        Id: paymentData.id,
        Name: paymentData.name || paymentData.description,
        event: paymentData.eventId,
        type: paymentData.type,
        amount: parseFloat(paymentData.amount),
        description: paymentData.description,
        status: paymentData.status,
        due_date: new Date(paymentData.dueDate).toISOString().split('T')[0],
        paid_date: paymentData.paidDate ? new Date(paymentData.paidDate).toISOString() : null,
        payment_method: paymentData.paymentMethod || '',
        client_name: paymentData.clientName || '',
        vendor_name: paymentData.vendorName || '',
        invoice_number: paymentData.invoiceNumber || '',
        transaction_id: paymentData.transactionId || '',
        processing_fee: parseFloat(paymentData.processingFee) || 0,
        net_amount: parseFloat(paymentData.netAmount) || 0,
        confirmation_number: paymentData.confirmationNumber || '',
        Tags: paymentData.tags || ''
      }

      const params = {
        records: [formattedData]
      }

      const response = await this.apperClient.updateRecord(this.tableName, params)
      
      if (response && response.success && response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        
        if (successfulUpdates.length > 0) {
          toast.success('Payment updated successfully!')
          return successfulUpdates.map(result => ({
            id: result.data.Id,
            name: result.data.Name,
            eventId: result.data.event,
            type: result.data.type,
            amount: parseFloat(result.data.amount),
            description: result.data.description,
            status: result.data.status,
            dueDate: new Date(result.data.due_date),
            paidDate: result.data.paid_date ? new Date(result.data.paid_date) : null,
            paymentMethod: result.data.payment_method,
            clientName: result.data.client_name,
            vendorName: result.data.vendor_name,
            invoiceNumber: result.data.invoice_number,
            transactionId: result.data.transaction_id,
            processingFee: parseFloat(result.data.processing_fee) || 0,
            netAmount: parseFloat(result.data.net_amount) || 0,
            confirmationNumber: result.data.confirmation_number,
            tags: result.data.Tags
          }))
        }
      }
      
      throw new Error('Failed to update payment')
    } catch (error) {
      console.error('Error updating payment:', error)
      toast.error(error.message || 'Failed to update payment')
      throw error
    }
  }

  async deletePayments(paymentIds) {
    try {
      const params = {
        RecordIds: Array.isArray(paymentIds) ? paymentIds : [paymentIds]
      }

      const response = await this.apperClient.deleteRecord(this.tableName, params)
      
      if (response && response.success && response.results) {
        const successfulDeletions = response.results.filter(result => result.success)
        
        if (successfulDeletions.length > 0) {
          toast.success(`${successfulDeletions.length} payment(s) deleted successfully!`)
          return true
        }
      }
      
      throw new Error('Failed to delete payment(s)')
    } catch (error) {
      console.error('Error deleting payments:', error)
      toast.error(error.message || 'Failed to delete payment(s)')
      throw error
    }
  }

  async updatePaymentStatus(paymentId, status) {
    try {
      const formattedData = {
        Id: paymentId,
        status: status,
        paid_date: status === 'paid' ? new Date().toISOString() : null
      }

      const params = {
        records: [formattedData]
      }

      const response = await this.apperClient.updateRecord(this.tableName, params)
      
      if (response && response.success && response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        
        if (successfulUpdates.length > 0) {
          toast.success(`Payment status updated to ${status}`)
          return true
        }
      }
      
      throw new Error('Failed to update payment status')
    } catch (error) {
      console.error('Error updating payment status:', error)
      toast.error('Failed to update payment status')
      throw error
    }
  }

  async processPaymentReceiving(paymentId, paymentMethod, receiptData) {
    try {
      // Simulate payment processing
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.1) { // 90% success rate
            const payment = {
              id: paymentId,
              transactionId: `TXN-${Date.now()}`,
              processingFee: receiptData.amount * 0.029, // 2.9% processing fee
              netAmount: receiptData.amount * 0.971
            }

            // Update payment record
            this.updatePayments({
              id: paymentId,
              status: 'paid',
              paidDate: new Date(),
              paymentMethod: paymentMethod,
              transactionId: payment.transactionId,
              processingFee: payment.processingFee,
              netAmount: payment.netAmount
            })

            resolve({
              success: true,
              transactionId: payment.transactionId,
              processingFee: payment.processingFee,
              netAmount: payment.netAmount
            })
          } else {
            reject(new Error('Payment processing failed. Please try again.'))
          }
        }, 2000) // 2 second processing time
      })
    } catch (error) {
      console.error('Error processing payment receiving:', error)
      throw error
    }
  }

  async processVendorPayment(paymentId, paymentMethod, paymentData) {
    try {
      // Simulate vendor payment processing
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.05) { // 95% success rate
            const result = {
              transactionId: `VTX-${Date.now()}`,
              confirmationNumber: `CNF-${Date.now()}`
            }

            // Update payment record
            this.updatePayments({
              id: paymentId,
              status: 'paid',
              paidDate: new Date(),
              paymentMethod: paymentMethod,
              transactionId: result.transactionId,
              confirmationNumber: result.confirmationNumber
            })

            resolve({
              success: true,
              transactionId: result.transactionId,
              confirmationNumber: result.confirmationNumber
            })
          } else {
            reject(new Error('Vendor payment processing failed. Please try again.'))
          }
        }, 1500) // 1.5 second processing time
      })
    } catch (error) {
      console.error('Error processing vendor payment:', error)
      throw error
    }
  }

  async getPaymentAnalytics(eventId = null) {
    try {
      const payments = await this.fetchPayments(eventId)
      
      const revenue = payments
        .filter(payment => payment.type === 'client' && payment.status === 'paid')
        .reduce((sum, payment) => sum + payment.amount, 0)
      
      const expenses = payments
        .filter(payment => payment.type === 'vendor' && payment.status === 'paid')
        .reduce((sum, payment) => sum + payment.amount, 0)
      
      const outstanding = payments
        .filter(payment => payment.status === 'pending' || payment.status === 'overdue')
        .reduce((sum, payment) => sum + payment.amount, 0)
      
      const overduePayments = payments.filter(payment => {
        return payment.status === 'pending' && new Date(payment.dueDate) < new Date()
      })
      
      return {
        totalRevenue: revenue,
        totalExpenses: expenses,
        outstandingPayments: outstanding,
        overdueCount: overduePayments.length,
        netProfit: revenue - expenses,
        paymentCount: payments.length
      }
    } catch (error) {
      console.error('Error calculating payment analytics:', error)
      return {
        totalRevenue: 0,
        totalExpenses: 0,
        outstandingPayments: 0,
        overdueCount: 0,
        netProfit: 0,
        paymentCount: 0
      }
    }
  }
}

export default new PaymentService()
