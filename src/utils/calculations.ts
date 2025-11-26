import type { Transaction } from '../types';

export const calculateTotalInflows = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.type === 'inflow')
    .reduce((sum, t) => sum + t.amount, 0);
};

export const calculateTotalOutflows = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.type === 'outflow')
    .reduce((sum, t) => sum + t.amount, 0);
};


