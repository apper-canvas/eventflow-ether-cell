export const getBudgetUtilization = (spent, allocated) => {
  if (allocated === 0) return 0
  return (spent / allocated) * 100
}

export const getBudgetStatus = (utilization) => {
  if (utilization > 90) return 'over-budget'
  if (utilization > 70) return 'warning'
  return 'on-track'
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}
