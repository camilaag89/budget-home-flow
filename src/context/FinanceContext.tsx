import React, { createContext, useContext, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/toast';
import { v4 as uuidv4 } from 'uuid';

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
  isLoading: boolean;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

function generateId(): string {
  return uuidv4();
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [spendingGoals, setSpendingGoals] = useState<SpendingGoal[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar categorias do Supabase
  useEffect(() => {
    async function loadCategories() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('name');
          
        if (error) {
          console.error('Erro ao carregar categorias:', error);
          return;
        }
        
        if (data) {
          const categoryNames = data.map(cat => cat.name);
          setCategories(categoryNames);
        }
      } catch (error) {
        console.error('Erro ao processar categorias:', error);
      }
    }
    
    loadCategories();
  }, []);

  // Carregar dados do usuário (transações e metas)
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    async function loadUserData() {
      setIsLoading(true);
      try {
        // Carregar transações
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('*, future_installments(*)')
          .eq('user_id', user.id);

        if (transactionsError) {
          console.error('Erro ao carregar transações:', transactionsError);
        } else if (transactionsData) {
          // Converter dados do banco para o formato usado no app
          const formattedTransactions = transactionsData.map(t => ({
            id: t.id,
            description: t.description,
            amount: Number(t.amount),
            date: new Date(t.date),
            type: t.type as TransactionType,
            category: t.category,
            paymentMethod: t.payment_method as PaymentMethod,
            installments: t.installments,
            currentInstallment: t.current_installment,
            futureInstallments: t.future_installments?.map((fi: any) => ({
              id: fi.id,
              transactionId: fi.transaction_id,
              month: fi.month,
              amount: Number(fi.amount),
              installmentNumber: fi.installment_number,
            })),
          }));
          
          setTransactions(formattedTransactions);
        }

        // Carregar metas de gastos
        const { data: goalsData, error: goalsError } = await supabase
          .from('spending_goals')
          .select('*')
          .eq('user_id', user.id);

        if (goalsError) {
          console.error('Erro ao carregar metas:', goalsError);
        } else if (goalsData) {
          // Converter dados do banco para o formato usado no app
          const formattedGoals = goalsData.map(g => ({
            id: g.id,
            category: g.category,
            amount: Number(g.amount),
            period: g.period as 'monthly' | 'yearly',
            startDate: new Date(g.start_date),
            endDate: g.end_date ? new Date(g.end_date) : undefined,
          }));
          
          setSpendingGoals(formattedGoals);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserData();
  }, [user]);

  // Migrar do localStorage para Supabase (uma vez)
  useEffect(() => {
    if (!user) return;

    async function migrateFromLocalStorage() {
      const savedTransactions = localStorage.getItem('finance-transactions');
      const savedGoals = localStorage.getItem('finance-spending-goals');
      
      // Se não houver dados no localStorage, não há nada para migrar
      if (!savedTransactions && !savedGoals) return;
      
      // Verificar se o usuário já tem dados no Supabase
      const { count, error } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Erro ao verificar dados existentes:', error);
        return;
      }
      
      // Se já existem dados no Supabase, não migrar
      if (count && count > 0) return;
      
      // Migrar transações
      if (savedTransactions) {
        try {
          const parsed = JSON.parse(savedTransactions);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Preparar transações para inserção no Supabase
            const supabaseTransactions = parsed.map((t: any) => ({
              id: t.id,
              user_id: user.id,
              description: t.description,
              amount: t.amount,
              date: new Date(t.date).toISOString(),
              type: t.type,
              category: t.category,
              payment_method: t.paymentMethod,
              installments: t.installments,
              current_installment: t.currentInstallment
            }));
            
            // Inserir transações
            const { error: insertError } = await supabase
              .from('transactions')
              .insert(supabaseTransactions);
              
            if (insertError) {
              console.error('Erro ao migrar transações:', insertError);
            } else {
              // Preparar parcelas futuras para inserção
              const futureInstallments: any[] = [];
              
              parsed.forEach((t: any) => {
                if (t.futureInstallments && Array.isArray(t.futureInstallments)) {
                  t.futureInstallments.forEach((fi: any) => {
                    futureInstallments.push({
                      id: fi.id,
                      transaction_id: fi.transactionId,
                      month: fi.month,
                      amount: fi.amount,
                      installment_number: fi.installmentNumber
                    });
                  });
                }
              });
              
              // Inserir parcelas futuras se houver
              if (futureInstallments.length > 0) {
                const { error: fiError } = await supabase
                  .from('future_installments')
                  .insert(futureInstallments);
                  
                if (fiError) {
                  console.error('Erro ao migrar parcelas futuras:', fiError);
                }
              }
            }
          }
        } catch (error) {
          console.error('Erro ao processar transações do localStorage:', error);
        }
      }
      
      // Migrar metas de gastos
      if (savedGoals) {
        try {
          const parsed = JSON.parse(savedGoals);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Preparar metas para inserção no Supabase
            const supabaseGoals = parsed.map((g: any) => ({
              id: g.id,
              user_id: user.id,
              category: g.category,
              amount: g.amount,
              period: g.period,
              start_date: new Date(g.startDate).toISOString(),
              end_date: g.endDate ? new Date(g.endDate).toISOString() : null
            }));
            
            // Inserir metas
            const { error: insertError } = await supabase
              .from('spending_goals')
              .insert(supabaseGoals);
              
            if (insertError) {
              console.error('Erro ao migrar metas de gastos:', insertError);
            }
          }
        } catch (error) {
          console.error('Erro ao processar metas do localStorage:', error);
        }
      }
      
      // Após a migração, notificar o usuário
      toast({
        title: 'Dados migrados com sucesso',
        description: 'Seus dados foram sincronizados com a nuvem.',
      });
    }
    
    migrateFromLocalStorage();
  }, [user]);

  // Função para adicionar uma transação
  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) return;
    
    // Criar objeto de transação com parcelas futuras se necessário
    const newTransaction = createFutureInstallments(transaction);
    
    try {
      // Inserir transação no Supabase
      const { error } = await supabase
        .from('transactions')
        .insert({
          id: newTransaction.id,
          user_id: user.id,
          description: newTransaction.description,
          amount: newTransaction.amount,
          date: new Date(newTransaction.date).toISOString(),
          type: newTransaction.type,
          category: newTransaction.category,
          payment_method: newTransaction.paymentMethod,
          installments: newTransaction.installments,
          current_installment: newTransaction.currentInstallment
        });
        
      if (error) throw error;
      
      // Se houver parcelas futuras, inseri-las
      if (newTransaction.futureInstallments && newTransaction.futureInstallments.length > 0) {
        const { error: fiError } = await supabase
          .from('future_installments')
          .insert(newTransaction.futureInstallments.map(fi => ({
            id: fi.id,
            transaction_id: fi.transactionId,
            month: fi.month,
            amount: fi.amount,
            installment_number: fi.installmentNumber
          })));
          
        if (fiError) throw fiError;
      }
      
      // Atualizar estado local
      setTransactions(prev => [...prev, newTransaction]);
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível adicionar a transação.',
        variant: 'destructive'
      });
    }
  };

  // Função para atualizar uma transação
  const updateTransaction = async (id: string, updatedFields: Partial<Transaction>) => {
    if (!user) return;
    
    try {
      // Converter campos para formato do Supabase
      const supabaseFields: Record<string, any> = {};
      
      if (updatedFields.description) supabaseFields.description = updatedFields.description;
      if (updatedFields.amount !== undefined) supabaseFields.amount = updatedFields.amount;
      if (updatedFields.date) supabaseFields.date = new Date(updatedFields.date).toISOString();
      if (updatedFields.type) supabaseFields.type = updatedFields.type;
      if (updatedFields.category) supabaseFields.category = updatedFields.category;
      if (updatedFields.paymentMethod) supabaseFields.payment_method = updatedFields.paymentMethod;
      if (updatedFields.installments) supabaseFields.installments = updatedFields.installments;
      if (updatedFields.currentInstallment) supabaseFields.current_installment = updatedFields.currentInstallment;
      
      // Atualizar no Supabase
      const { error } = await supabase
        .from('transactions')
        .update(supabaseFields)
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Atualizar estado local
      setTransactions(prev => 
        prev.map(transaction => 
          transaction.id === id ? { ...transaction, ...updatedFields } : transaction
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar a transação.',
        variant: 'destructive'
      });
    }
  };

  // Função para excluir uma transação
  const deleteTransaction = async (id: string) => {
    if (!user) return;
    
    try {
      // Excluir do Supabase
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Atualizar estado local
      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir a transação.',
        variant: 'destructive'
      });
    }
  };

  // Função para adicionar uma meta de gastos
  const addSpendingGoal = async (goal: Omit<SpendingGoal, 'id'>) => {
    if (!user) return;
    
    const newGoal = { id: generateId(), ...goal };
    
    try {
      // Inserir meta no Supabase
      const { error } = await supabase
        .from('spending_goals')
        .insert({
          id: newGoal.id,
          user_id: user.id,
          category: newGoal.category,
          amount: newGoal.amount,
          period: newGoal.period,
          start_date: new Date(newGoal.startDate).toISOString(),
          end_date: newGoal.endDate ? new Date(newGoal.endDate).toISOString() : null
        });
        
      if (error) throw error;
      
      // Atualizar estado local
      setSpendingGoals(prev => [...prev, newGoal]);
    } catch (error) {
      console.error('Erro ao adicionar meta:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível adicionar a meta de gastos.',
        variant: 'destructive'
      });
    }
  };

  // Função para atualizar uma meta de gastos
  const updateSpendingGoal = async (id: string, updatedFields: Partial<SpendingGoal>) => {
    if (!user) return;
    
    try {
      // Converter campos para formato do Supabase
      const supabaseFields: Record<string, any> = {};
      
      if (updatedFields.category) supabaseFields.category = updatedFields.category;
      if (updatedFields.amount !== undefined) supabaseFields.amount = updatedFields.amount;
      if (updatedFields.period) supabaseFields.period = updatedFields.period;
      if (updatedFields.startDate) supabaseFields.start_date = new Date(updatedFields.startDate).toISOString();
      if (updatedFields.endDate) supabaseFields.end_date = new Date(updatedFields.endDate).toISOString();
      
      // Atualizar no Supabase
      const { error } = await supabase
        .from('spending_goals')
        .update(supabaseFields)
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Atualizar estado local
      setSpendingGoals(prev => 
        prev.map(goal => 
          goal.id === id ? { ...goal, ...updatedFields } : goal
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar a meta de gastos.',
        variant: 'destructive'
      });
    }
  };

  // Função para excluir uma meta de gastos
  const deleteSpendingGoal = async (id: string) => {
    if (!user) return;
    
    try {
      // Excluir do Supabase
      const { error } = await supabase
        .from('spending_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Atualizar estado local
      setSpendingGoals(prev => prev.filter(goal => goal.id !== id));
    } catch (error) {
      console.error('Erro ao excluir meta:', error);
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir a meta de gastos.',
        variant: 'destructive'
      });
    }
  };

  // Função para adicionar uma categoria
  const addCategory = async (category: string) => {
    if (!categories.includes(category)) {
      try {
        // Verificar se a categoria já existe no banco
        const { data, error: checkError } = await supabase
          .from('categories')
          .select('name')
          .eq('name', category)
          .maybeSingle();
          
        if (checkError) throw checkError;
        
        // Se a categoria não existir, inserir
        if (!data) {
          const { error } = await supabase
            .from('categories')
            .insert({
              name: category,
              user_id: user?.id || null // Pode ser uma categoria global ou do usuário
            });
            
          if (error) throw error;
        }
        
        // Atualizar estado local
        setCategories(prev => [...prev, category]);
      } catch (error) {
        console.error('Erro ao adicionar categoria:', error);
      }
    }
  };

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

  // Funções restantes - mesma funcionalidade, porém usando o estado atualizado
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
    isLoading,
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
