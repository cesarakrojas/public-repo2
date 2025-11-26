import { getCurrencySymbol } from './constants';

export const formatCurrency = (amount: number | undefined, currencyCode?: string): string => {
  if (amount === undefined) return '$0.00';
  
  // Get currency from localStorage if not provided
  const currency = currencyCode || localStorage.getItem('currencyCode') || 'USD';
  const symbol = getCurrencySymbol(currency);
  
  // Format number with thousand separators and 2 decimals
  const formattedNumber = amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return `${symbol} ${formattedNumber}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};
