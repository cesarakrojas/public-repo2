import type { Transaction, Bill } from '../types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'cashier_transactions',
  BILLS: 'app_bills'
};

// Generate unique ID
const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Get all transactions from localStorage
const getTransactions = (): Transaction[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  return data ? JSON.parse(data) : [];
};

// Save transactions to localStorage
const saveTransactions = (transactions: Transaction[]): void => {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
};

// Add a transaction
export const addTransaction = async (
  type: 'inflow' | 'outflow',
  description: string,
  amount: number,
  category?: string,
  paymentMethod?: string,
  items?: { productId: string; productName: string; quantity: number; variantName?: string; price: number; }[]
): Promise<Transaction> => {
  const transactions = getTransactions();
  
  const newTransaction: Transaction = {
    id: generateId(),
    type,
    description,
    amount,
    timestamp: new Date().toISOString(),
    category,
    paymentMethod,
    items
  };
  
  transactions.push(newTransaction);
  saveTransactions(transactions);
  
  // Trigger storage event for subscribers
  window.dispatchEvent(new StorageEvent('storage', {
    key: STORAGE_KEYS.TRANSACTIONS,
    newValue: JSON.stringify(transactions)
  }));
  
  return newTransaction;
};

// Get all transactions with filters
export const getTransactionsWithFilters = async (filters: {
  startDate?: string;
  endDate?: string;
  type?: 'inflow' | 'outflow';
  searchTerm?: string;
}): Promise<Transaction[]> => {
  let transactions = getTransactions();
  
  // Filter by date range
  if (filters.startDate) {
    transactions = transactions.filter(t => t.timestamp >= filters.startDate!);
  }
  if (filters.endDate) {
    const endOfDay = new Date(filters.endDate);
    endOfDay.setHours(23, 59, 59, 999);
    transactions = transactions.filter(t => t.timestamp <= endOfDay.toISOString());
  }
  
  // Filter by type
  if (filters.type) {
    transactions = transactions.filter(t => t.type === filters.type);
  }
  
  // Filter by search term
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    transactions = transactions.filter(t =>
      t.description.toLowerCase().includes(term) ||
      t.category?.toLowerCase().includes(term)
    );
  }
  
  return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// ==================== BILLS MANAGEMENT ====================

// Get all bills from localStorage
const getBills = (): Bill[] => {
  const data = localStorage.getItem(STORAGE_KEYS.BILLS);
  return data ? JSON.parse(data) : [];
};

// Save bills to localStorage
const saveBills = (bills: Bill[]): void => {
  localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
  
  // Trigger storage event for multi-tab sync
  window.dispatchEvent(new StorageEvent('storage', {
    key: STORAGE_KEYS.BILLS,
    newValue: JSON.stringify(bills)
  }));
};

// Get all bills
export const getAllBills = (): Bill[] => {
  return getBills();
};

// Subscribe to bills changes
export const subscribeToBills = (callback: (bills: Bill[]) => void): () => void => {
  // Initial call
  callback(getBills());
  
  // Listen for storage changes
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEYS.BILLS) {
      callback(getBills());
    }
  };
  
  window.addEventListener('storage', handler);
  
  return () => window.removeEventListener('storage', handler);
};

// Create a new bill
export const createBill = async (
  name: string,
  amount: number,
  dueDate: string,
  frequency: 'once' | 'monthly' | 'yearly',
  category?: string,
  notes?: string
): Promise<Bill> => {
  const bills = getBills();
  
  const newBill: Bill = {
    id: generateId(),
    name: name.trim(),
    amount,
    dueDate,
    frequency,
    category: category?.trim() || undefined,
    notes: notes?.trim() || undefined,
    isPaid: false,
    createdAt: new Date().toISOString()
  };
  
  bills.push(newBill);
  saveBills(bills);
  
  return newBill;
};

// Update an existing bill
export const updateBill = async (
  billId: string,
  updates: Partial<Omit<Bill, 'id' | 'createdAt'>>
): Promise<Bill> => {
  const bills = getBills();
  const billIndex = bills.findIndex(b => b.id === billId);
  
  if (billIndex === -1) {
    throw new Error('Bill not found');
  }
  
  const updatedBill: Bill = {
    ...bills[billIndex],
    ...updates,
    name: updates.name?.trim() || bills[billIndex].name,
    category: updates.category?.trim() || undefined,
    notes: updates.notes?.trim() || undefined
  };
  
  bills[billIndex] = updatedBill;
  saveBills(bills);
  
  return updatedBill;
};

// Delete a bill
export const deleteBill = async (billId: string): Promise<void> => {
  const bills = getBills();
  const filteredBills = bills.filter(b => b.id !== billId);
  
  saveBills(filteredBills);
};

// Toggle bill paid status and optionally create transaction
export const toggleBillPaid = async (
  billId: string,
  createTransaction: boolean = true
): Promise<Bill> => {
  const bills = getBills();
  const billIndex = bills.findIndex(b => b.id === billId);
  
  if (billIndex === -1) {
    throw new Error('Bill not found');
  }
  
  const bill = bills[billIndex];
  const newPaidStatus = !bill.isPaid;
  
  // Update bill status
  bills[billIndex] = {
    ...bill,
    isPaid: newPaidStatus
  };
  
  saveBills(bills);
  
  // Create transaction if marking as paid and createTransaction is true
  if (newPaidStatus && createTransaction) {
    await addTransaction(
      'outflow',
      `Pago: ${bill.name}`,
      bill.amount,
      bill.category || 'Gastos Fijos',
      undefined
    );
  }
  
  return bills[billIndex];
};
