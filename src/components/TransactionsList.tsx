
import { useState } from 'react';
import { useFinance, Transaction } from '@/context/FinanceContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CreditCard, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

export function TransactionsList() {
  const { 
    currentMonth, 
    categories, 
    getMonthlyTransactions, 
    deleteTransaction,
    getFutureInstallments
  } = useFinance();
  
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [confirmDelete, setConfirmDelete] = useState<Transaction | null>(null);
  
  // Get transactions for the current month
  const transactions = getMonthlyTransactions(currentMonth);
  
  // Get installments for credit card payments due this month
  const installments = getFutureInstallments(currentMonth);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  // Filter transactions based on selected filters
  const filteredTransactions = transactions.filter(transaction => {
    if (categoryFilter !== 'all' && transaction.category !== categoryFilter) {
      return false;
    }
    if (typeFilter !== 'all' && transaction.type !== typeFilter) {
      return false;
    }
    return true;
  });
  
  // Handle transaction deletion
  const handleDelete = () => {
    if (confirmDelete) {
      deleteTransaction(confirmDelete.id);
      toast({
        title: "Transação excluída",
        description: `${confirmDelete.description} foi excluída com sucesso.`,
      });
      setConfirmDelete(null);
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Transações</CardTitle>
          <CardDescription>Gerenciar transações do mês atual</CardDescription>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <Select 
              value={categoryFilter} 
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={typeFilter} 
              onValueChange={setTypeFilter}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Tipos</SelectItem>
                <SelectItem value="income">Receitas</SelectItem>
                <SelectItem value="expense">Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Nenhuma transação encontrada.
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto finance-scrollbar">
              {filteredTransactions.map(transaction => {
                // Format date
                const transactionDate = new Date(transaction.date);
                const formattedDate = format(transactionDate, "dd 'de' MMMM", { locale: ptBR });
                
                // Get installment info if applicable
                let installmentText = '';
                if (transaction.installments && transaction.installments > 1) {
                  installmentText = ` (${transaction.currentInstallment}/${transaction.installments})`;
                }
                
                return (
                  <div 
                    key={transaction.id}
                    className="flex justify-between items-start border-b pb-4"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`rounded-full p-2 ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'income' 
                          ? <ArrowUp size={20} /> 
                          : <ArrowDown size={20} />
                        }
                      </div>
                      
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {formattedDate}
                          <span className="mx-1">•</span>
                          {transaction.category}
                          
                          {transaction.paymentMethod === 'credit' && (
                            <>
                              <span className="mx-1">•</span>
                              <span className="flex items-center text-xs">
                                <CreditCard size={12} className="mr-1" />
                                Crédito{installmentText}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className={`font-medium ${
                        transaction.type === 'income' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'} 
                        {formatCurrency(transaction.amount)}
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setConfirmDelete(transaction)}
                      >
                        <Trash2 size={16} className="text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              
              {/* Credit Card Installments Section */}
              {installments.length > 0 && typeFilter !== 'income' && (
                <div className="pt-4 mt-6 border-t">
                  <h3 className="font-medium mb-2 flex items-center">
                    <CreditCard size={16} className="mr-2" />
                    Parcelas do Cartão de Crédito
                  </h3>
                  
                  {installments.map(installment => {
                    // Find original transaction
                    const originalTransaction = transactions.find(t => t.id === installment.transactionId);
                    
                    // Skip if transaction type doesn't match filter
                    if (originalTransaction && originalTransaction.type === 'expense' && 
                        (categoryFilter === 'all' || originalTransaction.category === categoryFilter)) {
                      return (
                        <div 
                          key={installment.id}
                          className="flex justify-between items-start py-2 border-b last:border-0"
                        >
                          <div>
                            <div className="font-medium">{originalTransaction.description}</div>
                            <div className="text-xs text-muted-foreground">
                              {originalTransaction.category}
                              <span className="mx-1">•</span>
                              Parcela {installment.installmentNumber}/{originalTransaction.installments}
                            </div>
                          </div>
                          
                          <div className="text-red-600 font-medium">
                            - {formatCurrency(installment.amount)}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
