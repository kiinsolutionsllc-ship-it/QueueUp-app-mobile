/**
 * Job Cost Utilities
 * 
 * Helper functions for calculating and displaying job costs,
 * including original costs and additional work from change orders.
 */

/**
 * Calculate the total cost of a job including any approved change orders
 * @param job - The job object
 * @returns The total cost including additional work
 */
export const calculateTotalJobCost = (job: any): number => {
  if (!job) return 0;
  
  // Try multiple possible cost fields
  const originalCost = job.estimatedCost || job.price || job.amount || job.cost || 0;
  const additionalWorkAmount = job.additionalWorkAmount || 0;
  
  return originalCost + additionalWorkAmount;
};

/**
 * Format job cost for display
 * @param job - The job object
 * @param showBreakdown - Whether to show original + additional breakdown
 * @returns Formatted cost string
 */
export const formatJobCost = (job: any, showBreakdown: boolean = false): string => {
  if (!job) return 'TBD';
  
  // Try multiple possible cost fields
  const originalCost = job.estimatedCost || job.price || job.amount || job.cost || 0;
  const additionalWorkAmount = job.additionalWorkAmount || 0;
  const totalCost = originalCost + additionalWorkAmount;
  
  if (additionalWorkAmount > 0 && showBreakdown) {
    return `$${totalCost.toFixed(2)} ($${originalCost.toFixed(2)} + $${additionalWorkAmount.toFixed(2)})`;
  }
  
  // If we have any cost information, show it
  if (totalCost > 0) {
    return `$${totalCost.toFixed(2)}`;
  }
  
  // If original cost is 0 but we have additional work, show that
  if (additionalWorkAmount > 0) {
    return `$${additionalWorkAmount.toFixed(2)}`;
  }
  
  // Only show TBD if we truly have no cost information
  return 'TBD';
};

/**
 * Get cost breakdown for detailed display
 * @param job - The job object
 * @returns Object with cost breakdown
 */
export const getJobCostBreakdown = (job: any) => {
  if (!job) {
    return {
      originalCost: 0,
      additionalWorkAmount: 0,
      totalCost: 0,
      hasAdditionalWork: false
    };
  }
  
  // Try multiple possible cost fields
  const originalCost = job.estimatedCost || job.price || job.amount || job.cost || 0;
  const additionalWorkAmount = job.additionalWorkAmount || 0;
  const totalCost = originalCost + additionalWorkAmount;
  
  return {
    originalCost,
    additionalWorkAmount,
    totalCost,
    hasAdditionalWork: additionalWorkAmount > 0
  };
};
