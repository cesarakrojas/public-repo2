import type { DebtEntry } from '../types';
import * as dataService from './dataService';

const STORAGE_KEY = 'debts';

// Generate unique ID
const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Get all debts from localStorage
const getDebts = (): DebtEntry[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

// Save debts to localStorage
const saveDebts = (debts: DebtEntry[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(debts));
  
  // Trigger storage event for multi-tab sync
  window.dispatchEvent(new StorageEvent('storage', {
    key: STORAGE_KEY,
    newValue: JSON.stringify(debts)
  }));
};

// Get all debts with optional filters
export const getAllDebts = (filters?: {
  type?: 'receivable' | 'payable';
  status?: 'pending' | 'paid' | 'overdue';
  searchTerm?: string;
}): DebtEntry[] => {
  let debts = getDebts();

  // Update overdue status
  const now = new Date();
  debts = debts.map(debt => {
    if (debt.status === 'pending' && new Date(debt.dueDate) < now) {
      return { ...debt, status: 'overdue' as const };
    }
    return debt;
  });

  // Filter by type
  if (filters?.type) {
    debts = debts.filter(d => d.type === filters.type);
  }

  // Filter by status
  if (filters?.status) {
    debts = debts.filter(d => d.status === filters.status);
  }

  // Filter by search term
  if (filters?.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    debts = debts.filter(d =>
      d.counterparty.toLowerCase().includes(term) ||
      d.description.toLowerCase().includes(term) ||
      d.category?.toLowerCase().includes(term)
    );
  }

  return debts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Get a single debt by ID
export const getDebtById = (debtId: string): DebtEntry | undefined => {
  const debts = getDebts();
  return debts.find(d => d.id === debtId);
};

// Create a new debt
export const createDebt = async (
  type: 'receivable' | 'payable',
  counterparty: string,
  amount: number,
  description: string,
  dueDate: string,
  category?: string,
  notes?: string
): Promise<DebtEntry> => {
  const debts = getDebts();
  
  const newDebt: DebtEntry = {
    id: generateId(),
    type,
    counterparty: counterparty.trim(),
    amount,
    description: description.trim(),
    dueDate,
    status: new Date(dueDate) < new Date() ? 'overdue' : 'pending',
    createdAt: new Date().toISOString(),
    category: category?.trim() || undefined,
    notes: notes?.trim() || undefined
  };
  
  debts.push(newDebt);
  saveDebts(debts);
  
  return newDebt;
};

// Update an existing debt
export const updateDebt = async (
  debtId: string,
  updates: Partial<Omit<DebtEntry, 'id' | 'createdAt' | 'linkedTransactionId' | 'paidAt'>>
): Promise<DebtEntry> => {
  const debts = getDebts();
  const debtIndex = debts.findIndex(d => d.id === debtId);
  
  if (debtIndex === -1) {
    throw new Error('Debt not found');
  }
  
  const updatedDebt: DebtEntry = {
    ...debts[debtIndex],
    ...updates,
    counterparty: updates.counterparty?.trim() || debts[debtIndex].counterparty,
    description: updates.description?.trim() || debts[debtIndex].description,
    category: updates.category?.trim() || undefined,
    notes: updates.notes?.trim() || undefined
  };
  
  // Update status based on due date if changed
  if (updates.dueDate && updatedDebt.status === 'pending') {
    updatedDebt.status = new Date(updates.dueDate) < new Date() ? 'overdue' : 'pending';
  }
  
  debts[debtIndex] = updatedDebt;
  saveDebts(debts);
  
  return updatedDebt;
};

// Delete a debt
export const deleteDebt = async (debtId: string): Promise<void> => {
  const debts = getDebts();
  const filteredDebts = debts.filter(d => d.id !== debtId);
  
  saveDebts(filteredDebts);
};

// Mark debt as paid and create corresponding transaction
export const markAsPaid = async (debtId: string): Promise<{ debt: DebtEntry; transaction: any }> => {
  const debts = getDebts();
  const debtIndex = debts.findIndex(d => d.id === debtId);
  
  if (debtIndex === -1) {
    throw new Error('Debt not found');
  }
  
  const debt = debts[debtIndex];
  
  if (debt.status === 'paid') {
    throw new Error('Debt is already marked as paid');
  }
  
  // Create corresponding transaction
  const transactionType = debt.type === 'receivable' ? 'inflow' : 'outflow';
  const transactionDescription = debt.type === 'receivable'
    ? `Cobro: ${debt.counterparty} - ${debt.description}`
    : `Pago: ${debt.counterparty} - ${debt.description}`;
  
  const transaction = await dataService.addTransaction(
    transactionType,
    transactionDescription,
    debt.amount,
    debt.category,
    undefined, // paymentMethod
    undefined  // items
  );
  
  // Update debt status
  const updatedDebt: DebtEntry = {
    ...debt,
    status: 'paid',
    paidAt: new Date().toISOString(),
    linkedTransactionId: transaction.id
  };
  
  debts[debtIndex] = updatedDebt;
  saveDebts(debts);
  
  return { debt: updatedDebt, transaction };
};

// Subscribe to debt changes
export const subscribeToDebts = (callback: (debts: DebtEntry[]) => void): () => void => {
  // Initial call
  callback(getAllDebts());
  
  // Listen for storage changes
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback(getAllDebts());
    }
  };
  
  window.addEventListener('storage', handler);
  
  return () => window.removeEventListener('storage', handler);
};

// Get summary statistics
export const getDebtStats = () => {
  const debts = getAllDebts();
  
  const receivables = debts.filter(d => d.type === 'receivable');
  const payables = debts.filter(d => d.type === 'payable');
  
  const totalReceivablesPending = receivables
    .filter(d => d.status === 'pending' || d.status === 'overdue')
    .reduce((sum, d) => sum + d.amount, 0);
  
  const totalPayablesPending = payables
    .filter(d => d.status === 'pending' || d.status === 'overdue')
    .reduce((sum, d) => sum + d.amount, 0);
  
  const overdueReceivables = receivables.filter(d => d.status === 'overdue').length;
  const overduePayables = payables.filter(d => d.status === 'overdue').length;
  
  return {
    totalReceivablesPending,
    totalPayablesPending,
    netBalance: totalReceivablesPending - totalPayablesPending,
    overdueReceivables,
    overduePayables,
    totalPendingDebts: debts.filter(d => d.status === 'pending' || d.status === 'overdue').length
  };
};
