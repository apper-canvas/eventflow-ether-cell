import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from './ApperIcon'
import EventsTab from './Events/EventsTab'
import GuestsTab from './Guests/GuestsTab'
import BudgetTab from './Budget/BudgetTab'
import VendorsTab from './Vendors/VendorsTab'
import PaymentsTab from './Payments/PaymentsTab'
import CalendarTab from './Calendar/CalendarTab'
import { useEventData } from '../hooks/useEventData'

const MainFeature = () => {
  const [activeTab, setActiveTab] = useState('events')
  const [showEventForm, setShowEventForm] = useState(false)
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    date: '',
    venue: '',
    budget: '',
    guestCount: ''
  })

  const eventData = useEventData()
  const { events, setEvents } = eventData


  const tabs = [
    { id: 'events', label: 'Events', icon: 'Calendar' },
    { id: 'guests', label: 'Guests', icon: 'Users' },
    { id: 'budget', label: 'Budget', icon: 'DollarSign' },
    { id: 'vendors', label: 'Vendors', icon: 'Building2' },
    { id: 'payments', label: 'Payments', icon: 'CreditCard' },
    { id: 'calendar', label: 'Calendar', icon: 'CalendarDays' }
  ]

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
      </div>

      {/* Event Creation Form Modal */}
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

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'events' && (
          <EventsTab
            key="events"
            setShowEventForm={setShowEventForm}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'guests' && (
          <GuestsTab key="guests" />
        )}

        {activeTab === 'budget' && (
          <BudgetTab key="budget" />
        )}

        {activeTab === 'vendors' && (
          <VendorsTab key="vendors" />
        )}

        {activeTab === 'payments' && (
          <PaymentsTab key="payments" />
        )}

        {activeTab === 'calendar' && (
          <CalendarTab
            key="calendar"
            setShowEventForm={setShowEventForm}
            setNewEvent={setNewEvent}
            events={events}
            setEvents={setEvents}
          />
        )}

      </AnimatePresence>
    </div>
  )
}

export default MainFeature