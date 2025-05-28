import React, { useState, useEffect, useMemo } from 'react'
import { format, isAfter, isBefore, startOfDay, endOfDay, parseISO } from 'date-fns'
import { toast } from 'react-toastify'
import ApperIcon from '../ApperIcon'
import { paymentStatusColors, paymentTypeColors } from '../../constants/colors'
import paymentService from '../../services/paymentService'

const PaymentsTab = ({ selectedEventId }) => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showProcessingModal, setShowProcessingModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    outstandingPayments: 0,
    overdueCount: 0,
    netProfit: 0,
    paymentCount: 0
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingData, setProcessingData] = useState({
    method: '',
    amount: 0,
    details: {}
  })
  const [formData, setFormData] = useState({
    name: '',
    eventId: selectedEventId || '',
    type: 'client',
    amount: '',
    description: '',
    status: 'pending',
    dueDate: '',
    paymentMethod: '',
    clientName: '',
    vendorName: '',
    tags: ''
  })

  // Load payments when component mounts or eventId changes
  useEffect(() => {
    loadPayments()
    loadAnalytics()
  }, [selectedEventId])

  // Update analytics when payments change
  useEffect(() => {
    loadAnalytics()
  }, [payments])

  const loadPayments = async () => {
    setLoading(true)
    try {
      const paymentData = await paymentService.fetchPayments(selectedEventId)
      setPayments(paymentData)
    } catch (error) {
      console.error('Error loading payments:', error)
      toast.error('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  const loadAnalytics = async () => {
    try {
      const analyticsData = await paymentService.getPaymentAnalytics(selectedEventId)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }

  const handleCreatePayment = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await paymentService.createPayments({
        ...formData,
        eventId: selectedEventId || formData.eventId
      })
      await loadPayments()
      setShowCreateForm(false)
      resetForm()
      toast.success('Payment created successfully!')
    } catch (error) {
      console.error('Error creating payment:', error)
      toast.error('Failed to create payment')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePayment = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await paymentService.updatePayments({
        ...formData,
        id: selectedPayment.id
      })
      await loadPayments()
      setShowEditForm(false)
      setSelectedPayment(null)
      resetForm()
      toast.success('Payment updated successfully!')
    } catch (error) {
      console.error('Error updating payment:', error)
      toast.error('Failed to update payment')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) return
    
    setLoading(true)
    try {
      await paymentService.deletePayments(paymentId)
      await loadPayments()
      toast.success('Payment deleted successfully!')
    } catch (error) {
      console.error('Error deleting payment:', error)
      toast.error('Failed to delete payment')
    } finally {
      setLoading(false)
    }
  }

  const handleProcessPayment = async () => {
    setIsProcessing(true)
    try {
      if (selectedPayment.type === 'client') {
        const result = await paymentService.processPaymentReceiving(
          selectedPayment.id,
          processingData.method,
          { amount: selectedPayment.amount }
        )
        toast.success(`Payment received! Transaction ID: ${result.transactionId}`)
      } else {
        const result = await paymentService.processVendorPayment(
          selectedPayment.id,
          processingData.method,
          processingData.details
        )
        toast.success(`Payment sent! Confirmation: ${result.confirmationNumber}`)
      }
      await loadPayments()
      setShowProcessingModal(false)
      setSelectedPayment(null)
      setProcessingData({ method: '', amount: 0, details: {} })
    } catch (error) {
      console.error('Error processing payment:', error)
      toast.error(error.message || 'Payment processing failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      eventId: selectedEventId || '',
      type: 'client',
      amount: '',
      description: '',
      status: 'pending',
      dueDate: '',
      paymentMethod: '',
      clientName: '',
      vendorName: '',
      tags: ''
    })
  }

  const openEditForm = (payment) => {
    setSelectedPayment(payment)
    setFormData({
      name: payment.name,
      eventId: payment.eventId,
      type: payment.type,
      amount: payment.amount.toString(),
      description: payment.description,
      status: payment.status,
      dueDate: format(payment.dueDate, 'yyyy-MM-dd'),
      paymentMethod: payment.paymentMethod || '',
      clientName: payment.clientName,
      vendorName: payment.vendorName,
      tags: payment.tags
    })
    setShowEditForm(true)
  }

  const openProcessingModal = (payment) => {
    setSelectedPayment(payment)
    setProcessingData({
      method: '',
      amount: payment.amount,
      details: {}
    })
    setShowProcessingModal(true)
  }

  const exportPayments = () => {
    const csvContent = [
      ['Name', 'Type', 'Amount', 'Status', 'Due Date', 'Description', 'Client/Vendor', 'Invoice Number'].join(','),
      ...filteredPayments.map(payment => [
        payment.name,
        payment.type,
        payment.amount,
        payment.status,
        format(payment.dueDate, 'yyyy-MM-dd'),
        payment.description,
        payment.type === 'client' ? payment.clientName : payment.vendorName,
        payment.invoiceNumber || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payments-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Payment report exported successfully!')
  }

  // Filter payments based on current filters
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchesType = filterType === 'all' || payment.type === filterType
      const matchesStatus = filterStatus === 'all' || payment.status === filterStatus
      const matchesSearch = !searchQuery || 
        payment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.vendorName.toLowerCase().includes(searchQuery.toLowerCase())
      
      let matchesDate = true
      if (dateRange.start && dateRange.end) {
        const paymentDate = startOfDay(payment.dueDate)
        const startDate = startOfDay(parseISO(dateRange.start))
        const endDate = endOfDay(parseISO(dateRange.end))
        matchesDate = !isBefore(paymentDate, startDate) && !isAfter(paymentDate, endDate)
      }

      return matchesType && matchesStatus && matchesSearch && matchesDate
    })
  }, [payments, filterType, filterStatus, searchQuery, dateRange])

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="processing-spinner" />
        <span className="ml-3 text-surface-600">Loading payments...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="payment-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">${analytics.totalRevenue.toFixed(2)}</p>
            </div>
            <ApperIcon name="TrendingUp" className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="payment-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">${analytics.totalExpenses.toFixed(2)}</p>
            </div>
            <ApperIcon name="TrendingDown" className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <div className="payment-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-600">Outstanding</p>
              <p className="text-2xl font-bold text-yellow-600">${analytics.outstandingPayments.toFixed(2)}</p>
              {analytics.overdueCount > 0 && (
                <p className="text-xs text-red-500">{analytics.overdueCount} overdue</p>
              )}
            </div>
            <ApperIcon name="Clock" className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="payment-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-surface-600">Net Profit</p>
              <p className={`text-2xl font-bold ${
                analytics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${analytics.netProfit.toFixed(2)}
              </p>
            </div>
            <ApperIcon name="DollarSign" className="w-8 h-8 text-primary" />
          </div>
        </div>
      </div>

      {/* Actions and Filters */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              <ApperIcon name="Plus" className="w-5 h-5 mr-2" />
              Add Payment
            </button>
            <button
              onClick={exportPayments}
              className="btn-secondary"
            >
              <ApperIcon name="FileText" className="w-5 h-5 mr-2" />
              Export Report
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-surface-200 rounded-lg focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field"
          >
            <option value="all">All Types</option>
            <option value="client">Client Payments</option>
            <option value="vendor">Vendor Payments</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="refunded">Refunded</option>
          </select>
          
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="input-field"
            placeholder="Start Date"
          />
          
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="input-field"
            placeholder="End Date"
          />
        </div>

        {/* Payments List */}
        <div className="space-y-4">
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <ApperIcon name="CreditCard" className="w-16 h-16 text-surface-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-surface-600 mb-2">No payments found</h3>
              <p className="text-surface-400">Get started by adding your first payment.</p>
            </div>
          ) : (
            filteredPayments.map((payment) => (
              <div key={payment.id} className="payment-card">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-surface-800">{payment.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        paymentTypeColors[payment.type]
                      }`}>
                        {payment.type.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        paymentStatusColors[payment.status]
                      }`}>
                        {payment.status.toUpperCase()}
                      </span>
                      {payment.status === 'pending' && new Date(payment.dueDate) < new Date() && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                          OVERDUE
                        </span>
                      )}
                    </div>
                    <p className="text-surface-600 mb-2">{payment.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-surface-500">
                      <span className="flex items-center gap-1">
                        <ApperIcon name="DollarSign" className="w-4 h-4" />
                        ${payment.amount.toFixed(2)}
                      </span>
                      <span className="flex items-center gap-1">
                        <ApperIcon name="Calendar" className="w-4 h-4" />
                        Due: {format(payment.dueDate, 'MMM dd, yyyy')}
                      </span>
                      {payment.type === 'client' ? (
                        <span className="flex items-center gap-1">
                          <ApperIcon name="Users" className="w-4 h-4" />
                          {payment.clientName}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <ApperIcon name="Building2" className="w-4 h-4" />
                          {payment.vendorName}
                        </span>
                      )}
                      {payment.invoiceNumber && (
                        <span className="flex items-center gap-1">
                          <ApperIcon name="FileText" className="w-4 h-4" />
                          {payment.invoiceNumber}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {payment.status === 'pending' && (
                      <button
                        onClick={() => openProcessingModal(payment)}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <ApperIcon name="CreditCard" className="w-4 h-4 mr-1" />
                        Process
                      </button>
                    )}
                    <button
                      onClick={() => openEditForm(payment)}
                      className="p-2 text-surface-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <ApperIcon name="Edit" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePayment(payment.id)}
                      className="p-2 text-surface-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <ApperIcon name="Trash2" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Payment Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-surface-800">Create New Payment</h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false)
                    resetForm()
                  }}
                  className="p-2 text-surface-400 hover:text-surface-600 hover:bg-surface-100 rounded-lg transition-colors"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreatePayment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">Payment Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="input-field"
                      required
                    >
                      <option value="client">Client Payment (Incoming)</option>
                      <option value="vendor">Vendor Payment (Outgoing)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      className="input-field"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="input-field"
                    rows={3}
                    placeholder="Payment description..."
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">Due Date</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="input-field"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      {formData.type === 'client' ? 'Client Name' : 'Vendor Name'}
                    </label>
                    <input
                      type="text"
                      value={formData.type === 'client' ? formData.clientName : formData.vendorName}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        [formData.type === 'client' ? 'clientName' : 'vendorName']: e.target.value
                      }))}
                      className="input-field"
                      placeholder={formData.type === 'client' ? 'Client name' : 'Vendor name'}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">Tags (optional)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    className="input-field"
                    placeholder="Tag1,Tag2,Tag3"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      resetForm()
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'Creating...' : 'Create Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Payment Modal */}
      {showEditForm && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-surface-800">Edit Payment</h2>
                <button
                  onClick={() => {
                    setShowEditForm(false)
                    setSelectedPayment(null)
                    resetForm()
                  }}
                  className="p-2 text-surface-400 hover:text-surface-600 hover:bg-surface-100 rounded-lg transition-colors"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleUpdatePayment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">Payment Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="input-field"
                      required
                    >
                      <option value="client">Client Payment (Incoming)</option>
                      <option value="vendor">Vendor Payment (Outgoing)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      className="input-field"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="input-field"
                    rows={3}
                    placeholder="Payment description..."
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="input-field"
                      required
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">Due Date</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    {formData.type === 'client' ? 'Client Name' : 'Vendor Name'}
                  </label>
                  <input
                    type="text"
                    value={formData.type === 'client' ? formData.clientName : formData.vendorName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      [formData.type === 'client' ? 'clientName' : 'vendorName']: e.target.value
                    }))}
                    className="input-field"
                    placeholder={formData.type === 'client' ? 'Client name' : 'Vendor name'}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">Tags (optional)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    className="input-field"
                    placeholder="Tag1,Tag2,Tag3"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false)
                      setSelectedPayment(null)
                      resetForm()
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'Updating...' : 'Update Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payment Processing Modal */}
      {showProcessingModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-surface-800">
                  {selectedPayment.type === 'client' ? 'Receive Payment' : 'Send Payment'}
                </h2>
                <button
                  onClick={() => {
                    setShowProcessingModal(false)
                    setSelectedPayment(null)
                    setProcessingData({ method: '', amount: 0, details: {} })
                  }}
                  className="p-2 text-surface-400 hover:text-surface-600 hover:bg-surface-100 rounded-lg transition-colors"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="receipt-container">
                  <h3 className="font-medium text-surface-800 mb-2">Payment Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-surface-600">Amount:</span>
                      <span className="font-medium">${selectedPayment.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-surface-600">Type:</span>
                      <span className="font-medium capitalize">{selectedPayment.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-surface-600">
                        {selectedPayment.type === 'client' ? 'From:' : 'To:'}
                      </span>
                      <span className="font-medium">
                        {selectedPayment.type === 'client' ? selectedPayment.clientName : selectedPayment.vendorName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-surface-600">Description:</span>
                      <span className="font-medium text-right">{selectedPayment.description}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">Payment Method</label>
                  <div className="space-y-2">
                    {['credit_card', 'bank_transfer', 'cash', 'check', 'online_payment', 'paypal'].map((method) => (
                      <div
                        key={method}
                        className={`payment-method-btn ${
                          processingData.method === method ? 'active' : ''
                        }`}
                        onClick={() => setProcessingData(prev => ({ ...prev, method }))}
                      >
                        <ApperIcon name="CreditCard" className="w-5 h-5" />
                        <span className="capitalize">{method.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowProcessingModal(false)
                      setSelectedPayment(null)
                      setProcessingData({ method: '', amount: 0, details: {} })
                    }}
                    className="btn-secondary"
                    disabled={isProcessing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProcessPayment}
                    disabled={!processingData.method || isProcessing}
                    className="btn-primary"
                  >
                    {isProcessing ? (
                      <>
                        <div className="processing-spinner mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ApperIcon name="Send" className="w-4 h-4 mr-2" />
                        {selectedPayment.type === 'client' ? 'Receive Payment' : 'Send Payment'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentsTab