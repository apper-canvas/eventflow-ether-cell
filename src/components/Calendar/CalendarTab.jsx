import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { format, addDays, startOfWeek, startOfMonth, endOfMonth, addMonths, subMonths, isSameDay, isSameMonth, eachDayOfInterval } from 'date-fns'
import ApperIcon from '../ApperIcon'
import { useEventData } from '../../hooks/useEventData'
import { statusColors } from '../../constants/colors'

const CalendarTab = ({ setShowEventForm, setNewEvent, events, setEvents }) => {
  const [selectedDate, setSelectedDate] = useState(new Date())


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

  return (
    <motion.div
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
                onClick={() => setShowEventForm(true)}
                className="mt-4 text-primary hover:text-primary-dark transition-colors text-sm font-medium"
              >
                Create your first event
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default CalendarTab