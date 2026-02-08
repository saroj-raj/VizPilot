/**
 * Formatting utilities for dashboard visualizations
 */

/**
 * Format currency with $ and K/M notation
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string like "$1.2M" or "$450.3K"
 */
export function formatCurrency(value: number, decimals: number = 1): string {
  if (value === 0) return '$0';
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(decimals)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(decimals)}K`;
  }
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

/**
 * Format currency with full precision and thousands separators
 * @param value - Number to format
 * @returns Formatted string like "$1,234,567.89"
 */
export function formatCurrencyFull(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage
 * @param value - Number to format (0-1 or 0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string like "12.3%"
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  // Handle both 0-1 and 0-100 ranges
  const normalized = value > 1 ? value : value * 100;
  return `${normalized.toFixed(decimals)}%`;
}

/**
 * Format number with thousands separators
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted string like "1,234,567"
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Calculate percentage change between two values
 * @param current - Current value
 * @param previous - Previous value
 * @returns Object with change value, percentage, and direction
 */
export function calculateChange(current: number, previous: number): {
  value: number;
  percentage: number;
  direction: 'up' | 'down' | 'neutral';
  formatted: string;
} {
  const value = current - previous;
  const percentage = previous !== 0 ? ((value / previous) * 100) : 0;
  const direction = value > 0 ? 'up' : value < 0 ? 'down' : 'neutral';
  
  const sign = value >= 0 ? '+' : '';
  const formatted = `${sign}${formatPercentage(percentage, 1)}`;
  
  return { value, percentage, direction, formatted };
}

/**
 * Format date range for display
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Formatted string like "Jan 1 - Jan 31, 2025"
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric',
    year: endDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  };
  
  const start = startDate.toLocaleDateString('en-US', options);
  const end = endDate.toLocaleDateString('en-US', options);
  
  return `${start} - ${end}`;
}

/**
 * Format timestamp for "Last updated" display
 * @param date - Date to format
 * @returns Formatted string like "Updated 2 minutes ago"
 */
export function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Updated just now';
  if (diffMins < 60) return `Updated ${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `Updated ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `Updated ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return `Updated on ${date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })}`;
}

/**
 * Abbreviate long labels for charts
 * @param label - Label to abbreviate
 * @param maxLength - Maximum length before abbreviation (default: 15)
 * @returns Abbreviated string with "..." if truncated
 */
export function abbreviateLabel(label: string, maxLength: number = 15): string {
  if (label.length <= maxLength) return label;
  return `${label.substring(0, maxLength)}...`;
}

/**
 * Calculate Days Sales Outstanding (DSO)
 * @param totalReceivables - Total AR amount
 * @param avgDailySales - Average daily sales
 * @returns DSO in days
 */
export function calculateDSO(totalReceivables: number, avgDailySales: number): number {
  if (avgDailySales === 0) return 0;
  return Math.round(totalReceivables / avgDailySales);
}

/**
 * Determine aging bucket for an invoice
 * @param daysOutstanding - Number of days outstanding
 * @returns Aging bucket name
 */
export function getAgingBucket(daysOutstanding: number): string {
  if (daysOutstanding <= 0) return 'Current';
  if (daysOutstanding <= 30) return '1-30 Days';
  if (daysOutstanding <= 60) return '31-60 Days';
  if (daysOutstanding <= 90) return '61-90 Days';
  return '90+ Days';
}

/**
 * Get color for aging bucket (for risk visualization)
 * @param bucket - Aging bucket name
 * @returns Tailwind color class
 */
export function getAgingColor(bucket: string): string {
  const colors: Record<string, string> = {
    'Current': '#10b981',       // green
    '1-30 Days': '#3b82f6',     // blue
    '31-60 Days': '#f59e0b',    // amber
    '61-90 Days': '#f97316',    // orange
    '90+ Days': '#ef4444',      // red
  };
  return colors[bucket] || '#6b7280'; // gray as fallback
}

/**
 * Custom tooltip formatter for Recharts
 * @param value - Value to format
 * @param name - Series name
 * @param props - Additional props from Recharts
 * @returns Formatted tooltip content
 */
export function customTooltipFormatter(value: any, name: string, props: any): [string, string] {
  if (typeof value === 'number') {
    return [formatCurrencyFull(value), name];
  }
  return [String(value), name];
}
