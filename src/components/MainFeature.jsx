import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, addDays, startOfWeek, startOfMonth, endOfMonth, addMonths, subMonths, isSameDay, isSameMonth, eachDayOfInterval } from 'date-fns'
import { toast } from 'react-toastify'
import ApperIcon from './ApperIcon'


const MainFeature = () => {
  const [activeTab, setActiveTab] = useState('events')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEventForm, setShowEventForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  // Mock data
  const [events, setEvents] = useState([
    {
      id: '1',
      name: 'Product Launch 2024',
      description: 'Annual product launch event showcasing our latest innovations',
      date: addDays(new Date(), 3),
      venue: 'Convention Center Hall A',
      status: 'planning',
      budget: 50000,
      guestCount: 250,
      createdAt: new Date(),
      tasks: [
        { id: '1', title: 'Book venue', status: 'completed', priority: 'high' },
        { id: '2', title: 'Send invitations', status: 'in-progress', priority: 'high' },
        { id: '3', title: 'Arrange catering', status: 'pending', priority: 'medium' },
      ]
    },
    {
      id: '2',
      name: 'Team Building Retreat',
      description: 'Quarterly team building activities and workshops',
      date: addDays(new Date(), 14),
      venue: 'Mountain Resort',
      status: 'confirmed',
      budget: 25000,
      guestCount: 85,
      createdAt: new Date(),
      tasks: [
        { id: '4', title: 'Book accommodation', status: 'completed', priority: 'high' },
        { id: '5', title: 'Plan activities', status: 'in-progress', priority: 'medium' },
      ]
    },
    {
      id: '3',
      name: 'Client Conference',
      description: 'Annual client appreciation and networking event',
      date: addDays(new Date(), 21),
      venue: 'Grand Hotel Ballroom',
      status: 'planning',
      budget: 75000,
      guestCount: 400,
      createdAt: new Date(),
      tasks: [
        { id: '6', title: 'Confirm speakers', status: 'pending', priority: 'high' },
        { id: '7', title: 'Design materials', status: 'pending', priority: 'medium' },
      ]
    }
  ])

  const [guests, setGuests] = useState([
    { id: '1', eventId: '1', name: 'John Smith', email: 'john@company.com', rsvpStatus: 'confirmed' },
    { id: '2', eventId: '1', name: 'Sarah Johnson', email: 'sarah@company.com', rsvpStatus: 'pending' },
    { id: '3', eventId: '1', name: 'Mike Chen', email: 'mike@company.com', rsvpStatus: 'declined' },
  ])

  const [budgetItems, setBudgetItems] = useState([
    { id: '1', eventId: '1', category: 'Venue', allocatedAmount: 20000, spentAmount: 18000 },
    { id: '2', eventId: '1', category: 'Catering', allocatedAmount: 15000, spentAmount: 12000 },
    { id: '3', eventId: '1', category: 'Marketing', allocatedAmount: 8000, spentAmount: 5500 },
    { id: '4', eventId: '1', category: 'Entertainment', allocatedAmount: 7000, spentAmount: 0 },
  ])

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
    },
    {
      id: '3',
      eventId: '2',
      type: 'vendor',
      amount: 8000,
      description: 'Catering services payment',
      status: 'paid',
      dueDate: new Date('2024-01-20'),
      paidDate: new Date('2024-01-18'),
      paymentMethod: 'credit_card',
      vendorName: 'Elite Catering Co.',
      vendorId: '1',
      createdAt: new Date('2024-01-10')
    },
    {
      id: '4',
      eventId: '1',
      type: 'vendor',
      amount: 5000,
      description: 'Photography services',
      status: 'pending',
      dueDate: new Date('2024-01-25'),
      paidDate: null,
      paymentMethod: null,
      vendorName: 'Capture Moments',
      vendorId: '4',
      createdAt: new Date('2024-01-12')
    },
    {
      id: '5',
      eventId: '3',
      type: 'client',
      amount: 15000,
      description: 'Conference booking payment',
      status: 'overdue',
      dueDate: new Date('2024-01-05'),
      paidDate: null,
      paymentMethod: null,
      clientName: 'Tech Solutions Ltd.',
      invoiceNumber: 'INV-2024-003',
      createdAt: new Date('2023-12-20')
    }
  ])

  const [paymentSearch, setPaymentSearch] = useState('')
  const [paymentFilter, setPaymentFilter] = useState({
    type: '',
    status: '',
    eventId: ''
  })
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showPaymentDetails, setShowPaymentDetails] = useState(false)
  const [newPayment, setNewPayment] = useState({
    eventId: '',
    type: 'client',
    amount: '',
    description: '',
    dueDate: '',
    clientName: '',
    vendorName: '',
    vendorId: '',
    invoiceNumber: '',
    paymentMethod: ''
  })



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
    },
    {
      id: '3',
      name: 'Emma Thompson',
      company: 'Bloom & Blossom',
      email: 'emma@bloomblossom.com',
      phone: '+1 (555) 456-7890',
      specialty: 'Floral Design',
      location: 'Chicago, IL',
      rating: 4.9,
      reviewCount: 45,
      description: 'Award-winning floral designs and decorations that transform venues into magical spaces.',
      website: 'www.bloomblossom.com',
      priceRange: '$$',
      availability: 'available',
      portfolioImages: [
        'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=400',
        'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400'
      ]
    },
    {
      id: '4',
      name: 'Michael Chen',
      company: 'Capture Moments',
      email: 'michael@capturemoments.com',
      phone: '+1 (555) 321-0987',
      specialty: 'Photography',
      location: 'San Francisco, CA',
      rating: 4.7,
      reviewCount: 38,
      description: 'Professional event photography capturing your special moments with artistic flair.',
      website: 'www.capturemoments.com',
      priceRange: '$$$',
      availability: 'available',
      portfolioImages: [
        'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400',
        'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400'
      ]
    },
    {
      id: '5',
      name: 'Lisa Johnson',
      company: 'Event Security Plus',
      email: 'lisa@eventsecurityplus.com',
      phone: '+1 (555) 654-3210',
      specialty: 'Security',
      location: 'Miami, FL',
      rating: 4.5,
      reviewCount: 22,
      description: 'Comprehensive security services ensuring safe and secure events for all attendees.',
      website: 'www.eventsecurityplus.com',
      priceRange: '$$',
      availability: 'busy',
      portfolioImages: [
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
        'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400'
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
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [showVendorForm, setShowVendorForm] = useState(false)
  const [showVendorDetails, setShowVendorDetails] = useState(false)
  const [newVendor, setNewVendor] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    specialty: '',
    location: '',
    description: '',
    website: '',
    priceRange: '$$'
  })


  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    date: '',
    venue: '',
    budget: '',
    guestCount: ''
  })

  const [newGuest, setNewGuest] = useState({
    name: '',
    email: '',
    eventId: ''
  })

  const tabs = [
    { id: 'events', label: 'Events', icon: 'Calendar' },
    { id: 'guests', label: 'Guests', icon: 'Users' },
    { id: 'budget', label: 'Budget', icon: 'DollarSign' },
    { id: 'vendors', label: 'Vendors', icon: 'Building2' },
    { id: 'payments', label: 'Payments', icon: 'CreditCard' },
    { id: 'calendar', label: 'Calendar', icon: 'CalendarDays' }
  ]



  const statusColors = {
    planning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200'
  }

  const rsvpColors = {
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    declined: 'bg-red-100 text-red-800'
  }

  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  }

  const taskStatusColors = {
    completed: 'bg-green-100 text-green-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    pending: 'bg-gray-100 text-gray-800'
  }

  const availabilityColors = {
    available: 'bg-green-100 text-green-800 border-green-200',
    busy: 'bg-red-100 text-red-800 border-red-200',
    'partially-available': 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }

  const priceRangeColors = {
    '$': 'bg-blue-100 text-blue-800',
    '$$': 'bg-purple-100 text-purple-800',
    '$$$': 'bg-pink-100 text-pink-800'
  }

  const paymentStatusColors = {
    paid: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    overdue: 'bg-red-100 text-red-800 border-red-200',
    refunded: 'bg-blue-100 text-blue-800 border-blue-200'
  }

  const paymentTypeColors = {
    client: 'bg-blue-100 text-blue-800',
    vendor: 'bg-purple-100 text-purple-800'
  }

  const paymentMethodOptions = [
    'bank_transfer', 'credit_card', 'cash', 'check', 'online_payment'
  ]


  const specialtyOptions = [
    'Catering', 'Audio/Visual', 'Floral Design', 'Photography', 'Security',
    'Transportation', 'Entertainment', 'Venue', 'Decoration', 'Planning'
  ]


  // Calendar generation - Full month view
  const calendarDays = useMemo(() => {
    const start = startOfMonth(selectedDate)
    const end = endOfMonth(selectedDate)
    const startDate = startOfWeek(start)
    const endDate = addDays(startOfWeek(addDays(end, 6)), 6)
    
    return eachDayOfInterval({
      start: startDate,
      end: endDate
    })
  }, [selectedDate])

  const getEventsForDate = (date) => {
    return events.filter(event => isSameDay(new Date(event.date), date))
  }

  const handleDateClick = (date) => {
    const dateString = format(date, "yyyy-MM-dd'T'HH:mm")
    setNewEvent(prev => ({ ...prev, date: dateString }))
    setShowEventForm(true)
  }

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      setSelectedDate(subMonths(selectedDate, 1))
    } else {
      setSelectedDate(addMonths(selectedDate, 1))
    }
  }


  const handleCreateEvent = (e) => {
    e.preventDefault()
    if (!newEvent.name || !newEvent.date || !newEvent.venue) {
      toast.error('Please fill in all required fields')
      return
    }

    const event = {
      ...newEvent,
      id: Date.now().toString(),
      status: 'planning',
      createdAt: new Date(),
      date: new Date(newEvent.date),
      budget: parseFloat(newEvent.budget) || 0,
      guestCount: parseInt(newEvent.guestCount) || 0,
      tasks: []
    }

    setEvents(prev => [...prev, event])
    setNewEvent({ name: '', description: '', date: '', venue: '', budget: '', guestCount: '' })
    setShowEventForm(false)
    toast.success('Event created successfully!')
  }

  const handleAddGuest = (e) => {
    e.preventDefault()
    if (!newGuest.name || !newGuest.email || !newGuest.eventId) {
      toast.error('Please fill in all required fields')
      return
    }

    const guest = {
      ...newGuest,
      id: Date.now().toString(),
      rsvpStatus: 'pending'
    }

    setGuests(prev => [...prev, guest])
    setNewGuest({ name: '', email: '', eventId: '' })
    toast.success('Guest added successfully!')
  }

  const updateEventStatus = (eventId, status) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, status } : event
    ))
    toast.success(`Event status updated to ${status}`)
  }

  const updateGuestRSVP = (guestId, status) => {
    setGuests(prev => prev.map(guest => 
      guest.id === guestId ? { ...guest, rsvpStatus: status } : guest
    ))
    toast.success('RSVP status updated')
  }

  const getTotalBudgetSpent = (eventId) => {
    return budgetItems
      .filter(item => item.eventId === eventId)
      .reduce((sum, item) => sum + item.spentAmount, 0)
  }

  const getTotalBudgetAllocated = (eventId) => {
    return budgetItems
      .filter(item => item.eventId === eventId)
      .reduce((sum, item) => sum + item.allocatedAmount, 0)
  }



  // Vendor-related functions
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

  const handleCreateVendor = (e) => {
    e.preventDefault()
    if (!newVendor.name || !newVendor.company || !newVendor.email || !newVendor.specialty) {
      toast.error('Please fill in all required fields')
      return
    }

    const vendor = {
      ...newVendor,
      id: Date.now().toString(),
      rating: 0,
      reviewCount: 0,
      availability: 'available',
      portfolioImages: []
    }

    setVendors(prev => [...prev, vendor])
    setNewVendor({
      name: '', company: '', email: '', phone: '', specialty: '',
      location: '', description: '', website: '', priceRange: '$$'
    })
    setShowVendorForm(false)
    toast.success('Vendor added successfully!')
  }

  const updateVendorRating = (vendorId, newRating) => {
    setVendors(prev => prev.map(vendor => {
      if (vendor.id === vendorId) {
        const totalRating = (vendor.rating * vendor.reviewCount) + newRating
        const newReviewCount = vendor.reviewCount + 1
        return {
          ...vendor,
          rating: totalRating / newReviewCount,
          reviewCount: newReviewCount
        }
      }
      return vendor
    }))
    toast.success('Rating updated successfully!')
  }

  const toggleVendorAvailability = (vendorId) => {
    setVendors(prev => prev.map(vendor => {
      if (vendor.id === vendorId) {
        const newAvailability = vendor.availability === 'available' ? 'busy' : 'available'
        return { ...vendor, availability: newAvailability }
      }
      return vendor
    }))
    toast.success('Vendor availability updated!')
  }

  const deleteVendor = (vendorId) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      setVendors(prev => prev.filter(vendor => vendor.id !== vendorId))
      toast.success('Vendor deleted successfully!')
    }
  }

  // Payment-related functions
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
      clientName: '', vendorName: '', vendorId: '', invoiceNumber: '', paymentMethod: ''
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
  }

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


  const StarRating = ({ rating, onRatingChange, readonly = false, size = 'w-5 h-5' }) => {
    const [hoverRating, setHoverRating] = useState(0)
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            whileHover={!readonly ? { scale: 1.1 } : {}}
            whileTap={!readonly ? { scale: 0.9 } : {}}
            onClick={() => !readonly && onRatingChange && onRatingChange(star)}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-colors`}
            disabled={readonly}
          >
            <ApperIcon
              name="Star"
              className={`${size} transition-colors ${
                star <= (hoverRating || rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </motion.button>
        ))}
        {readonly && (
          <span className="ml-2 text-sm text-surface-600">
            {rating.toFixed(1)} ({vendors.find(v => v.rating === rating)?.reviewCount || 0} reviews)
          </span>
        )}
      </div>
    )
  }


  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 sm:gap-4 p-2 bg-surface-100 rounded-2xl">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-white shadow-card text-primary'
                : 'text-surface-600 hover:text-surface-900 hover:bg-white/50'
            }`}
          >
            <ApperIcon name={tab.icon} className="w-5 h-5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </motion.button>
        ))}

      {/* Event Creation Form Modal - Available from all tabs */}
      <AnimatePresence>
        {showEventForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowEventForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-2xl font-bold text-surface-900">Create New Event</h4>
                <button
                  onClick={() => setShowEventForm(false)}
                  className="p-2 hover:bg-surface-100 rounded-xl transition-colors"
                >
                  <ApperIcon name="X" className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleCreateEvent} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Event Name *
                    </label>
                    <input
                      type="text"
                      value={newEvent.name}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
                      className="input-field"
                      placeholder="Enter event name"
                      required
                    />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                      className="input-field"
                      placeholder="Event description"
                      rows="3"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="datetime-local"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                      className="input-field"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Venue *
                    </label>
                    <input
                      type="text"
                      value={newEvent.venue}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, venue: e.target.value }))}
                      className="input-field"
                      placeholder="Event venue"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Budget ($)
                    </label>
                    <input
                      type="number"
                      value={newEvent.budget}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, budget: e.target.value }))}
                      className="input-field"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Expected Guests
                    </label>
                    <input
                      type="number"
                      value={newEvent.guestCount}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, guestCount: e.target.value }))}
                      className="input-field"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    Create Event
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEventForm(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      </div>

      <AnimatePresence mode="wait">
        {/* Events Tab */}
        {activeTab === 'events' && (
          <motion.div
            key="events"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h3 className="text-2xl sm:text-3xl font-bold text-surface-900">Your Events</h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowEventForm(true)}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <ApperIcon name="Plus" className="w-5 h-5" />
                <span>Create Event</span>
              </motion.button>
            </div>


            {/* Events Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card-neu group hover:shadow-glow cursor-pointer"
                  onClick={() => setSelectedEvent(selectedEvent === event.id ? null : event.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg sm:text-xl font-bold text-surface-900 mb-2 group-hover:text-primary transition-colors">
                        {event.name}
                      </h4>
                      <p className="text-surface-600 text-sm sm:text-base mb-3 line-clamp-2">
                        {event.description}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[event.status]}`}>
                      {event.status}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-surface-600">
                      <ApperIcon name="Calendar" className="w-4 h-4" />
                      <span>{format(new Date(event.date), 'MMM dd, yyyy • HH:mm')}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-surface-600">
                      <ApperIcon name="MapPin" className="w-4 h-4" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-surface-600">
                      <ApperIcon name="Users" className="w-4 h-4" />
                      <span>{event.guestCount} guests</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={event.status}
                      onChange={(e) => {
                        e.stopPropagation()
                        updateEventStatus(event.id, e.target.value)
                      }}
                      className="flex-1 px-3 py-2 border border-surface-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="planning">Planning</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveTab('guests')
                      }}
                      className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
                    >
                      Manage
                    </motion.button>
                  </div>

                  {/* Event Details Expansion */}
                  <AnimatePresence>
                    {selectedEvent === event.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 pt-6 border-t border-surface-200"
                      >
                        <h5 className="font-semibold text-surface-900 mb-3">Tasks</h5>
                        <div className="space-y-2">
                          {event.tasks.map((task) => (
                            <div key={task.id} className="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
                              <span className="text-sm text-surface-700">{task.title}</span>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${priorityColors[task.priority]}`}>
                                  {task.priority}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs ${taskStatusColors[task.status]}`}>
                                  {task.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Guests Tab */}
        {activeTab === 'guests' && (
          <motion.div
            key="guests"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h3 className="text-2xl sm:text-3xl font-bold text-surface-900">Guest Management</h3>
            </div>

            {/* Add Guest Form */}
            <div className="card-neu">
              <h4 className="text-lg sm:text-xl font-bold text-surface-900 mb-4">Add New Guest</h4>
              <form onSubmit={handleAddGuest} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <input
                  type="text"
                  value={newGuest.name}
                  onChange={(e) => setNewGuest(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="Guest name"
                  required
                />
                <input
                  type="email"
                  value={newGuest.email}
                  onChange={(e) => setNewGuest(prev => ({ ...prev, email: e.target.value }))}
                  className="input-field"
                  placeholder="Email address"
                  required
                />
                <select
                  value={newGuest.eventId}
                  onChange={(e) => setNewGuest(prev => ({ ...prev, eventId: e.target.value }))}
                  className="input-field"
                  required
                >
                  <option value="">Select Event</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>{event.name}</option>
                  ))}
                </select>
                <button type="submit" className="btn-primary">
                  Add Guest
                </button>
              </form>
            </div>

            {/* Guests List */}
            <div className="card-neu">
              <h4 className="text-lg sm:text-xl font-bold text-surface-900 mb-4">Guest List</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-200">
                      <th className="text-left py-3 px-4 font-semibold text-surface-900">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-surface-900 hidden sm:table-cell">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-surface-900">Event</th>
                      <th className="text-left py-3 px-4 font-semibold text-surface-900">RSVP</th>
                      <th className="text-left py-3 px-4 font-semibold text-surface-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guests.map((guest) => {
                      const event = events.find(e => e.id === guest.eventId)
                      return (
                        <tr key={guest.id} className="border-b border-surface-100 hover:bg-surface-50">
                          <td className="py-3 px-4 text-surface-900">{guest.name}</td>
                          <td className="py-3 px-4 text-surface-600 hidden sm:table-cell">{guest.email}</td>
                          <td className="py-3 px-4 text-surface-600">{event?.name || 'Unknown'}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${rsvpColors[guest.rsvpStatus]}`}>
                              {guest.rsvpStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={guest.rsvpStatus}
                              onChange={(e) => updateGuestRSVP(guest.id, e.target.value)}
                              className="px-2 py-1 border border-surface-200 rounded text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="declined">Declined</option>
                            </select>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <motion.div
            key="budget"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-surface-900">Budget Tracking</h3>

            {events.map((event) => {
              const totalAllocated = getTotalBudgetAllocated(event.id)
              const totalSpent = getTotalBudgetSpent(event.id)
              const eventBudgetItems = budgetItems.filter(item => item.eventId === event.id)

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card-neu"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
                    <h4 className="text-xl font-bold text-surface-900">{event.name}</h4>
                    <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                      <div className="text-sm text-surface-600">
                        Spent: <span className="font-semibold text-surface-900">${totalSpent.toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-surface-600">
                        Budget: <span className="font-semibold text-surface-900">${event.budget.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Budget Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-surface-700">Budget Utilization</span>
                      <span className="text-sm font-medium text-surface-900">
                        {((totalSpent / event.budget) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-surface-200 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((totalSpent / event.budget) * 100, 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-3 rounded-full ${
                          (totalSpent / event.budget) > 0.9 ? 'bg-red-500' :
                          (totalSpent / event.budget) > 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Budget Categories */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {eventBudgetItems.map((item) => (
                      <div key={item.id} className="bg-surface-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-semibold text-surface-900">{item.category}</h5>
                          <ApperIcon name="DollarSign" className="w-5 h-5 text-surface-400" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-surface-600">Allocated:</span>
                            <span className="font-medium">${item.allocatedAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-surface-600">Spent:</span>
                            <span className="font-medium">${item.spentAmount.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-surface-200 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((item.spentAmount / item.allocatedAmount) * 100, 100)}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-2 rounded-full ${
                                (item.spentAmount / item.allocatedAmount) > 1 ? 'bg-red-500' :
                                (item.spentAmount / item.allocatedAmount) > 0.8 ? 'bg-yellow-500' : 'bg-primary'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h3 className="text-2xl sm:text-3xl font-bold text-surface-900">Event Calendar</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-surface-100 rounded-xl transition-colors"
                >
                  <ApperIcon name="ChevronLeft" className="w-5 h-5" />
                </button>
                <span className="font-semibold text-surface-900 min-w-[140px] text-center">
                  {format(selectedDate, 'MMMM yyyy')}
                </span>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-surface-100 rounded-xl transition-colors"
                >
                  <ApperIcon name="ChevronRight" className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedDate(new Date())}
                  className="px-3 py-2 bg-primary/10 text-primary rounded-xl text-sm font-medium hover:bg-primary/20 transition-colors"
                >
                  Today
                </button>
              </div>
            </div>


            <div className="card-neu">
              {/* Calendar Header */}
              <div className="grid grid-cols-7 gap-4 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center font-semibold text-surface-700 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                  const dayEvents = getEventsForDate(day)
                  const isToday = isSameDay(day, new Date())
                  const isCurrentMonth = isSameMonth(day, selectedDate)
                  
                  return (
                    <motion.div
                      key={day.toISOString()}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDateClick(day)}
                      className={`min-h-20 sm:min-h-24 p-2 rounded-lg border transition-all duration-300 cursor-pointer relative ${
                        isToday
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : dayEvents.length > 0
                          ? 'border-primary/30 bg-primary/5 hover:border-primary/50'
                          : isCurrentMonth
                          ? 'border-surface-200 hover:border-primary/30 hover:bg-surface-50'
                          : 'border-surface-100 bg-surface-25 text-surface-400'
                      }`}
                    >
                      <div className={`text-sm font-semibold mb-1 ${
                        isToday 
                          ? 'text-primary' 
                          : isCurrentMonth 
                          ? 'text-surface-900' 
                          : 'text-surface-400'
                      }`}>
                        {format(day, 'd')}
                      </div>
                      
                      {/* Event indicators */}
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded truncate ${
                              event.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800'
                                : event.status === 'planning'
                                ? 'bg-yellow-100 text-yellow-800'
                                : event.status === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                            title={`${event.name} - ${format(new Date(event.date), 'HH:mm')}`}
                          >
                            {event.name}
                          </div>
                        ))}
                        
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-surface-600 text-center font-medium">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                        
                        {dayEvents.length === 0 && isCurrentMonth && (
                          <div className="text-xs text-surface-400 text-center pt-2">
                            Click to add
                          </div>
                        )}
                      </div>
                      
                      {/* Event count badge */}
                      {dayEvents.length > 0 && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">
                          {dayEvents.length}
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>

            </div>

            {/* Calendar Legend and Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="card-neu">
                <h4 className="text-lg font-bold text-surface-900 mb-4">Calendar Legend</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                    <span className="text-sm text-surface-700">Confirmed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
                    <span className="text-sm text-surface-700">Planning</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
                    <span className="text-sm text-surface-700">Completed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                    <span className="text-sm text-surface-700">Cancelled</span>
                  </div>
                </div>
              </div>
              
              <div className="card-neu">
                <h4 className="text-lg font-bold text-surface-900 mb-4">This Month</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {events.filter(event => 
                        isSameMonth(new Date(event.date), selectedDate)
                      ).length}
                    </div>
                    <div className="text-sm text-surface-600">Total Events</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {events.filter(event => 
                        isSameMonth(new Date(event.date), selectedDate) && 
                        event.status === 'confirmed'
                      ).length}
                    </div>
                    <div className="text-sm text-surface-600">Confirmed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="card-neu">
              <h4 className="text-xl font-bold text-surface-900 mb-4">Upcoming Events</h4>
              <div className="space-y-3">
                {events
                  .filter(event => new Date(event.date) > new Date())
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .slice(0, 5)
                  .map((event) => (
                    <motion.div 
                      key={event.id} 
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-4 bg-surface-50 rounded-xl hover:bg-surface-100 transition-colors cursor-pointer"
                      onClick={() => setActiveTab('events')}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center">
                          <ApperIcon name="Calendar" className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-surface-900">{event.name}</h5>
                          <p className="text-sm text-surface-600">
                            {format(new Date(event.date), 'MMM dd, yyyy • HH:mm')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[event.status]}`}>
                          {event.status}
                        </span>
                        <ApperIcon name="ChevronRight" className="w-4 h-4 text-surface-400" />
                      </div>
                    </motion.div>
                  ))}
                
                {events.filter(event => new Date(event.date) > new Date()).length === 0 && (
                  <div className="text-center py-8">
                    <ApperIcon name="Calendar" className="w-12 h-12 text-surface-300 mx-auto mb-3" />
                    <p className="text-surface-600">No upcoming events</p>
                    <button
                      onClick={() => {
                        setShowEventForm(true)
                      }}
                      className="mt-4 text-primary hover:text-primary-dark transition-colors text-sm font-medium"
                    >
                      Create your first event
                    </button>
                  </div>
                )}
              </div>
            </div>

          </motion.div>
        )}




        {/* Vendors Tab */}
        {activeTab === 'vendors' && (
          <motion.div
            key="vendors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h3 className="text-2xl sm:text-3xl font-bold text-surface-900">Vendor Directory</h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowVendorForm(true)}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <ApperIcon name="Plus" className="w-5 h-5" />
                <span>Add Vendor</span>
              </motion.button>
            </div>

            {/* Search and Filters */}
            <div className="card-neu">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-surface-400" />
                    <input
                      type="text"
                      value={vendorSearch}
                      onChange={(e) => setVendorSearch(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Search vendors by name, company, or specialty..."
                    />
                  </div>
                </div>
                
                <select
                  value={vendorFilter.specialty}
                  onChange={(e) => setVendorFilter(prev => ({ ...prev, specialty: e.target.value }))}
                  className="input-field"
                >
                  <option value="">All Specialties</option>
                  {specialtyOptions.map(specialty => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
                
                <select
                  value={vendorFilter.rating}
                  onChange={(e) => setVendorFilter(prev => ({ ...prev, rating: e.target.value }))}
                  className="input-field"
                >
                  <option value="">All Ratings</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                  <option value="3.0">3.0+ Stars</option>
                </select>
                
                <select
                  value={vendorFilter.availability}
                  onChange={(e) => setVendorFilter(prev => ({ ...prev, availability: e.target.value }))}
                  className="input-field"
                >
                  <option value="">All Availability</option>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="partially-available">Partially Available</option>
                </select>
              </div>
              
              {(vendorSearch || Object.values(vendorFilter).some(Boolean)) && (
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-surface-600">
                    Found {filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => {
                      setVendorSearch('')
                      setVendorFilter({ specialty: '', rating: '', availability: '', priceRange: '' })
                    }}
                    className="text-sm text-primary hover:text-primary-dark transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>

            {/* Vendor Creation Form Modal */}
            <AnimatePresence>
              {showVendorForm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                  onClick={() => setShowVendorForm(false)}
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-2xl font-bold text-surface-900">Add New Vendor</h4>
                      <button
                        onClick={() => setShowVendorForm(false)}
                        className="p-2 hover:bg-surface-100 rounded-xl transition-colors"
                      >
                        <ApperIcon name="X" className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <form onSubmit={handleCreateVendor} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-surface-700 mb-2">
                            Contact Name *
                          </label>
                          <input
                            type="text"
                            value={newVendor.name}
                            onChange={(e) => setNewVendor(prev => ({ ...prev, name: e.target.value }))}
                            className="input-field"
                            placeholder="Enter contact name"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-surface-700 mb-2">
                            Company Name *
                          </label>
                          <input
                            type="text"
                            value={newVendor.company}
                            onChange={(e) => setNewVendor(prev => ({ ...prev, company: e.target.value }))}
                            className="input-field"
                            placeholder="Enter company name"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-surface-700 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={newVendor.email}
                            onChange={(e) => setNewVendor(prev => ({ ...prev, email: e.target.value }))}
                            className="input-field"
                            placeholder="Enter email address"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-surface-700 mb-2">
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={newVendor.phone}
                            onChange={(e) => setNewVendor(prev => ({ ...prev, phone: e.target.value }))}
                            className="input-field"
                            placeholder="Enter phone number"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-surface-700 mb-2">
                            Specialty *
                          </label>
                          <select
                            value={newVendor.specialty}
                            onChange={(e) => setNewVendor(prev => ({ ...prev, specialty: e.target.value }))}
                            className="input-field"
                            required
                          >
                            <option value="">Select Specialty</option>
                            {specialtyOptions.map(specialty => (
                              <option key={specialty} value={specialty}>{specialty}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-surface-700 mb-2">
                            Location
                          </label>
                          <input
                            type="text"
                            value={newVendor.location}
                            onChange={(e) => setNewVendor(prev => ({ ...prev, location: e.target.value }))}
                            className="input-field"
                            placeholder="Enter location"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-surface-700 mb-2">
                            Website
                          </label>
                          <input
                            type="url"
                            value={newVendor.website}
                            onChange={(e) => setNewVendor(prev => ({ ...prev, website: e.target.value }))}
                            className="input-field"
                            placeholder="Enter website URL"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-surface-700 mb-2">
                            Price Range
                          </label>
                          <select
                            value={newVendor.priceRange}
                            onChange={(e) => setNewVendor(prev => ({ ...prev, priceRange: e.target.value }))}
                            className="input-field"
                          >
                            <option value="$">$ - Budget Friendly</option>
                            <option value="$$">$$ - Moderate</option>
                            <option value="$$$">$$$ - Premium</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={newVendor.description}
                          onChange={(e) => setNewVendor(prev => ({ ...prev, description: e.target.value }))}
                          className="input-field"
                          placeholder="Enter vendor description"
                          rows="3"
                        />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                          type="submit"
                          className="btn-primary flex-1"
                        >
                          Add Vendor
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowVendorForm(false)}
                          className="btn-secondary flex-1"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Vendor Details Modal */}
            <AnimatePresence>
              {showVendorDetails && selectedVendor && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                  onClick={() => setShowVendorDetails(false)}
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="text-2xl font-bold text-surface-900 mb-2">{selectedVendor.company}</h4>
                        <p className="text-lg text-surface-600">{selectedVendor.name}</p>
                      </div>
                      <button
                        onClick={() => setShowVendorDetails(false)}
                        className="p-2 hover:bg-surface-100 rounded-xl transition-colors"
                      >
                        <ApperIcon name="X" className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <h5 className="font-semibold text-surface-900 mb-3">Contact Information</h5>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <ApperIcon name="Mail" className="w-5 h-5 text-surface-400" />
                              <a href={`mailto:${selectedVendor.email}`} className="text-primary hover:underline">
                                {selectedVendor.email}
                              </a>
                            </div>
                            {selectedVendor.phone && (
                              <div className="flex items-center space-x-3">
                                <ApperIcon name="Phone" className="w-5 h-5 text-surface-400" />
                                <a href={`tel:${selectedVendor.phone}`} className="text-primary hover:underline">
                                  {selectedVendor.phone}
                                </a>
                              </div>
                            )}
                            {selectedVendor.website && (
                              <div className="flex items-center space-x-3">
                                <ApperIcon name="Globe" className="w-5 h-5 text-surface-400" />
                                <a href={selectedVendor.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                  {selectedVendor.website}
                                </a>
                              </div>
                            )}
                            {selectedVendor.location && (
                              <div className="flex items-center space-x-3">
                                <ApperIcon name="MapPin" className="w-5 h-5 text-surface-400" />
                                <span className="text-surface-600">{selectedVendor.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold text-surface-900 mb-3">Rating & Reviews</h5>
                          <div className="space-y-3">
                            <StarRating rating={selectedVendor.rating} readonly={true} />
                            <div className="space-y-2">
                              <h6 className="font-medium text-surface-700">Rate this vendor:</h6>
                              <StarRating
                                rating={0}
                                onRatingChange={(rating) => updateVendorRating(selectedVendor.id, rating)}
                              />
                            </div>
                          </div>
                        </div>
                        
                        {selectedVendor.description && (
                          <div>
                            <h5 className="font-semibold text-surface-900 mb-3">Description</h5>
                            <p className="text-surface-600 leading-relaxed">{selectedVendor.description}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <h5 className="font-semibold text-surface-900 mb-3">Service Details</h5>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-surface-50 rounded-xl p-4">
                              <div className="text-sm text-surface-600 mb-1">Specialty</div>
                              <div className="font-medium text-surface-900">{selectedVendor.specialty}</div>
                            </div>
                            <div className="bg-surface-50 rounded-xl p-4">
                              <div className="text-sm text-surface-600 mb-1">Price Range</div>
                              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${priceRangeColors[selectedVendor.priceRange]}`}>
                                {selectedVendor.priceRange}
                              </span>
                            </div>
                            <div className="bg-surface-50 rounded-xl p-4 col-span-2">
                              <div className="text-sm text-surface-600 mb-1">Availability</div>
                              <div className="flex items-center justify-between">
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${availabilityColors[selectedVendor.availability]}`}>
                                  {selectedVendor.availability.replace('-', ' ')}
                                </span>
                                <button
                                  onClick={() => toggleVendorAvailability(selectedVendor.id)}
                                  className="text-sm text-primary hover:text-primary-dark transition-colors"
                                >
                                  Toggle Status
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {selectedVendor.portfolioImages && selectedVendor.portfolioImages.length > 0 && (
                          <div>
                            <h5 className="font-semibold text-surface-900 mb-3">Portfolio</h5>
                            <div className="grid grid-cols-2 gap-3">
                              {selectedVendor.portfolioImages.map((image, index) => (
                                <div key={index} className="aspect-square rounded-xl overflow-hidden">
                                  <img
                                    src={image}
                                    alt={`Portfolio ${index + 1}`}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex gap-3">
                          <button
                            onClick={() => window.open(`mailto:${selectedVendor.email}`, '_blank')}
                            className="btn-primary flex-1"
                          >
                            <ApperIcon name="Mail" className="w-4 h-4 mr-2" />
                            Contact
                          </button>
                          <button
                            onClick={() => deleteVendor(selectedVendor.id)}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                          >
                            <ApperIcon name="Trash2" className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Vendor Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredVendors.map((vendor, index) => (
                <motion.div
                  key={vendor.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card-neu group hover:shadow-glow cursor-pointer"
                  onClick={() => {
                    setSelectedVendor(vendor)
                    setShowVendorDetails(true)
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-surface-900 mb-1 group-hover:text-primary transition-colors">
                        {vendor.company}
                      </h4>
                      <p className="text-surface-600 text-sm mb-2">{vendor.name}</p>
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {vendor.specialty}
                      </span>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${availabilityColors[vendor.availability]}`}>
                        {vendor.availability === 'available' ? 'Available' : vendor.availability === 'busy' ? 'Busy' : 'Partial'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priceRangeColors[vendor.priceRange]}`}>
                        {vendor.priceRange}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-surface-600">
                      <ApperIcon name="Mail" className="w-4 h-4" />
                      <span className="truncate">{vendor.email}</span>
                    </div>
                    {vendor.phone && (
                      <div className="flex items-center space-x-2 text-sm text-surface-600">
                        <ApperIcon name="Phone" className="w-4 h-4" />
                        <span>{vendor.phone}</span>
                      </div>
                    )}
                    {vendor.location && (
                      <div className="flex items-center space-x-2 text-sm text-surface-600">
                        <ApperIcon name="MapPin" className="w-4 h-4" />
                        <span>{vendor.location}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <StarRating rating={vendor.rating} readonly={true} size="w-4 h-4" />
                  </div>
                  
                  {vendor.description && (
                    <p className="text-sm text-surface-600 mb-4 line-clamp-2">
                      {vendor.description}
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(`mailto:${vendor.email}`, '_blank')
                      }}
                      className="flex-1 px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
                    >
                      <ApperIcon name="Mail" className="w-4 h-4 mr-1 inline" />
                      Contact
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedVendor(vendor)
                        setShowVendorDetails(true)
                      }}
                      className="px-3 py-2 bg-surface-100 text-surface-700 rounded-lg text-sm font-medium hover:bg-surface-200 transition-colors"
                    >
                      <ApperIcon name="Eye" className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {filteredVendors.length === 0 && (
              <div className="text-center py-12">
                <ApperIcon name="Building2" className="w-16 h-16 text-surface-300 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-surface-900 mb-2">No vendors found</h4>
                <p className="text-surface-600 mb-6">
                  {vendorSearch || Object.values(vendorFilter).some(Boolean)
                    ? 'Try adjusting your search criteria or filters'
                    : 'Get started by adding your first vendor to the directory'}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowVendorForm(true)}
                  className="btn-primary"
                >
                  <ApperIcon name="Plus" className="w-5 h-5 mr-2" />
                  Add First Vendor
                </motion.button>
              </div>
            )}
          </motion.div>
        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <motion.div
            key="payments"
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
                        
                        {newPayment.type === 'client' && (
                          <div>
                            <label className="block text-sm font-medium text-surface-700 mb-2">
                              Client Name
                            </label>
                            <input
                              type="text"
                              value={newPayment.clientName}
                              onChange={(e) => setNewPayment(prev => ({ ...prev, clientName: e.target.value }))}
                              className="input-field"
                              placeholder="Enter client name"
                            />
                          </div>
                        )}
                        
                        {newPayment.type === 'vendor' && (
                          <div>
                            <label className="block text-sm font-medium text-surface-700 mb-2">
                              Vendor
                            </label>
                            <select
                              value={newPayment.vendorId}
                              onChange={(e) => {
                                const selectedVendor = vendors.find(v => v.id === e.target.value)
                                setNewPayment(prev => ({
                                  ...prev,
                                  vendorId: e.target.value,
                                  vendorName: selectedVendor ? selectedVendor.company : ''
                                }))
                              }}
                              className="input-field"
                            >
                              <option value="">Select Vendor</option>
                              {vendors.map(vendor => (
                                <option key={vendor.id} value={vendor.id}>{vendor.company}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        
                        <div>
                          <label className="block text-sm font-medium text-surface-700 mb-2">
                            Payment Method
                          </label>
                          <select
                            value={newPayment.paymentMethod}
                            onChange={(e) => setNewPayment(prev => ({ ...prev, paymentMethod: e.target.value }))}
                            className="input-field"
                          >
                            <option value="">Select Method</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="credit_card">Credit Card</option>
                            <option value="cash">Cash</option>
                            <option value="check">Check</option>
                            <option value="online_payment">Online Payment</option>
                          </select>
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
              )}
            </AnimatePresence>

            {/* Payment Details Modal */}
            <AnimatePresence>
              {showPaymentDetails && selectedPayment && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                  onClick={() => setShowPaymentDetails(false)}
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="text-2xl font-bold text-surface-900 mb-2">Payment Details</h4>
                        <p className="text-lg text-surface-600">{selectedPayment.description}</p>
                      </div>
                      <button
                        onClick={() => setShowPaymentDetails(false)}
                        className="p-2 hover:bg-surface-100 rounded-xl transition-colors"
                      >
                        <ApperIcon name="X" className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-surface-50 rounded-xl p-4">
                          <div className="text-sm text-surface-600 mb-1">Amount</div>
                          <div className="text-2xl font-bold text-surface-900">${selectedPayment.amount.toLocaleString()}</div>
                        </div>
                        <div className="bg-surface-50 rounded-xl p-4">
                          <div className="text-sm text-surface-600 mb-1">Status</div>
                          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${paymentStatusColors[selectedPayment.status]}`}>
                            {selectedPayment.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="bg-surface-50 rounded-xl p-4">
                          <div className="text-sm text-surface-600 mb-1">Type</div>
                          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${paymentTypeColors[selectedPayment.type]}`}>
                            {selectedPayment.type.toUpperCase()}
                          </span>
                        </div>
                        <div className="bg-surface-50 rounded-xl p-4">
                          <div className="text-sm text-surface-600 mb-1">Due Date</div>
                          <div className="font-medium text-surface-900">{format(new Date(selectedPayment.dueDate), 'MMM dd, yyyy')}</div>
                        </div>
                      </div>
                      
                      {selectedPayment.paidDate && (
                        <div className="bg-green-50 rounded-xl p-4">
                          <div className="text-sm text-green-600 mb-1">Paid Date</div>
                          <div className="font-medium text-green-900">{format(new Date(selectedPayment.paidDate), 'MMM dd, yyyy')}</div>
                        </div>
                      )}
                      
                      {(selectedPayment.clientName || selectedPayment.vendorName) && (
                        <div className="bg-surface-50 rounded-xl p-4">
                          <div className="text-sm text-surface-600 mb-1">
                            {selectedPayment.type === 'client' ? 'Client' : 'Vendor'}
                          </div>
                          <div className="font-medium text-surface-900">
                            {selectedPayment.clientName || selectedPayment.vendorName}
                          </div>
                        </div>
                      )}
                      
                      {selectedPayment.invoiceNumber && (
                        <div className="bg-surface-50 rounded-xl p-4">
                          <div className="text-sm text-surface-600 mb-1">Invoice Number</div>
                          <div className="font-medium text-surface-900">{selectedPayment.invoiceNumber}</div>
                        </div>
                      )}
                      
                      {selectedPayment.paymentMethod && (
                        <div className="bg-surface-50 rounded-xl p-4">
                          <div className="text-sm text-surface-600 mb-1">Payment Method</div>
                          <div className="font-medium text-surface-900">
                            {selectedPayment.paymentMethod.replace('_', ' ').toUpperCase()}
                          </div>
                        </div>
                      )}
                      
                      {selectedPayment.status !== 'paid' && (
                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={() => {
                              updatePaymentStatus(selectedPayment.id, 'paid')
                              setShowPaymentDetails(false)
                            }}
                            className="btn-primary flex-1"
                          >
                            Mark as Paid
                          </button>
                          {selectedPayment.status === 'paid' && (
                            <button
                              onClick={() => {
                                updatePaymentStatus(selectedPayment.id, 'refunded')
                                setShowPaymentDetails(false)
                              }}
                              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors"
                            >
                              Refund
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
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
                      className="bg-surface-50 rounded-xl p-4 hover:bg-surface-100 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedPayment(payment)
                        setShowPaymentDetails(true)
                      }}
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
                            {(payment.clientName || payment.vendorName) && (
                              <div className="flex items-center space-x-2">
                                <ApperIcon name={payment.type === 'client' ? 'User' : 'Building2'} className="w-4 h-4" />
                                <span>{payment.clientName || payment.vendorName}</span>
                              </div>
                            )}
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
                            {payment.status !== 'paid' && (
                              <select
                                value={payment.status}
                                onChange={(e) => {
                                  e.stopPropagation()
                                  updatePaymentStatus(payment.id, e.target.value)
                                }}
                                className="px-3 py-1 border border-surface-200 rounded text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="overdue">Overdue</option>
                                <option value="refunded">Refunded</option>
                              </select>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deletePayment(payment.id)
                              }}
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
        )}

      </AnimatePresence>
    </div>
  )
}

export default MainFeature