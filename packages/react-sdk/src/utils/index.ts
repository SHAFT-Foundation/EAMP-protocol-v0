// Utility functions for React SDK

export function formatEAMPType(type: string): string {
  return type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export function generateResourceId(prefix: string = 'eamp'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}-${timestamp}-${random}`;
}