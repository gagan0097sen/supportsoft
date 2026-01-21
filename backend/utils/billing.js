// Calculate Prorated Amount
export const calculateProration = (
  oldPrice,
  newPrice,
  periodStart,
  periodEnd,
  changeDate
) => {
  const totalDays = Math.ceil((periodEnd - periodStart) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.ceil((periodEnd - changeDate) / (1000 * 60 * 60 * 24));
  const daysUsed = totalDays - daysRemaining;

  // Calculate unused amount from old plan
  const unusedAmount = (oldPrice / totalDays) * daysRemaining;

  // Calculate amount for new plan for remaining period
  const newPlanAmount = (newPrice / totalDays) * daysRemaining;

  // Calculate prorated amount
  const proratedAmount = newPlanAmount - unusedAmount;

  return {
    oldPrice,
    newPrice,
    totalDays,
    daysUsed,
    daysRemaining,
    unusedAmount: parseFloat(unusedAmount.toFixed(2)),
    newPlanAmount: parseFloat(newPlanAmount.toFixed(2)),
    proratedAmount: parseFloat(proratedAmount.toFixed(2)),
    isUpgrade: newPrice > oldPrice,
    changeDate: changeDate.toISOString()
  };
};

// Calculate Next Billing Date
export const calculateNextBillingDate = (currentDate, intervalMonths = 1) => {
  const nextDate = new Date(currentDate);
  nextDate.setMonth(nextDate.getMonth() + intervalMonths);
  return nextDate;
};

// Check if subscription is active
export const isSubscriptionActive = (subscription) => {
  if (!subscription) return false;
  
  const now = new Date();
  const endDate = new Date(subscription.currentPeriodEnd);
  
  return (
    subscription.status === 'active' &&
    now < endDate &&
    !subscription.cancelAtPeriodEnd
  );
};

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};