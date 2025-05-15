
import { useState } from 'react';
import { useFinance, Transaction } from '@/context/FinanceContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CreditCard, Trash2, ArrowUp, ArrowDown, Search, Filter } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
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
  const [searchTerm, setSearchTerm] = useState<string>('');
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
  
  // Filter transactions based on selected filters and search term
  const filteredTransactions = transactions.filter(transaction => {
    if (categoryFilter !== 'all' && transaction.category !== categoryFilter) {
      return false;
    }
    if (typeFilter !== 'all' && transaction.type !== typeFilter) {
      return false;
    }
    if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) {
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
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">Transações</CardTitle>
          <CardDescription>Gerenciar transações do mês atual</CardDescription>
          
          {/* Search and Filters */}
          <div className="mt-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Pesquisar transações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-md"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter size={16} className="text-gray-500" />
                <span className="text-sm text-gray-600">Filtros:</span>
              </div>
              
              <Select 
                value={categoryFilter} 
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-full sm:w-[180px] rounded-md">
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
                <SelectTrigger className="w-full sm:w-[180px] rounded-md">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Tipos</SelectItem>
                  <SelectItem value="income">Receitas</SelectItem>
                  <SelectItem value="expense">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-4">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <div className="flex justify-center mb-4">
                <Search size={32} className="text-gray-300" />
              </div>
              <p className="text-muted-foreground">
                Nenhuma transação encontrada.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm || categoryFilter !== 'all' || typeFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca.' 
                  : 'Adicione transações usando o botão + no canto inferior direito.'}
              </p>
            </div>
          ) : (
            <div className="space-y-1 max-h-[500px] overflow-y-auto finance-scrollbar">
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
                    className="flex justify-between items-start p-4 border-b hover:bg-gray-50 transition-colors rounded-md"
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
                        <div className="font-medium text-gray-800">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-1">
                          <span>{formattedDate}</span>
                          <span className="inline-block w-1 h-1 rounded-full bg-gray-300"></span>
                          <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                            {transaction.category}
                          </span>
                          
                          {transaction.paymentMethod === 'credit' && (
                            <span className="flex items-center text-xs ml-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                              <CreditCard size={12} className="mr-1" />
                              Crédito{installmentText}
                            </span>
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
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                );
              })}
              
              {/* Credit Card Installments Section */}
              {installments.length > 0 && typeFilter !== 'income' && (
                <div className="pt-4 mt-6 border-t">
                  <h3 className="font-medium mb-3 flex items-center px-4">
                    <CreditCard size={16} className="mr-2 text-blue-500" />
                    Parcelas do Cartão de Crédito
                  </h3>
                  
                  <div className="bg-blue-50 rounded-lg p-2">
                    {installments.map(installment => {
                      // Find original transaction
                      const originalTransaction = transactions.find(t => t.id === installment.transactionId);
                      
                      // Skip if transaction type doesn't match filter
                      if (originalTransaction && originalTransaction.type === 'expense' && 
                          (categoryFilter === 'all' || originalTransaction.category === categoryFilter)) {
                        return (
                          <div 
                            key={installment.id}
                            className="flex justify-between items-start py-3 px-2 border-b last:border-0 hover:bg-blue-100/50 rounded-md transition-colors"
                          >
                            <div>
                              <div className="font-medium text-gray-800">{originalTransaction.description}</div>
                              <div className="text-xs text-gray-600 flex items-center">
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full mr-2">
                                  {originalTransaction.category}
                                </span>
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
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-lg">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setConfirmDelete(null)} 
              className="rounded-md"
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              className="rounded-md"
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
