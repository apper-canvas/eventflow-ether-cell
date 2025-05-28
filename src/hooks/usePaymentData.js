import { useState } from 'react'

export const usePaymentData = () => {
  const [payments, setPayments] = useState([
    {
      id: '1',
      eventId: '1',
      type: 'client',
      amount: 25000,
      description: 'Event deposit payment',
      status: 'paid',
      dueDate: new Date('2024-01-15'),
      paidDate: new Date('2024-01-10'),
      paymentMethod: 'bank_transfer',
      clientName: 'Corporate Events Inc.',
      invoiceNumber: 'INV-2024-001',
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      eventId: '1',
      type: 'client',
      amount: 25000,
      description: 'Final event payment',
      status: 'pending',
      dueDate: new Date('2024-02-01'),
      paidDate: null,
      paymentMethod: null,
      clientName: 'Corporate Events Inc.',
      invoiceNumber: 'INV-2024-002',
      createdAt: new Date('2024-01-15')
    }
  ])

  const [paymentSearch, setPaymentSearch] = useState('')
  const [paymentFilter, setPaymentFilter] = useState({
    type: '',
    status: '',
    eventId: ''
  })

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.description.toLowerCase().includes(paymentSearch.toLowerCase()) ||
                         (payment.clientName && payment.clientName.toLowerCase().includes(paymentSearch.toLowerCase())) ||
                         (payment.vendorName && payment.vendorName.toLowerCase().includes(paymentSearch.toLowerCase())) ||
                         (payment.invoiceNumber && payment.invoiceNumber.toLowerCase().includes(paymentSearch.toLowerCase()))
    
    const matchesType = !paymentFilter.type || payment.type === paymentFilter.type
    const matchesStatus = !paymentFilter.status || payment.status === paymentFilter.status
    const matchesEvent = !paymentFilter.eventId || payment.eventId === paymentFilter.eventId
    
    return matchesSearch && matchesType && matchesStatus && matchesEvent
  })

  const getTotalRevenue = () => {
    return payments
      .filter(payment => payment.type === 'client' && payment.status === 'paid')
      .reduce((sum, payment) => sum + payment.amount, 0)
  }

  const getOutstandingPayments = () => {
    return payments
      .filter(payment => payment.status === 'pending' || payment.status === 'overdue')
      .reduce((sum, payment) => sum + payment.amount, 0)
  }

  const getOverduePayments = () => {
    return payments.filter(payment => {
      return payment.status === 'pending' && new Date(payment.dueDate) < new Date()
    })
  }

  return {
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
  }
}
