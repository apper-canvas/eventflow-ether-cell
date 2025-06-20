import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import ApperIcon from '../ApperIcon'
import eventService from '../../services/eventService'
import taskService from '../../services/taskService'
import { statusColors, priorityColors, taskStatusColors } from '../../constants/colors'


const EventsTab = ({ setShowEventForm, setActiveTab }) => {
  const [events, setEvents] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [selectedEvent, setSelectedEvent] = useState(null)

  // Load events and tasks on component mount
  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    setLoading(true)
    setError(null)
    try {
      const eventsData = await eventService.fetchEvents()
      setEvents(eventsData)
    } catch (err) {
      setError('Failed to load events')
      console.error('Error loading events:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadTasksForEvent = async (eventId) => {
    try {
      const tasksData = await taskService.fetchTasks(eventId)
      setTasks(tasksData)
    } catch (err) {
      console.error('Error loading tasks:', err)
    }
  }

  useEffect(() => {
    if (selectedEvent) {
      loadTasksForEvent(selectedEvent)
    }
  }, [selectedEvent]) // Added selectedEvent to dependencies as we need to reload tasks when event changes

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
        <span className="ml-3 text-surface-600">Loading events...</span>
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
      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {events.map((event, index) => {
          const eventTasks = tasks.filter(task => task.eventId === event.id)
          
          return (
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
                      {eventTasks.length > 0 ? (
                        eventTasks.map((task) => (
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
                        ))
                      ) : (
                        <div className="text-sm text-surface-500 text-center py-4">
                          No tasks assigned to this event
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <ApperIcon name="Calendar" className="w-16 h-16 text-surface-300 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-surface-900 mb-2">No events found</h4>
          <p className="text-surface-600 mb-6">
            Get started by creating your first event
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowEventForm(true)}
            className="btn-primary"
          >
            <ApperIcon name="Plus" className="w-5 h-5 mr-2" />
            Create First Event
          </motion.button>
        </div>
      )}

    </motion.div>
  )
}

export default EventsTab