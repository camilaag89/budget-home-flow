
import React, { createContext, useContext, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'credit' | 'debit' | 'cash' | 'transfer';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: Date;
  type: TransactionType;
  category: string;
  paymentMethod: PaymentMethod;
  installments?: number;
  currentInstallment?: number;
  futureInstallments?: FutureInstallment[];
}

export interface FutureInstallment {
  id: string;
  transactionId: string;
  month: string; // Format: YYYY-MM
  amount: number;
  installmentNumber: number;
}

export interface SpendingGoal {
  id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
}

interface MonthlyTotal {
  month: string; // Format: YYYY-MM
  income: number;
  expense: number;
}

interface FinanceContextType {
  currentMonth: string; // Format: YYYY-MM
  setCurrentMonth: (month: string) => void;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  spendingGoals: SpendingGoal[];
  addSpendingGoal: (goal: Omit<SpendingGoal, 'id'>) => void;
  updateSpendingGoal: (id: string, goal: Partial<SpendingGoal>) => void;
  deleteSpendingGoal: (id: string) => void;
  categories: string[];
  addCategory: (category: string) => void;
  getMonthlyTransactions: (month: string) => Transaction[];
  getMonthlyTotals: (months?: number) => MonthlyTotal[];
  getGoalProgress: (goalId: string) => number;
  getTotalIncome: (month: string) => number;
  getTotalExpense: (month: string) => number;
  getCategoryTotal: (category: string, month: string) => number;
  getFutureInstallments: (month: string) => FutureInstallment[];
}

const FinanceContext = createContext<FinanceContextType | null>(null);

const DEFAULT_CATEGORIES = [
  'Alimentação',
  'Moradia',
  'Transporte',
  'Lazer',
  'Saúde',
  'Educação',
  'Vestuário',
  'Outros',
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [currentMonth, setCurrentMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('finance-transactions');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((t: any) => ({
        ...t,
        date: new Date(t.date),
        futureInstallments: t.futureInstallments ? t.futureInstallments.map((fi: any) => ({
          ...fi,
        })) : undefined,
      }));
    }
    return [];
  });
  
  const [spendingGoals, setSpendingGoals] = useState<SpendingGoal[]>(() => {
    const saved = localStorage.getItem('finance-spending-goals');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((g: any) => ({
        ...g,
        startDate: new Date(g.startDate),
        endDate: g.endDate ? new Date(g.endDate) : undefined,
      }));
    }
    return [];
  });
  
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('finance-categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('finance-transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finance-spending-goals', JSON.stringify(spendingGoals));
  }, [spendingGoals]);

  useEffect(() => {
    localStorage.setItem('finance-categories', JSON.stringify(categories));
  }, [categories]);

  // Create future installments for credit card transactions
  const createFutureInstallments = (transaction: Omit<Transaction, 'id'>) => {
    if (transaction.paymentMethod !== 'credit' || !transaction.installments || transaction.installments <= 1) {
      return { id: generateId(), ...transaction, installments: undefined, currentInstallment: undefined, futureInstallments: undefined };
    }

    const transactionId = generateId();
    const installments = transaction.installments;
    const installmentAmount = Math.round((transaction.amount / installments) * 100) / 100;
    const lastInstallmentAmount = transaction.amount - (installmentAmount * (installments - 1));
    
    const futureInstallments: FutureInstallment[] = [];
    
    // Create a Date object from the transaction date
    const transactionDate = new Date(transaction.date);
    
    for (let i = 0; i < installments; i++) {
      // Create a new date for each installment (same day, months ahead)
      const installmentDate = new Date(transactionDate);
      installmentDate.setMonth(transactionDate.getMonth() + i);
      
      // Format the month string
      const monthString = format(installmentDate, 'yyyy-MM');
      
      // The amount for this installment (last one might have rounding differences)
      const amount = i === installments - 1 ? lastInstallmentAmount : installmentAmount;
      
      futureInstallments.push({
        id: generateId(),
        transactionId,
        month: monthString,
        amount,
        installmentNumber: i + 1,
      });
    }
    
    return {
      id: transactionId,
      ...transaction,
      currentInstallment: 1,
      futureInstallments,
    };
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = createFutureInstallments(transaction);
    setTransactions((prev) => [...prev, newTransaction]);
  };

  const updateTransaction = (id: string, updatedFields: Partial<Transaction>) => {
    setTransactions((prev) => 
      prev.map((transaction) => 
        transaction.id === id ? { ...transaction, ...updatedFields } : transaction
      )
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
  };

  const addSpendingGoal = (goal: Omit<SpendingGoal, 'id'>) => {
    const newGoal = { id: generateId(), ...goal };
    setSpendingGoals((prev) => [...prev, newGoal]);
  };

  const updateSpendingGoal = (id: string, updatedFields: Partial<SpendingGoal>) => {
    setSpendingGoals((prev) => 
      prev.map((goal) => 
        goal.id === id ? { ...goal, ...updatedFields } : goal
      )
    );
  };

  const deleteSpendingGoal = (id: string) => {
    setSpendingGoals((prev) => prev.filter((goal) => goal.id !== id));
  };

  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories((prev) => [...prev, category]);
    }
  };

  const getMonthlyTransactions = (month: string) => {
    return transactions.filter((transaction) => {
      // Include regular transactions from this month
      const transactionMonth = format(new Date(transaction.date), 'yyyy-MM');
      if (transactionMonth === month) {
        return true;
      }
      
      // Include credit card installments that apply to this month
      if (transaction.futureInstallments) {
        return transaction.futureInstallments.some(installment => installment.month === month);
      }
      
      return false;
    });
  };

  const getFutureInstallments = (month: string) => {
    const installments: FutureInstallment[] = [];
    
    transactions.forEach(transaction => {
      if (transaction.futureInstallments) {
        transaction.futureInstallments.forEach(installment => {
          if (installment.month === month) {
            installments.push({
              ...installment,
              transactionId: transaction.id,
            });
          }
        });
      }
    });
    
    return installments;
  };

  const getTotalIncome = (month: string) => {
    return transactions
      .filter(transaction => {
        const transactionMonth = format(new Date(transaction.date), 'yyyy-MM');
        return transactionMonth === month && transaction.type === 'income';
      })
      .reduce((total, transaction) => total + transaction.amount, 0);
  };

  const getTotalExpense = (month: string) => {
    // First, get regular expenses for this month
    const regularExpenses = transactions
      .filter(transaction => {
        const transactionMonth = format(new Date(transaction.date), 'yyyy-MM');
        return transactionMonth === month && transaction.type === 'expense' && transaction.paymentMethod !== 'credit';
      })
      .reduce((total, transaction) => total + transaction.amount, 0);
    
    // Second, add credit card installments for this month
    const installmentExpenses = getFutureInstallments(month)
      .reduce((total, installment) => {
        // Find the original transaction to check if it's an expense
        const originalTransaction = transactions.find(t => t.id === installment.transactionId);
        if (originalTransaction && originalTransaction.type === 'expense') {
          return total + installment.amount;
        }
        return total;
      }, 0);
    
    return regularExpenses + installmentExpenses;
  };

  const getCategoryTotal = (category: string, month: string) => {
    // First, get regular expenses in this category for this month
    const regularExpenses = transactions
      .filter(transaction => {
        const transactionMonth = format(new Date(transaction.date), 'yyyy-MM');
        return transactionMonth === month && 
               transaction.category === category && 
               transaction.type === 'expense' &&
               transaction.paymentMethod !== 'credit';
      })
      .reduce((total, transaction) => total + transaction.amount, 0);
    
    // Second, add credit card installments for this month in this category
    const installmentExpenses = getFutureInstallments(month)
      .reduce((total, installment) => {
        // Find the original transaction to check category
        const originalTransaction = transactions.find(t => t.id === installment.transactionId);
        if (originalTransaction && 
            originalTransaction.category === category && 
            originalTransaction.type === 'expense') {
          return total + installment.amount;
        }
        return total;
      }, 0);
    
    return regularExpenses + installmentExpenses;
  };

  const getMonthlyTotals = (monthsCount = 6): MonthlyTotal[] => {
    const result: MonthlyTotal[] = [];
    
    // Get the start date (current month - monthsCount + 1)
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsCount + 1);
    
    for (let i = 0; i < monthsCount; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      const monthString = format(date, 'yyyy-MM');
      
      result.push({
        month: monthString,
        income: getTotalIncome(monthString),
        expense: getTotalExpense(monthString)
      });
    }
    
    return result;
  };

  const getGoalProgress = (goalId: string): number => {
    const goal = spendingGoals.find(g => g.id === goalId);
    if (!goal) return 0;
    
    // For monthly goals, check against current month spending
    if (goal.period === 'monthly') {
      const spent = getCategoryTotal(goal.category, currentMonth);
      return Math.min(spent / goal.amount * 100, 100);
    }
    
    // For yearly goals, sum up the entire year
    const yearStart = currentMonth.substring(0, 4) + '-01';
    const yearEnd = currentMonth.substring(0, 4) + '-12';
    
    let totalSpent = 0;
    for (let month = 1; month <= 12; month++) {
      const monthStr = `${currentMonth.substring(0, 4)}-${month.toString().padStart(2, '0')}`;
      totalSpent += getCategoryTotal(goal.category, monthStr);
    }
    
    return Math.min(totalSpent / goal.amount * 100, 100);
  };

  const value = {
    currentMonth,
    setCurrentMonth,
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    spendingGoals,
    addSpendingGoal,
    updateSpendingGoal,
    deleteSpendingGoal,
    categories,
    addCategory,
    getMonthlyTransactions,
    getMonthlyTotals,
    getGoalProgress,
    getTotalIncome,
    getTotalExpense,
    getCategoryTotal,
    getFutureInstallments,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
