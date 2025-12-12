/**
 * Format a number as currency
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a number with commas as thousands separators
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Format a date string to a readable format
 */
export const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions): string => {
  const date = new Date(dateString);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  
  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(date);
};

/**
 * Format a relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count > 0) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
};

/**
 * Format duration in minutes to human readable format
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${remainingMinutes} min`;
};

/**
 * Format distance in kilometers to human readable format
 */
export const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${(km * 1000).toFixed(0)} m`;
  }
  return `${km.toFixed(1)} km`;
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Capitalize first letter of a string
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Format ride status to display text
 */
export const formatRideStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    PENDING: 'Pending',
    ASSIGNED: 'Driver Assigned',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };
  
  return statusMap[status] || status;
};

/**
 * Format payment status to display text with color
 */
export const formatPaymentStatus = (status: string): { text: string; color: string } => {
  const statusMap: Record<string, { text: string; color: string }> = {
    PENDING: { text: 'Pending', color: 'badge-warning' },
    PROCESSING: { text: 'Processing', color: 'badge-info' },
    SUCCEEDED: { text: 'Paid', color: 'badge-success' },
    FAILED: { text: 'Failed', color: 'badge-error' },
    CANCELLED: { text: 'Cancelled', color: 'badge-gray' },
    REFUNDED: { text: 'Refunded', color: 'badge-info' },
  };
  
  return statusMap[status] || { text: status, color: 'badge-gray' };
};

/**
 * Format transaction type to display text
 */
export const formatTransactionType = (type: string): string => {
  const typeMap: Record<string, string> = {
    PAYMENT: 'Payment',
    REFUND: 'Refund',
    PAYOUT: 'Payout',
    FEE: 'Fee',
  };
  
  return typeMap[type] || type;
};

/**
 * Get status badge class based on status
 */
export const getStatusBadgeClass = (status: string): string => {
  const statusMap: Record<string, string> = {
    // Ride statuses
    PENDING: 'badge-warning',
    ASSIGNED: 'badge-info',
    IN_PROGRESS: 'badge-info',
    COMPLETED: 'badge-success',
    CANCELLED: 'badge-error',
    
    // Payment statuses
    PROCESSING: 'badge-info',
    SUCCEEDED: 'badge-success',
    FAILED: 'badge-error',
    REFUNDED: 'badge-info',
    
    // Transaction statuses
    SUCCESS: 'badge-success',
    
    // Generic
    ACTIVE: 'badge-success',
    INACTIVE: 'badge-gray',
  };
  
  return statusMap[status] || 'badge-gray';
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a US phone number
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // International format
  if (cleaned.length > 10) {
    return `+${cleaned.slice(0, cleaned.length - 10)} ${cleaned.slice(-10, -7)} ${cleaned.slice(-7, -4)} ${cleaned.slice(-4)}`;
  }
  
  return phone; // Return original if can't format
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format address for display (shortened)
 */
export const formatAddress = (address: string, maxLength: number = 40): string => {
  // Common address abbreviations
  const abbreviations: Record<string, string> = {
    'Street': 'St',
    'Avenue': 'Ave',
    'Boulevard': 'Blvd',
    'Drive': 'Dr',
    'Road': 'Rd',
    'Lane': 'Ln',
    'Court': 'Ct',
    'Place': 'Pl',
    'Highway': 'Hwy',
    'Interstate': 'I-',
  };
  
  let formatted = address;
  
  // Replace common street words with abbreviations
  Object.entries(abbreviations).forEach(([full, abbr]) => {
    const regex = new RegExp(`\\b${full}\\b`, 'gi');
    formatted = formatted.replace(regex, abbr);
  });
  
  return truncate(formatted, maxLength);
};