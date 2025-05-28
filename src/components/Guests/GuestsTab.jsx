import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { useEventData } from '../../hooks/useEventData'
import { rsvpColors } from '../../constants/colors'

const GuestsTab = () => {
  const { events, guests, setGuests } = useEventData()
  const [newGuest, setNewGuest] = useState({
    name: '',
    email: '',
    eventId: ''
  })

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

  const updateGuestRSVP = (guestId, status) => {
    setGuests(prev => prev.map(guest => 
      guest.id === guestId ? { ...guest, rsvpStatus: status } : guest
    ))
    toast.success('RSVP status updated')
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
  )
}

export default GuestsTab
