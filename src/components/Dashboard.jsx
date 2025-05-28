import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { format, isAfter, isBefore, addDays } from 'date-fns'
import { toast } from 'react-toastify'
import Chart from 'react-apexcharts'
import ApperIcon from './ApperIcon'
import { useEventData } from '../hooks/useEventData'
import { usePaymentData } from '../hooks/usePaymentData'
import { statusColors, paymentStatusColors, priorityColors } from '../constants/colors'

const Dashboard = () => {
  const { events } = useEventData()
  const { payments, getTotalRevenue, getOutstandingPayments } = usePaymentData()


  // Quick Stats Calculations
  const quickStats = useMemo(() => {
    const totalEvents = events.length
    const activeEvents = events.filter(event => 
      event.status === 'confirmed' || event.status === 'planning'
    ).length
    const totalRevenue = getTotalRevenue()
    const outstandingAmount = getOutstandingPayments()



    return {
      totalEvents,
      activeEvents,
      totalRevenue,
      outstandingAmount
    }
  }, [events])


  // Upcoming Events (Next 5)
  const upcomingEvents = useMemo(() => {
    return events
      .filter(event => isAfter(new Date(event.date), new Date()))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5)
  }, [events])

  // Recent Payments (Last 5)
  const recentPayments = useMemo(() => {
    return payments
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
  }, [payments])

  // Event Performance Chart Data
  const chartData = useMemo(() => {
    const monthlyData = {}
    events.forEach(event => {
      const month = format(new Date(event.date), 'MMM yyyy')
      monthlyData[month] = (monthlyData[month] || 0) + 1
    })

    const categories = Object.keys(monthlyData).slice(-6)
    const series = Object.values(monthlyData).slice(-6)

    return {
      categories,
      series: [{
        name: 'Events',
        data: series
      }]
    }
  }, [events])

  // Alerts and Reminders
  const alerts = useMemo(() => {
    const alertsList = []
    
    // Upcoming events (within 7 days)
    const upcomingSoon = events.filter(event => {
      const eventDate = new Date(event.date)
      const now = new Date()
      const sevenDaysFromNow = addDays(now, 7)
      return isAfter(eventDate, now) && isBefore(eventDate, sevenDaysFromNow)
    })

    upcomingSoon.forEach(event => {
      alertsList.push({
        id: `event-${event.id}`,
        type: 'info',
        title: 'Upcoming Event',
        message: `${event.name} is scheduled for ${format(new Date(event.date), 'MMM dd, yyyy')}`,
        action: 'View Details',
        priority: 'medium'
      })
    })

    // Overdue payments
    const overduePayments = payments.filter(payment => {
      return payment.status === 'pending' && isBefore(new Date(payment.dueDate), new Date())
    })

    overduePayments.forEach(payment => {
      alertsList.push({
        id: `payment-${payment.id}`,
        type: 'warning',
        title: 'Overdue Payment',
        message: `Payment of $${payment.amount.toLocaleString()} is overdue`,
        action: 'Process Payment',
        priority: 'high'
      })
    })

    // Planning status events that need attention
    const planningEvents = events.filter(event => event.status === 'planning')
    planningEvents.forEach(event => {
      alertsList.push({
        id: `planning-${event.id}`,
        type: 'info',
        title: 'Event Planning',
        message: `${event.name} is still in planning phase`,
        action: 'Update Status',
        priority: 'low'
      })
    })

    return alertsList.slice(0, 5) // Limit to 5 alerts
  }, [events, payments])

  const handleAlertAction = (alert) => {
    toast.info(`Action: ${alert.action} for ${alert.title}`)
  }

  const chartOptions = {
    chart: {
      type: 'line',
      height: 350,
      toolbar: {
        show: false
      }
    },
    colors: ['#6366f1'],
    stroke: {
      curve: 'smooth',
      width: 3
    },
    xaxis: {
      categories: chartData.categories
    },
    yaxis: {
      title: {
        text: 'Number of Events'
      }
    },
    grid: {
      borderColor: '#f1f5f9'
    },
    markers: {
      size: 6,
      colors: ['#6366f1'],
      strokeColors: '#fff',
      strokeWidth: 2
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-surface-900">Dashboard</h2>
        <div className="text-sm text-surface-600">
          Last updated: {format(new Date(), 'MMM dd, yyyy • HH:mm')}
        </div>
      </div>

      {/* Quick Stats (Top Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-neu"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600 mb-1">Total Events</p>
              <p className="text-2xl font-bold text-surface-900">{quickStats.totalEvents}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <ApperIcon name="Calendar" className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-neu"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600 mb-1">Active Events</p>
              <p className="text-2xl font-bold text-green-600">{quickStats.activeEvents}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <ApperIcon name="CheckCircle" className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-neu"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">${quickStats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <ApperIcon name="TrendingUp" className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-neu"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600 mb-1">Outstanding</p>
              <p className="text-2xl font-bold text-yellow-600">${quickStats.outstandingAmount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <ApperIcon name="Clock" className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card-neu"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-surface-900">Upcoming Events</h3>
            <ApperIcon name="Calendar" className="w-5 h-5 text-surface-400" />
          </div>
          <div className="space-y-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <motion.div
                  key={event.id}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-3 bg-surface-50 rounded-xl hover:bg-surface-100 transition-colors cursor-pointer"
                  onClick={() => toast.info(`Viewing details for ${event.name}`)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                      <ApperIcon name="Calendar" className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-surface-900">{event.name}</h4>
                      <p className="text-sm text-surface-600">
                        {format(new Date(event.date), 'MMM dd, yyyy • HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[event.status]}`}>
                      {event.status}
                    </span>
                    <ApperIcon name="ChevronRight" className="w-4 h-4 text-surface-400" />
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <ApperIcon name="Calendar" className="w-12 h-12 text-surface-300 mx-auto mb-3" />
                <p className="text-surface-600">No upcoming events</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Payments / Transactions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card-neu"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-surface-900">Recent Payments</h3>
            <ApperIcon name="CreditCard" className="w-5 h-5 text-surface-400" />
          </div>
          <div className="space-y-4">
            {recentPayments.length > 0 ? (
              recentPayments.map((payment) => {
                const event = events.find(e => e.id === payment.eventId)
                return (
                  <motion.div
                    key={payment.id}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between p-3 bg-surface-50 rounded-xl hover:bg-surface-100 transition-colors cursor-pointer"
                    onClick={() => toast.info(`Viewing payment details for ${payment.description}`)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        payment.type === 'client' ? 'bg-green-100' : 'bg-orange-100'
                      }`}>
                        <ApperIcon 
                          name={payment.type === 'client' ? 'TrendingUp' : 'TrendingDown'} 
                          className={`w-5 h-5 ${
                            payment.type === 'client' ? 'text-green-600' : 'text-orange-600'
                          }`} 
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-surface-900">{payment.description}</h4>
                        <p className="text-sm text-surface-600">
                          {event?.name || 'Unknown Event'} • {format(new Date(payment.createdAt), 'MMM dd')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        payment.type === 'client' ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {payment.type === 'client' ? '+' : '-'}${payment.amount.toLocaleString()}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${paymentStatusColors[payment.status]}`}>
                        {payment.status}
                      </span>
                    </div>
                  </motion.div>
                )
              })
            ) : (
              <div className="text-center py-8">
                <ApperIcon name="CreditCard" className="w-12 h-12 text-surface-300 mx-auto mb-3" />
                <p className="text-surface-600">No recent payments</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Event Performance Graph */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card-neu"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-surface-900">Event Performance</h3>
          <ApperIcon name="BarChart3" className="w-5 h-5 text-surface-400" />
        </div>
        {chartData.series[0].data.length > 0 ? (
          <Chart
            options={chartOptions}
            series={chartData.series}
            type="line"
            height={350}
          />
        ) : (
          <div className="text-center py-16">
            <ApperIcon name="BarChart3" className="w-16 h-16 text-surface-300 mx-auto mb-4" />
            <p className="text-surface-600">No event data available for chart</p>
          </div>
        )}
      </motion.div>

      {/* Alerts / Reminders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card-neu"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-surface-900">Alerts & Reminders</h3>
          <ApperIcon name="Bell" className="w-5 h-5 text-surface-400" />
        </div>
        <div className="space-y-4">
          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <motion.div
                key={alert.id}
                whileHover={{ scale: 1.02 }}
                className={`flex items-center justify-between p-4 rounded-xl border-l-4 ${
                  alert.type === 'warning' 
                    ? 'bg-yellow-50 border-yellow-400' 
                    : 'bg-blue-50 border-blue-400'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    alert.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                    <ApperIcon 
                      name={alert.type === 'warning' ? 'AlertTriangle' : 'Info'} 
                      className={`w-5 h-5 ${
                        alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                      }`} 
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-surface-900">{alert.title}</h4>
                    <p className="text-sm text-surface-600">{alert.message}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[alert.priority]}`}>
                    {alert.priority}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAlertAction(alert)}
                    className="px-3 py-1 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark transition-colors"
                  >
                    {alert.action}
                  </motion.button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <ApperIcon name="CheckCircle" className="w-12 h-12 text-green-300 mx-auto mb-3" />
              <p className="text-surface-600">All caught up! No alerts at this time.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard