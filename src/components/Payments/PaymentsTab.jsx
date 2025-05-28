import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import ApperIcon from '../ApperIcon'
import { usePaymentData } from '../../hooks/usePaymentData'
import { useEventData } from '../../hooks/useEventData'
import { paymentStatusColors, paymentTypeColors } from '../../constants/colors'

const PaymentsTab = () => {
  const { events } = useEventData()
  const {
    payments,
    setPayments,
    paymentSearch,
    setPaymentSearch,
    paymentFilter,
    setPaymentFilter,
    filteredPayments,
    getTotalRevenue,
    getOutstandingPayments,
    getOverduePayments
    processPaymentReceiving,
    receivePayment,

    receivePayment,

  } = usePaymentData()
  
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [newPayment, setNewPayment] = useState({
    eventId: '',
    type: 'client',
    amount: '',
    description: '',
    dueDate: '',
    clientName: '',
    vendorName: '',
    paymentMethod: ''
  })
  const [showReceivePayment, setShowReceivePayment] = useState(false)

  const [selectedPayment, setSelectedPayment] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [receivePaymentData, setReceivePaymentData] = useState({
    paymentMethod: 'credit_card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    amount: '',
    notes: ''
  })


  const handleCreatePayment = (e) => {
    e.preventDefault()
    if (!newPayment.eventId || !newPayment.amount || !newPayment.description || !newPayment.dueDate) {
      toast.error('Please fill in all required fields')
      return
    }

    const payment = {
      ...newPayment,
      id: Date.now().toString(),
      amount: parseFloat(newPayment.amount),
      status: 'pending',
      paidDate: null,
      paymentMethod: newPayment.paymentMethod || null,
      createdAt: new Date(),
      dueDate: new Date(newPayment.dueDate),
      invoiceNumber: newPayment.type === 'client' ? `INV-${new Date().getFullYear()}-${String(payments.length + 1).padStart(3, '0')}` : null
    }

    setPayments(prev => [...prev, payment])
    setNewPayment({
      eventId: '', type: 'client', amount: '', description: '', dueDate: '',
      clientName: '', vendorName: '', paymentMethod: ''
    })
    setShowPaymentForm(false)
    toast.success('Payment record created successfully!')
  }

  const updatePaymentStatus = (paymentId, status) => {
    setPayments(prev => prev.map(payment => {
      if (payment.id === paymentId) {
        return {
          ...payment,
          status,
          paidDate: status === 'paid' ? new Date() : null
        }
      }
      return payment
    }))
    toast.success(`Payment status updated to ${status}`)
  }

  const deletePayment = (paymentId) => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      setPayments(prev => prev.filter(payment => payment.id !== paymentId))
      toast.success('Payment record deleted successfully!')
    }
  const handleReceivePayment = (payment) => {
    setSelectedPayment(payment)
    setReceivePaymentData(prev => ({
      ...prev,
      amount: payment.amount.toString()
    }))
    setShowReceivePayment(true)
  }

  const processPaymentReceival = async (e) => {
    e.preventDefault()
    if (!selectedPayment) return

    setIsProcessing(true)
    try {
      const result = await receivePayment(
        selectedPayment.id,
        receivePaymentData.paymentMethod,
        {
          cardNumber: receivePaymentData.cardNumber.slice(-4),
          cardholderName: receivePaymentData.cardholderName,
          notes: receivePaymentData.notes
        }
      )

      toast.success(`Payment of $${selectedPayment.amount.toLocaleString()} received successfully!`)
      setShowReceivePayment(false)
      setSelectedPayment(null)
      setReceivePaymentData({
        paymentMethod: 'credit_card',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
        amount: '',
        notes: ''
      })
    } catch (error) {
      toast.error(error.message || 'Failed to process payment')
    } finally {
      setIsProcessing(false)
    }
  }


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h3 className="text-2xl sm:text-3xl font-bold text-surface-900">Payment Management</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowPaymentForm(true)}
          className="btn-primary inline-flex items-center space-x-2"
        >
          <ApperIcon name="Plus" className="w-5 h-5" />
          <span>Add Payment</span>
        </motion.button>
      </div>

      {/* Payment Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-neu"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">${getTotalRevenue().toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <ApperIcon name="TrendingUp" className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-neu"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600 mb-1">Outstanding</p>
              <p className="text-2xl font-bold text-yellow-600">${getOutstandingPayments().toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <ApperIcon name="Clock" className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-neu"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600 mb-1">Overdue Payments</p>
              <p className="text-2xl font-bold text-red-600">{getOverduePayments().length}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <ApperIcon name="AlertTriangle" className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="card-neu">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="relative">
              <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input
                type="text"
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                className="input-field pl-10"
                placeholder="Search payments..."
              />
            </div>
          </div>
          
          <select
            value={paymentFilter.type}
            onChange={(e) => setPaymentFilter(prev => ({ ...prev, type: e.target.value }))}
            className="input-field"
          >
            <option value="">All Types</option>
            <option value="client">Client Payments</option>
            <option value="vendor">Vendor Payments</option>
          </select>
          
          <select
            value={paymentFilter.status}
            onChange={(e) => setPaymentFilter(prev => ({ ...prev, status: e.target.value }))}
            className="input-field"
          >
            <option value="">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
            <option value="refunded">Refunded</option>
          </select>
          
          <select
            value={paymentFilter.eventId}
            onChange={(e) => setPaymentFilter(prev => ({ ...prev, eventId: e.target.value }))}
            className="input-field"
          >
            <option value="">All Events</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>{event.name}</option>
            ))}
          </select>
        </div>
        
        {(paymentSearch || Object.values(paymentFilter).some(Boolean)) && (
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-surface-600">
              Found {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => {
                setPaymentSearch('')
                setPaymentFilter({ type: '', status: '', eventId: '' })
              }}
              className="text-sm text-primary hover:text-primary-dark transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Payment Creation Form Modal */}
      <AnimatePresence>
        {showPaymentForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowPaymentForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-2xl font-bold text-surface-900">Add New Payment</h4>
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="p-2 hover:bg-surface-100 rounded-xl transition-colors"
                >
                  <ApperIcon name="X" className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleCreatePayment} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Event *
                    </label>
                    <select
                      value={newPayment.eventId}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, eventId: e.target.value }))}
                      className="input-field"
                      required
                    >
                      <option value="">Select Event</option>
                      {events.map(event => (
                        <option key={event.id} value={event.id}>{event.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Payment Type *
                    </label>
                    <select
                      value={newPayment.type}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, type: e.target.value }))}
                      className="input-field"
                      required
                    >
                      <option value="client">Client Payment</option>
                      <option value="vendor">Vendor Payment</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Amount ($) *
                    </label>
                    <input
                      type="number"
                      value={newPayment.amount}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                      className="input-field"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      value={newPayment.dueDate}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={newPayment.description}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, description: e.target.value }))}
                    className="input-field"
                    placeholder="Enter payment description"
                    rows="3"
                    required
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    Create Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>

      {/* Receive Payment Modal */}
      <AnimatePresence>
        {showReceivePayment && selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => !isProcessing && setShowReceivePayment(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-2xl font-bold text-surface-900">Receive Payment</h4>
                <button
                  onClick={() => !isProcessing && setShowReceivePayment(false)}
                  disabled={isProcessing}
                  className="p-2 hover:bg-surface-100 rounded-xl transition-colors disabled:opacity-50"
                >
                  <ApperIcon name="X" className="w-6 h-6" />
                </button>
              </div>

              {/* Payment Details */}
              <div className="payment-card mb-6">
                <h5 className="text-lg font-semibold text-surface-900 mb-4">Payment Details</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-surface-600">Description:</span>
                    <p className="font-medium">{selectedPayment.description}</p>
                  </div>
                  <div>
                    <span className="text-surface-600">Amount:</span>
                    <p className="font-bold text-xl text-green-600">${selectedPayment.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-surface-600">Client:</span>
                    <p className="font-medium">{selectedPayment.clientName || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-surface-600">Due Date:</span>
                    <p className="font-medium">{format(new Date(selectedPayment.dueDate), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={processPaymentReceival} className="space-y-6">
                {/* Payment Method Selection */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-4">
                    Payment Method *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { id: 'credit_card', name: 'Credit Card', icon: 'CreditCard' },
                      { id: 'bank_transfer', name: 'Bank Transfer', icon: 'Building' },
                      { id: 'paypal', name: 'PayPal', icon: 'Smartphone' },
                      { id: 'cash', name: 'Cash', icon: 'DollarSign' }
                    ].map(method => (
                      <div
                        key={method.id}
                        onClick={() => setReceivePaymentData(prev => ({ ...prev, paymentMethod: method.id }))}
                        className={`payment-method-btn ${
                          receivePaymentData.paymentMethod === method.id ? 'active' : ''
                        }`}
                      >
                        <ApperIcon name={method.icon} className="w-5 h-5" />
                        <span className="text-sm font-medium">{method.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Credit Card Details */}
                {receivePaymentData.paymentMethod === 'credit_card' && (
                  <div className="space-y-4">
                    <h6 className="text-lg font-semibold text-surface-900">Card Information</h6>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-surface-700 mb-2">
                          Cardholder Name *
                        </label>
                        <input
                          type="text"
                          value={receivePaymentData.cardholderName}
                          onChange={(e) => setReceivePaymentData(prev => ({ ...prev, cardholderName: e.target.value }))}
                          className="input-field"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-surface-700 mb-2">
                          Card Number *
                        </label>
                        <input
                          type="text"
                          value={receivePaymentData.cardNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ')
                            setReceivePaymentData(prev => ({ ...prev, cardNumber: value }))
                          }}
                          className="input-field"
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-2">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          value={receivePaymentData.expiryDate}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/, '$1/')
                            setReceivePaymentData(prev => ({ ...prev, expiryDate: value }))
                          }}
                          className="input-field"
                          placeholder="MM/YY"
                          maxLength="5"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-2">
                          CVV *
                        </label>
                        <input
                          type="text"
                          value={receivePaymentData.cvv}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '')
                            setReceivePaymentData(prev => ({ ...prev, cvv: value }))
                          }}
                          className="input-field"
                          placeholder="123"
                          maxLength="4"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Bank Transfer Details */}
                {receivePaymentData.paymentMethod === 'bank_transfer' && (
                  <div className="space-y-4">
                    <h6 className="text-lg font-semibold text-surface-900">Bank Transfer Information</h6>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <h7 className="font-semibold text-blue-900 mb-2 block">Bank Details</h7>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p><strong>Account Name:</strong> EventFlow Management Inc.</p>
                        <p><strong>Account Number:</strong> 1234567890</p>
                        <p><strong>Routing Number:</strong> 021000021</p>
                        <p><strong>Bank:</strong> First National Bank</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Amount Confirmation */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Amount to Receive ($) *
                  </label>
                  <input
                    type="number"
                    value={receivePaymentData.amount}
                    onChange={(e) => setReceivePaymentData(prev => ({ ...prev, amount: e.target.value }))}
                    className="input-field"
                    placeholder="0.00"
                    step="0.01"
                    required
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={receivePaymentData.notes}
                    onChange={(e) => setReceivePaymentData(prev => ({ ...prev, notes: e.target.value }))}
                    className="input-field"
                    placeholder="Additional notes about this payment..."
                    rows="3"
                  />
                </div>

                {/* Processing Fee Information */}
                {receivePaymentData.paymentMethod === 'credit_card' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <ApperIcon name="Info" className="w-5 h-5 text-yellow-600" />
                      <span className="font-semibold text-yellow-900">Processing Fee Information</span>
                    </div>
                    <div className="text-sm text-yellow-800 space-y-1">
                      <p>Processing Fee (2.9%): ${(parseFloat(receivePaymentData.amount || 0) * 0.029).toFixed(2)}</p>
                      <p className="font-semibold">Net Amount: ${(parseFloat(receivePaymentData.amount || 0) * 0.971).toFixed(2)}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="btn-primary flex-1 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="processing-spinner" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <ApperIcon name="Check" className="w-5 h-5" />
                        <span>Process Payment</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReceivePayment(false)}
                    disabled={isProcessing}
                    className="btn-secondary flex-1 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      </AnimatePresence>

      {/* Payments List */}
      <div className="card-neu">
        <h4 className="text-xl font-bold text-surface-900 mb-6">Payment Records</h4>
        <div className="space-y-4">
          {filteredPayments.map((payment, index) => {
            const event = events.find(e => e.id === payment.eventId)
            return (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-surface-50 rounded-xl p-4 hover:bg-surface-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h5 className="font-semibold text-surface-900">{payment.description}</h5>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${paymentStatusColors[payment.status]}`}>
                        {payment.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentTypeColors[payment.type]}`}>
                        {payment.type}
                      </span>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-surface-600">
                      <div className="flex items-center space-x-2">
                        <ApperIcon name="Calendar" className="w-4 h-4" />
                        <span>{event?.name || 'Unknown Event'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ApperIcon name="Clock" className="w-4 h-4" />
                        <span>Due: {format(new Date(payment.dueDate), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-xl font-bold text-surface-900">${payment.amount.toLocaleString()}</div>
                      {payment.invoiceNumber && (
                        <div className="text-sm text-surface-600">{payment.invoiceNumber}</div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {payment.status === 'pending' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleReceivePayment(payment)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <ApperIcon name="CreditCard" className="w-4 h-4 mr-1 inline" />
                          Receive Payment
                        </motion.button>
                      )}

                      {payment.status !== 'paid' && (
                        <select
                          value={payment.status}
                          onChange={(e) => updatePaymentStatus(payment.id, e.target.value)}
                          className="px-3 py-1 border border-surface-200 rounded text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="overdue">Overdue</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      )}
                      <button
                        onClick={() => deletePayment(payment.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <ApperIcon name="Trash2" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
          
          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <ApperIcon name="CreditCard" className="w-16 h-16 text-surface-300 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-surface-900 mb-2">No payments found</h4>
              <p className="text-surface-600 mb-6">
                {paymentSearch || Object.values(paymentFilter).some(Boolean)
                  ? 'Try adjusting your search criteria or filters'
                  : 'Get started by adding your first payment record'}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPaymentForm(true)}
                className="btn-primary"
              >
                <ApperIcon name="Plus" className="w-5 h-5 mr-2" />
                Add First Payment
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default PaymentsTab