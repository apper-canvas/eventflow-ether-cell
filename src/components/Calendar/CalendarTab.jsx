import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { toast } from 'react-toastify'
import ApperIcon from '../ApperIcon'
import eventService from '../../services/eventService'
import { statusColors } from '../../constants/colors'

const CalendarTab = ({ setShowEventForm, setNewEvent, events: propEvents, setEvents: setPropEvents }) => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [showEventDetails, setShowEventDetails] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  // Load events on component mount
  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    setLoading(true)
    setError(null)
    try {
      const eventsData = await eventService.fetchEvents()
      setEvents(eventsData)
      // Also update parent component events if provided
      if (setPropEvents) {
        setPropEvents(eventsData)
      }
    } catch (err) {
      setError('Failed to load events')
      console.error('Error loading events:', err)
    } finally {
      setLoading(false)
    }
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      setCurrentDate(subMonths(currentDate, 1))
    } else {
      setCurrentDate(addMonths(currentDate, 1))
    }
  }

  const getEventsForDate = (date) => {
    return events.filter(event => 
      isSameDay(new Date(event.date), date)
    )
  }

  const handleDateClick = (date) => {
    setSelectedDate(date)
    const dayEvents = getEventsForDate(date)
    
    if (dayEvents.length === 1) {
      setSelectedEvent(dayEvents[0])
      setShowEventDetails(true)
    } else if (dayEvents.length > 1) {
      // Show list of events for that day
      setShowEventDetails(true)
    } else {
      // No events, create new event for this date
      const dateString = format(date, 'yyyy-MM-dd')
      setNewEvent(prev => ({ ...prev, date: dateString + 'T12:00' }))
      setShowEventForm(true)
    }
  }

  const handleEventClick = (event, e) => {
    e.stopPropagation()
    setSelectedEvent(event)
    setShowEventDetails(true)
  }

  const updateEventStatus = async (eventId, status) => {
    try {
      const event = events.find(e => e.id === eventId)
      if (!event) return

      await eventService.updateEvents({
        ...event,
        status
      })

      setEvents(prev => prev.map(event => 
        event.id === eventId ? { ...event, status } : event
      ))
      
      if (setPropEvents) {
        setPropEvents(prev => prev.map(event => 
          event.id === eventId ? { ...event, status } : event
        ))
      }
      
      toast.success(`Event status updated to ${status}`)
    } catch (err) {
      console.error('Error updating event status:', err)
      toast.error('Failed to update event status')
    }
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-12"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-surface-600">Loading calendar...</span>
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
          onClick={loadEvents}
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
        <h3 className="text-2xl sm:text-3xl font-bold text-surface-900">Event Calendar</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowEventForm(true)}
          className="btn-primary inline-flex items-center space-x-2"
        >
          <ApperIcon name="Plus" className="w-5 h-5" />
          <span>New Event</span>
        </motion.button>
      </div>

      {/* Calendar Header */}
      <div className="card-neu">
        <div className="flex items-center justify-between mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-surface-100 rounded-xl transition-colors"
          >
            <ApperIcon name="ChevronLeft" className="w-6 h-6" />
          </motion.button>
          
          <h4 className="text-xl font-bold text-surface-900">
            {format(currentDate, 'MMMM yyyy')}
          </h4>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-surface-100 rounded-xl transition-colors"
          >
            <ApperIcon name="ChevronRight" className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-surface-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((date, index) => {
            const dayEvents = getEventsForDate(date)
            const isCurrentMonth = isSameMonth(date, currentDate)
            const isToday = isSameDay(date, new Date())
            const isSelected = selectedDate && isSameDay(date, selectedDate)

            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDateClick(date)}
                className={`
                  min-h-[80px] p-2 border border-surface-200 rounded-xl cursor-pointer transition-all duration-300
                  ${isCurrentMonth ? 'bg-white hover:bg-surface-50' : 'bg-surface-100 text-surface-400'}
                  ${isToday ? 'ring-2 ring-primary bg-primary/5' : ''}
                  ${isSelected ? 'bg-primary/10 border-primary' : ''}
                `}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isToday ? 'text-primary font-bold' : isCurrentMonth ? 'text-surface-900' : 'text-surface-400'
                }`}>
                  {format(date, 'd')}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <motion.div
                      key={event.id}
                      whileHover={{ scale: 1.05 }}
                      onClick={(e) => handleEventClick(event, e)}
                      className={`
                        text-xs px-2 py-1 rounded text-white truncate cursor-pointer
                        ${event.status === 'confirmed' ? 'bg-green-500' :
                          event.status === 'planning' ? 'bg-yellow-500' :
                          event.status === 'completed' ? 'bg-blue-500' : 'bg-red-500'}
                      `}
                      title={event.name}
                    >
                      {event.name}
                    </motion.div>
                  ))}
                  
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-surface-600 px-2">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Event Details Modal */}
      <AnimatePresence>
        {showEventDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowEventDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-2xl font-bold text-surface-900">
                  {selectedEvent ? 'Event Details' : 'Events for ' + (selectedDate ? format(selectedDate, 'MMM dd, yyyy') : '')}
                </h4>
                <button
                  onClick={() => setShowEventDetails(false)}
                  className="p-2 hover:bg-surface-100 rounded-xl transition-colors"
                >
                  <ApperIcon name="X" className="w-6 h-6" />
                </button>
              </div>
              
              {selectedEvent ? (
                // Single event details
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="text-xl font-bold text-surface-900 mb-2">{selectedEvent.name}</h5>
                      <p className="text-surface-600 mb-4">{selectedEvent.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[selectedEvent.status]}`}>
                      {selectedEvent.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2 text-surface-600">
                      <ApperIcon name="Calendar" className="w-5 h-5" />
                      <span>{format(new Date(selectedEvent.date), 'MMM dd, yyyy • HH:mm')}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-surface-600">
                      <ApperIcon name="MapPin" className="w-5 h-5" />
                      <span>{selectedEvent.venue}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-surface-600">
                      <ApperIcon name="Users" className="w-5 h-5" />
                      <span>{selectedEvent.guestCount} guests</span>
                    </div>
                    <div className="flex items-center space-x-2 text-surface-600">
                      <ApperIcon name="DollarSign" className="w-5 h-5" />
                      <span>${selectedEvent.budget?.toLocaleString() || '0'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-surface-700">Status:</label>
                    <select
                      value={selectedEvent.status}
                      onChange={(e) => updateEventStatus(selectedEvent.id, e.target.value)}
                      className="px-3 py-2 border border-surface-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="planning">Planning</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ) : (
                // Multiple events for selected date
                <div className="space-y-4">
                  {selectedDate && getEventsForDate(selectedDate).map((event) => (
                    <div key={event.id} className="bg-surface-50 rounded-xl p-4 hover:bg-surface-100 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold text-surface-900 mb-1">{event.name}</h5>
                          <div className="flex items-center space-x-4 text-sm text-surface-600">
                            <div className="flex items-center space-x-1">
                              <ApperIcon name="Clock" className="w-4 h-4" />
                              <span>{format(new Date(event.date), 'HH:mm')}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ApperIcon name="MapPin" className="w-4 h-4" />
                              <span>{event.venue}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[event.status]}`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default CalendarTab
