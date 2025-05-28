import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '../ApperIcon'
import guestService from '../../services/guestService'
import eventService from '../../services/eventService'
import { rsvpColors } from '../../constants/colors'

const GuestsTab = () => {
  const [guests, setGuests] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showGuestForm, setShowGuestForm] = useState(false)
  const [newGuest, setNewGuest] = useState({
    name: '',
    email: '',
    rsvpStatus: 'pending',
    eventId: ''
  })

  // Load events and guests on component mount
  useEffect(() => {
    loadEvents()
    loadGuests()
  }, [])

  const loadEvents = async () => {
    try {
      const eventsData = await eventService.fetchEvents()
      setEvents(eventsData)
    } catch (err) {
      console.error('Error loading events:', err)
    }
  }

  const loadGuests = async () => {
    setLoading(true)
    setError(null)
    try {
      const guestsData = await guestService.fetchGuests(selectedEvent || null)
      setGuests(guestsData)
    } catch (err) {
      setError('Failed to load guests')
      console.error('Error loading guests:', err)
    } finally {
      setLoading(false)
    }
  }

  // Reload guests when selected event changes
  useEffect(() => {
    loadGuests()
  }, [selectedEvent]) // Added selectedEvent to dependencies as we need to reload guests when event filter changes

  const handleCreateGuest = async (e) => {
    e.preventDefault()
    if (!newGuest.name || !newGuest.email) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const createdGuests = await guestService.createGuests({
        name: newGuest.name,
        email: newGuest.email,
        rsvpStatus: newGuest.rsvpStatus,
        eventId: newGuest.eventId || selectedEvent
      })

      if (createdGuests && createdGuests.length > 0) {
        setGuests(prev => [...prev, ...createdGuests])
        setNewGuest({ name: '', email: '', rsvpStatus: 'pending', eventId: '' })
        setShowGuestForm(false)
        toast.success('Guest added successfully!')
      }
    } catch (error) {
      console.error('Error creating guest:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateRsvpStatus = async (guestId, status) => {
    try {
      await guestService.updateRsvpStatus(guestId, status)
      setGuests(prev => prev.map(guest => 
        guest.id === guestId ? { ...guest, rsvpStatus: status } : guest
      ))
    } catch (err) {
      console.error('Error updating RSVP status:', err)
    }
  }

  const deleteGuest = async (guestId) => {
    if (window.confirm('Are you sure you want to delete this guest?')) {
      try {
        await guestService.deleteGuests(guestId)
        setGuests(prev => prev.filter(guest => guest.id !== guestId))
      } catch (err) {
        console.error('Error deleting guest:', err)
      }
    }
  }

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (loading && guests.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-12"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-surface-600">Loading guests...</span>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={loadGuests}
          className="btn-primary"
        >
          Try Again
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h3 className="text-2xl sm:text-3xl font-bold text-surface-900">Guest Management</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowGuestForm(true)}
          className="btn-primary inline-flex items-center space-x-2"
        >
          <ApperIcon name="Plus" className="w-5 h-5" />
          <span>Add Guest</span>
        </motion.button>
      </div>

      {/* Filters */}
      <div className="card-neu">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-surface-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
              placeholder="Search guests by name or email..."
            />
          </div>
          
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="input-field"
          >
            <option value="">All Events</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>{event.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Guest Creation Form Modal */}
      <AnimatePresence>
        {showGuestForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowGuestForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-2xl font-bold text-surface-900">Add New Guest</h4>
                <button
                  onClick={() => setShowGuestForm(false)}
                  className="p-2 hover:bg-surface-100 rounded-xl transition-colors"
                >
                  <ApperIcon name="X" className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleCreateGuest} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={newGuest.name}
                      onChange={(e) => setNewGuest(prev => ({ ...prev, name: e.target.value }))}
                      className="input-field"
                      placeholder="Enter guest name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={newGuest.email}
                      onChange={(e) => setNewGuest(prev => ({ ...prev, email: e.target.value }))}
                      className="input-field"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Event
                    </label>
                    <select
                      value={newGuest.eventId}
                      onChange={(e) => setNewGuest(prev => ({ ...prev, eventId: e.target.value }))}
                      className="input-field"
                    >
                      <option value="">Select Event</option>
                      {events.map(event => (
                        <option key={event.id} value={event.id}>{event.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      RSVP Status
                    </label>
                    <select
                      value={newGuest.rsvpStatus}
                      onChange={(e) => setNewGuest(prev => ({ ...prev, rsvpStatus: e.target.value }))}
                      className="input-field"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="declined">Declined</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Guest'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGuestForm(false)}
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

      {/* Guests List */}
      <div className="card-neu">
        <h4 className="text-xl font-bold text-surface-900 mb-6">Guest List</h4>
        <div className="space-y-4">
          {filteredGuests.map((guest, index) => {
            const event = events.find(e => e.id === guest.eventId)
            return (
              <motion.div
                key={guest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-surface-50 rounded-xl p-4 hover:bg-surface-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h5 className="font-semibold text-surface-900">{guest.name}</h5>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${rsvpColors[guest.rsvpStatus]}`}>
                        {guest.rsvpStatus}
                      </span>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-surface-600">
                      <div className="flex items-center space-x-2">
                        <ApperIcon name="Mail" className="w-4 h-4" />
                        <span>{guest.email}</span>
                      </div>
                      {event && (
                        <div className="flex items-center space-x-2">
                          <ApperIcon name="Calendar" className="w-4 h-4" />
                          <span>{event.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={guest.rsvpStatus}
                      onChange={(e) => updateRsvpStatus(guest.id, e.target.value)}
                      className="px-3 py-1 border border-surface-200 rounded text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="declined">Declined</option>
                    </select>
                    <button
                      onClick={() => deleteGuest(guest.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <ApperIcon name="Trash2" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
          
          {filteredGuests.length === 0 && (
            <div className="text-center py-12">
              <ApperIcon name="Users" className="w-16 h-16 text-surface-300 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-surface-900 mb-2">No guests found</h4>
              <p className="text-surface-600 mb-6">
                {searchTerm || selectedEvent
                  ? 'Try adjusting your search criteria or filters'
                  : 'Get started by adding your first guest'}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowGuestForm(true)}
                className="btn-primary"
              >
                <ApperIcon name="Plus" className="w-5 h-5 mr-2" />
                Add First Guest
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default GuestsTab
