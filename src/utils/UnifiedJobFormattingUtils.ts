/**
 * Unified Job Formatting Utilities (TypeScript)
 * Centralized formatting functions for job-related data
 * Combines features from both JavaScript and TypeScript versions
 */

import { Job, JobStatus, JobUrgency, Vehicle, Customer } from '../types/JobDetailsTypes';

export interface Theme {
  warning?: string;
  primary?: string;
  success?: string;
  error?: string;
  textSecondary?: string;
}

export interface JobStatistics {
  total: number;
  byStatus: Record<string, number>;
  byUrgency: Record<string, number>;
  totalPrice: number;
  averagePrice: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface BadgeStyle {
  backgroundColor: string;
  borderColor: string;
  color: string;
}

export interface CustomerContact {
  phone: string;
  email: string;
}

/**
 * Format job title with proper capitalization
 */
export const formatJobTitle = (title: string): string => {
  if (!title) return '';
  return title
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format job type with proper capitalization
 */
export const formatJobType = (type: string): string => {
  if (!type) return 'N/A';
  return type
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format vehicle information with enhanced logic
 */
export const formatVehicle = (vehicle: Vehicle | string): string => {
  if (!vehicle) return 'N/A';
  
  // If it's a string, handle different cases
  if (typeof vehicle === 'string') {
    // If it looks like a timestamp ID (13+ digits), it's likely a vehicle ID
    if (/^\d{13,}$/.test(vehicle)) {
      return 'Vehicle information not available';
    }
    // If it looks like a UUID, it's likely a vehicle ID
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(vehicle)) {
      return 'Vehicle information not available';
    }
    // Otherwise, return the string as-is (might be a formatted vehicle string)
    return vehicle;
  }
  
  // If it's an object, format it properly
  if (typeof vehicle === 'object') {
    const { make, model, year } = vehicle;
    const result = `${make || ''} ${model || ''} ${year ? `(${year})` : ''}`.trim();
    return result || 'Vehicle information not available';
  }
  
  return 'N/A';
};

/**
 * Get status color based on job status
 */
export const getStatusColor = (status: JobStatus, theme: Theme): string => {
  switch (status?.toLowerCase()) {
    case 'pending': return theme.warning || '#F59E0B';
    case 'in_progress': return theme.primary || '#2563EB';
    case 'completed': return theme.success || '#10B981';
    case 'cancelled': return theme.error || '#EF4444';
    default: return theme.textSecondary || '#666666';
  }
};

/**
 * Get urgency color based on job urgency
 */
export const getUrgencyColor = (urgency: JobUrgency, theme: Theme): string => {
  switch (urgency?.toLowerCase()) {
    case 'high': return theme.error || '#EF4444';
    case 'medium': return theme.warning || '#F59E0B';
    case 'low': return theme.success || '#10B981';
    default: return theme.textSecondary || '#666666';
  }
};

/**
 * Capitalize text (first letter uppercase, rest lowercase)
 */
export const capitalizeText = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Format date for display
 */
export const formatDate = (date: string): string => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format time for display
 */
export const formatTime = (time: string): string => {
  if (!time) return 'N/A';
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format price for display
 */
export const formatPrice = (price: number): string => {
  if (!price) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

/**
 * Get service type display text
 */
export const formatServiceType = (serviceType: string): string => {
  if (!serviceType) return 'N/A';
  return serviceType === 'mobile' ? 'Mobile Service' : 'Shop Service';
};

/**
 * Format customer name with enhanced logic
 */
export const formatCustomerName = (customer: Customer): string => {
  if (!customer) return 'N/A';
  return customer.name || 'N/A';
};

/**
 * Format customer contact info
 */
export const formatCustomerContact = (customer: Customer): CustomerContact => {
  if (!customer) return { phone: 'N/A', email: 'N/A' };
  
  return {
    phone: customer.phone || 'N/A',
    email: customer.email || 'N/A',
  };
};

/**
 * Get status badge style configuration
 */
export const getStatusBadgeStyle = (status: JobStatus, theme: Theme): BadgeStyle => {
  const color = getStatusColor(status, theme);
  return {
    backgroundColor: color + '20',
    borderColor: color,
    color: color,
  };
};

/**
 * Get urgency badge style configuration
 */
export const getUrgencyBadgeStyle = (urgency: JobUrgency, theme: Theme): BadgeStyle => {
  const color = getUrgencyColor(urgency, theme);
  return {
    backgroundColor: color + '20',
    borderColor: color,
    color: color,
  };
};

/**
 * Check if job has required information
 */
export const validateJobData = (job: Job): ValidationResult => {
  if (!job) {
    return {
      isValid: false,
      errors: ['Job data is required'],
    };
  }

  const errors: string[] = [];
  
  if (!job.title) errors.push('Job title is required');
  if (!job.description) errors.push('Job description is required');
  if (!job.category) errors.push('Job category is required');
  if (!job.customer) errors.push('Customer information is required');
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Get job display priority based on status and urgency
 */
export const getJobPriority = (job: Job): number => {
  if (!job) return 0;
  
  let priority = 0;
  
  // Status priority
  switch (job.status?.toLowerCase()) {
    case 'in_progress': priority += 100; break;
    case 'pending': priority += 80; break;
    case 'scheduled': priority += 60; break;
    case 'completed': priority += 20; break;
    case 'cancelled': priority += 0; break;
    default: priority += 40;
  }
  
  // Urgency priority
  switch (job.urgency?.toLowerCase()) {
    case 'high': priority += 50; break;
    case 'medium': priority += 30; break;
    case 'low': priority += 10; break;
    default: priority += 20;
  }
  
  return priority;
};

/**
 * Sort jobs by priority
 */
export const sortJobsByPriority = (jobs: Job[]): Job[] => {
  if (!Array.isArray(jobs)) return [];
  
  return [...jobs].sort((a, b) => {
    const priorityA = getJobPriority(a);
    const priorityB = getJobPriority(b);
    return priorityB - priorityA;
  });
};

/**
 * Filter jobs by status
 */
export const filterJobsByStatus = (jobs: Job[], status: JobStatus): Job[] => {
  if (!Array.isArray(jobs) || !status) return jobs;
  
  return jobs.filter(job => 
    job.status?.toLowerCase() === status.toLowerCase()
  );
};

/**
 * Filter jobs by urgency
 */
export const filterJobsByUrgency = (jobs: Job[], urgency: JobUrgency): Job[] => {
  if (!Array.isArray(jobs) || !urgency) return jobs;
  
  return jobs.filter(job => 
    job.urgency?.toLowerCase() === urgency.toLowerCase()
  );
};

/**
 * Search jobs by text with enhanced search logic
 */
export const searchJobs = (jobs: Job[], searchText: string): Job[] => {
  if (!Array.isArray(jobs) || !searchText) return jobs;
  
  const searchLower = searchText.toLowerCase();
  
  return jobs.filter(job => {
    const title = job.title?.toLowerCase() || '';
    const description = job.description?.toLowerCase() || '';
    const category = job.category?.toLowerCase() || '';
    const subcategory = job.subcategory?.toLowerCase() || '';
    const customerName = job.customer?.name?.toLowerCase() || '';
    const location = job.location?.toLowerCase() || '';
    
    return title.includes(searchLower) ||
           description.includes(searchLower) ||
           category.includes(searchLower) ||
           subcategory.includes(searchLower) ||
           customerName.includes(searchLower) ||
           location.includes(searchLower);
  });
};

/**
 * Get job statistics with enhanced calculations
 */
export const getJobStatistics = (jobs: Job[]): JobStatistics => {
  if (!Array.isArray(jobs)) {
    return {
      total: 0,
      byStatus: {},
      byUrgency: {},
      totalPrice: 0,
      averagePrice: 0,
    };
  }
  
  const stats: JobStatistics = {
    total: jobs.length,
    byStatus: {},
    byUrgency: {},
    totalPrice: 0,
    averagePrice: 0,
  };
  
  jobs.forEach(job => {
    // Count by status
    const status = job.status?.toLowerCase() || 'unknown';
    stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
    
    // Count by urgency
    const urgency = job.urgency?.toLowerCase() || 'unknown';
    stats.byUrgency[urgency] = (stats.byUrgency[urgency] || 0) + 1;
    
    // Sum prices
    if (job.price && typeof job.price === 'number') {
      stats.totalPrice += job.price;
    }
  });
  
  // Calculate average price
  const jobsWithPrice = jobs.filter(job => job.price && typeof job.price === 'number');
  stats.averagePrice = jobsWithPrice.length > 0 ? stats.totalPrice / jobsWithPrice.length : 0;
  
  return stats;
};

/**
 * Get job status display text
 */
export const getJobStatusText = (status: JobStatus): string => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'Pending';
    case 'in_progress': return 'In Progress';
    case 'completed': return 'Completed';
    case 'cancelled': return 'Cancelled';
    case 'on_hold': return 'On Hold';
    default: return 'Unknown';
  }
};

/**
 * Get job urgency display text
 */
export const getJobUrgencyText = (urgency: JobUrgency): string => {
  switch (urgency?.toLowerCase()) {
    case 'low': return 'Low';
    case 'medium': return 'Medium';
    case 'high': return 'High';
    case 'urgent': return 'Urgent';
    default: return 'Unknown';
  }
};

/**
 * Format job duration (if available)
 */
export const formatJobDuration = (startTime: string, endTime: string): string => {
  if (!startTime || !endTime) return 'N/A';
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end.getTime() - start.getTime();
  
  if (durationMs < 0) return 'Invalid duration';
  
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

/**
 * Get job completion percentage (if available)
 */
export const getJobCompletionPercentage = (job: Job): number => {
  if (!job) return 0;
  
  // This would typically come from the job data
  // For now, return a mock calculation based on status
  switch (job.status?.toLowerCase()) {
    case 'pending': return 0;
    case 'in_progress': return 50;
    case 'completed': return 100;
    case 'cancelled': return 0;
    default: return 0;
  }
};

/**
 * Format job location with enhanced logic
 */
export const formatJobLocation = (location: string | any): string => {
  if (!location) return 'N/A';
  
  if (typeof location === 'string') {
    return location;
  }
  
  if (typeof location === 'object') {
    const { street, city, state, zipCode } = location;
    const parts = [street, city, state, zipCode].filter(Boolean);
    return parts.join(', ') || 'N/A';
  }
  
  return 'N/A';
};

/**
 * Get job age in human-readable format
 */
export const getJobAge = (createdAt: string): string => {
  if (!createdAt) return 'N/A';
  
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

/**
 * Check if job is overdue
 */
export const isJobOverdue = (job: Job): boolean => {
  if (!job.scheduledDate) return false;
  
  const scheduled = new Date(job.scheduledDate);
  const now = new Date();
  
  return scheduled < now && job.status !== 'completed';
};

/**
 * Get job priority score for sorting
 */
export const getJobPriorityScore = (job: Job): number => {
  let score = 0;
  
  // Base priority from urgency
  switch (job.urgency?.toLowerCase()) {
    case 'urgent': score += 100; break;
    case 'high': score += 75; break;
    case 'medium': score += 50; break;
    case 'low': score += 25; break;
    default: score += 0;
  }
  
  // Status priority
  switch (job.status?.toLowerCase()) {
    case 'in_progress': score += 50; break;
    case 'pending': score += 30; break;
    case 'scheduled': score += 20; break;
    case 'completed': score += 0; break;
    case 'cancelled': score += 0; break;
    default: score += 10;
  }
  
  // Overdue penalty
  if (isJobOverdue(job)) {
    score += 25;
  }
  
  return score;
};
