/**
 * Centralized status handling utilities
 * Eliminates duplicate status functions across screens
 * 
 * Note: For job-specific formatting utilities, see UnifiedJobFormattingUtils.ts
 */

/**
 * Get status color based on job/booking status
 * @param {string} status - The status string
 * @param {object} theme - Theme object with color properties
 * @returns {string} Color value for the status
 */
export const getStatusColor = (status, theme) => {
  const statusColors = {
    'posted': theme.info,
    'bidding': theme.warning,
    'accepted': theme.primary,
    'open': theme.info,
    'scheduled': theme.warning,
    'in_progress': theme.primary,
    'completed': theme.success,
    'cancelled': theme.error,
    'disputed': theme.error,
    // Change order statuses
    'pending': theme.warning,
    'approved': theme.success,
    'rejected': theme.error,
    'escrow': theme.accent,
    'paid': theme.success,
    'expired': theme.error,
  };
  return statusColors[status] || theme.textSecondary;
};

/**
 * Get status icon based on job/booking status
 * @param {string} status - The status string
 * @returns {string} Icon name for the status
 */
export const getStatusIcon = (status) => {
  const statusIcons = {
    'posted': 'post-add',
    'bidding': 'gavel',
    'accepted': 'check-circle',
    'open': 'schedule',
    'scheduled': 'event',
    'in_progress': 'build',
    'completed': 'check-circle',
    'cancelled': 'cancel',
    'disputed': 'warning',
    // Change order statuses
    'pending': 'schedule',
    'approved': 'check-circle',
    'rejected': 'cancel',
    'escrow': 'account-balance-wallet',
    'paid': 'payment',
    'expired': 'schedule',
  };
  return statusIcons[status] || 'help';
};

/**
 * Get human-readable status text
 * @param {string} status - The status string
 * @returns {string} Formatted status text
 */
export const getStatusText = (status) => {
  const statusTexts = {
    'posted': 'Posted',
    'bidding': 'Bidding',
    'accepted': 'Accepted',
    'open': 'Open',
    'scheduled': 'Scheduled',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'disputed': 'Disputed',
    // Change order statuses
    'pending': 'Pending Approval',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'escrow': 'Payment in Escrow',
    'paid': 'Paid',
    'expired': 'Expired',
  };
  return statusTexts[status] || status;
};

/**
 * Get status badge style configuration
 * @param {string} status - The status string
 * @param {object} theme - Theme object
 * @returns {object} Style configuration for status badge
 */
export const getStatusBadgeStyle = (status, theme) => {
  const color = getStatusColor(status, theme);
  return {
    backgroundColor: color + '20',
    borderColor: color,
    color: color,
  };
};

/**
 * Check if status allows specific actions
 * @param {string} status - The status string
 * @param {string} action - The action to check
 * @returns {boolean} Whether the action is allowed
 */
export const canPerformAction = (status, action) => {
  const actionRules = {
    'cancel': ['posted', 'bidding', 'open', 'scheduled', 'pending'],
    'schedule': ['open', 'accepted'],
    'rate': ['completed'],
    'rebook': ['completed'],
    'view': ['posted', 'bidding', 'accepted', 'open', 'scheduled', 'in_progress', 'completed'],
    'edit': ['posted', 'bidding', 'open', 'scheduled'],
    'bid': ['posted', 'bidding'],
    'accept': ['bidding'],
    'dispute': ['accepted', 'in_progress', 'completed'],
  };
  
  return actionRules[action]?.includes(status) || false;
};

/**
 * Get status priority for sorting
 * @param {string} status - The status string
 * @returns {number} Priority value (lower = higher priority)
 */
export const getStatusPriority = (status) => {
  const priorities = {
    'in_progress': 1,
    'scheduled': 2,
    'accepted': 3,
    'bidding': 4,
    'posted': 5,
    'open': 6,
    'pending': 7,
    'completed': 8,
    'cancelled': 9,
    'disputed': 10,
    'expired': 11,
  };
  return priorities[status] || 99;
};

/**
 * Get available actions for a status
 * @param {string} status - The status string
 * @returns {string[]} Array of available actions
 */
export const getStatusActions = (status) => {
  const actions = [];
  if (canPerformAction(status, 'cancel')) actions.push('cancel');
  if (canPerformAction(status, 'schedule')) actions.push('schedule');
  if (canPerformAction(status, 'rate')) actions.push('rate');
  if (canPerformAction(status, 'rebook')) actions.push('rebook');
  if (canPerformAction(status, 'edit')) actions.push('edit');
  if (canPerformAction(status, 'bid')) actions.push('bid');
  if (canPerformAction(status, 'accept')) actions.push('accept');
  if (canPerformAction(status, 'dispute')) actions.push('dispute');
  return actions;
};

/**
 * Format status for display
 * @param {string} status - The status string
 * @returns {string} Formatted status text
 */
export const formatStatus = (status) => {
  return getStatusText(status);
};

/**
 * Validate if status is valid
 * @param {string} status - The status string
 * @returns {boolean} Whether the status is valid
 */
export const isValidStatus = (status) => {
  const validStatuses = [
    'posted', 'bidding', 'accepted', 'open', 'scheduled', 
    'in_progress', 'completed', 'cancelled', 'disputed',
    'pending', 'approved', 'rejected', 'escrow', 'paid', 'expired'
  ];
  return validStatuses.includes(status);
};

/**
 * Get status transition information
 * @param {string} fromStatus - Current status
 * @param {string} toStatus - Target status
 * @returns {object} Transition information
 */
export const getStatusTransition = (fromStatus, toStatus) => {
  const transitions = {
    'posted': ['bidding', 'cancelled'],
    'bidding': ['accepted', 'cancelled'],
    'accepted': ['scheduled', 'cancelled'],
    'scheduled': ['in_progress', 'cancelled'],
    'in_progress': ['completed', 'disputed'],
    'completed': ['rebook'],
    'pending': ['approved', 'rejected'],
  };
  
  return {
    isValid: transitions[fromStatus]?.includes(toStatus) || false,
    fromStatus,
    toStatus,
    allowedTransitions: transitions[fromStatus] || []
  };
};

/**
 * Get status history metrics
 * @param {string} status - The status string
 * @returns {object} Status metrics
 */
export const getStatusMetrics = (status) => {
  const metrics = {
    'posted': { duration: '1-7 days', completionRate: 0.85 },
    'bidding': { duration: '1-3 days', completionRate: 0.90 },
    'accepted': { duration: '1-2 days', completionRate: 0.95 },
    'scheduled': { duration: '1-7 days', completionRate: 0.98 },
    'in_progress': { duration: '1-5 days', completionRate: 0.99 },
    'completed': { duration: '0 days', completionRate: 1.0 },
    'cancelled': { duration: '0 days', completionRate: 0.0 },
    'disputed': { duration: '7-30 days', completionRate: 0.60 },
  };
  
  return metrics[status] || { duration: 'unknown', completionRate: 0.0 };
};

/**
 * Get status history for a given status
 * @param {string} status - The status string
 * @returns {array} Array of status history items
 */
export const getStatusHistory = (status) => {
  const statusHistory = {
    'posted': [
      { status: 'posted', timestamp: new Date().toISOString(), description: 'Job posted' }
    ],
    'bidding': [
      { status: 'posted', timestamp: new Date(Date.now() - 86400000).toISOString(), description: 'Job posted' },
      { status: 'bidding', timestamp: new Date().toISOString(), description: 'Bidding started' }
    ],
    'accepted': [
      { status: 'posted', timestamp: new Date(Date.now() - 172800000).toISOString(), description: 'Job posted' },
      { status: 'bidding', timestamp: new Date(Date.now() - 86400000).toISOString(), description: 'Bidding started' },
      { status: 'accepted', timestamp: new Date().toISOString(), description: 'Job accepted' }
    ],
    'scheduled': [
      { status: 'posted', timestamp: new Date(Date.now() - 259200000).toISOString(), description: 'Job posted' },
      { status: 'bidding', timestamp: new Date(Date.now() - 172800000).toISOString(), description: 'Bidding started' },
      { status: 'accepted', timestamp: new Date(Date.now() - 86400000).toISOString(), description: 'Job accepted' },
      { status: 'scheduled', timestamp: new Date().toISOString(), description: 'Job scheduled' }
    ],
    'in_progress': [
      { status: 'posted', timestamp: new Date(Date.now() - 345600000).toISOString(), description: 'Job posted' },
      { status: 'bidding', timestamp: new Date(Date.now() - 259200000).toISOString(), description: 'Bidding started' },
      { status: 'accepted', timestamp: new Date(Date.now() - 172800000).toISOString(), description: 'Job accepted' },
      { status: 'scheduled', timestamp: new Date(Date.now() - 86400000).toISOString(), description: 'Job scheduled' },
      { status: 'in_progress', timestamp: new Date().toISOString(), description: 'Work started' }
    ],
    'completed': [
      { status: 'posted', timestamp: new Date(Date.now() - 432000000).toISOString(), description: 'Job posted' },
      { status: 'bidding', timestamp: new Date(Date.now() - 345600000).toISOString(), description: 'Bidding started' },
      { status: 'accepted', timestamp: new Date(Date.now() - 259200000).toISOString(), description: 'Job accepted' },
      { status: 'scheduled', timestamp: new Date(Date.now() - 172800000).toISOString(), description: 'Job scheduled' },
      { status: 'in_progress', timestamp: new Date(Date.now() - 86400000).toISOString(), description: 'Work started' },
      { status: 'completed', timestamp: new Date().toISOString(), description: 'Job completed' }
    ],
    'cancelled': [
      { status: 'posted', timestamp: new Date(Date.now() - 172800000).toISOString(), description: 'Job posted' },
      { status: 'cancelled', timestamp: new Date().toISOString(), description: 'Job cancelled' }
    ]
  };
  
  return statusHistory[status] || [
    { status: status, timestamp: new Date().toISOString(), description: `Status: ${status}` }
  ];
};
