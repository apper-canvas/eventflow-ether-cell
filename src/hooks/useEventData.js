import { useState } from 'react'
import { addDays } from 'date-fns'

export const useEventData = () => {
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

  return {
    events,
    setEvents,
    guests,
    setGuests,
    budgetItems,
    setBudgetItems
  }
}
