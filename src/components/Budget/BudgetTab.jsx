import { motion } from 'framer-motion'
import ApperIcon from '../ApperIcon'
import { useEventData } from '../../hooks/useEventData'
import { getBudgetUtilization } from '../../utils/budgetUtils'

const BudgetTab = () => {
  const { events, budgetItems } = useEventData()

  const getTotalBudgetSpent = (eventId) => {
    return budgetItems
      .filter(item => item.eventId === eventId)
      .reduce((sum, item) => sum + item.spentAmount, 0)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <h3 className="text-2xl sm:text-3xl font-bold text-surface-900">Budget Tracking</h3>

      {events.map((event) => {
        const totalSpent = getTotalBudgetSpent(event.id)
        const eventBudgetItems = budgetItems.filter(item => item.eventId === event.id)
        const utilizationPercentage = ((totalSpent / event.budget) * 100).toFixed(1)

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
                  {utilizationPercentage}%
                </span>
              </div>
              <div className="w-full bg-surface-200 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-3 rounded-full ${
                    utilizationPercentage > 90 ? 'bg-red-500' :
                    utilizationPercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                />
              </div>
            </div>

            {/* Budget Categories */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {eventBudgetItems.map((item) => {
                const itemUtilization = ((item.spentAmount / item.allocatedAmount) * 100)
                
                return (
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
                          animate={{ width: `${Math.min(itemUtilization, 100)}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-2 rounded-full ${
                            itemUtilization > 100 ? 'bg-red-500' :
                            itemUtilization > 80 ? 'bg-yellow-500' : 'bg-primary'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

export default BudgetTab
