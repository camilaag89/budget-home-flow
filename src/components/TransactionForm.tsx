
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { useFinance, Transaction, TransactionType, PaymentMethod } from '@/context/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CalendarIcon, Plus, CreditCard, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

type FormData = Omit<Transaction, 'id'>;

export function TransactionForm() {
  const { categories, addTransaction, addCategory } = useFinance();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      type: 'expense',
      paymentMethod: 'debit',
      date: new Date(),
      amount: 0,
      installments: 1,
    }
  });
  
  const transactionType = watch('type');
  const paymentMethod = watch('paymentMethod');
  const selectedCategory = watch('category');

  const onSubmit = (data: FormData) => {
    // Ensure date is set
    data.date = date || new Date();
    
    // Ensure category is valid
    if (!data.category && !showNewCategory) {
      toast({
        title: "Erro na transação",
        description: "Selecione uma categoria ou crie uma nova.",
        variant: "destructive"
      });
      return;
    }
    
    // If adding a new category, save it first
    if (showNewCategory && newCategory.trim()) {
      addCategory(newCategory.trim());
      data.category = newCategory.trim();
    }
    
    // Save the transaction
    addTransaction(data);
    
    // Show success message
    toast({
      title: "Transação adicionada",
      description: `${data.description} foi adicionada com sucesso.`,
    });
    
    // Reset form and close dialog
    reset();
    setDate(new Date());
    setNewCategory('');
    setShowNewCategory(false);
    setOpen(false);
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setValue('category', newCategory.trim());
      setNewCategory('');
      setShowNewCategory(false);
      
      toast({
        title: "Categoria adicionada",
        description: `A categoria ${newCategory.trim()} foi adicionada com sucesso.`,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all hover:scale-105" 
          style={{ 
            background: 'linear-gradient(45deg, #3B82F6, #2563EB)', 
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.5)'
          }}
        >
          <Plus size={24} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-lg shadow-xl">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl">Nova Transação</DialogTitle>
          <DialogDescription>
            Adicione uma nova transação ao seu controle financeiro.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6">
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div 
                className={`flex flex-col items-center justify-center p-4 rounded-lg border cursor-pointer transition-all ${
                  transactionType === 'income' 
                    ? 'bg-green-50 border-green-300 shadow-sm' 
                    : 'bg-white hover:bg-gray-50'
                }`}
                onClick={() => setValue('type', 'income')}
              >
                <ArrowUpCircle 
                  size={28} 
                  className={`${transactionType === 'income' ? 'text-green-600' : 'text-gray-400'} mb-2`} 
                />
                <span className={`text-sm font-medium ${transactionType === 'income' ? 'text-green-800' : 'text-gray-500'}`}>
                  Receita
                </span>
              </div>
              
              <div 
                className={`flex flex-col items-center justify-center p-4 rounded-lg border cursor-pointer transition-all ${
                  transactionType === 'expense' 
                    ? 'bg-red-50 border-red-300 shadow-sm' 
                    : 'bg-white hover:bg-gray-50'
                }`}
                onClick={() => setValue('type', 'expense')}
              >
                <ArrowDownCircle 
                  size={28} 
                  className={`${transactionType === 'expense' ? 'text-red-600' : 'text-gray-400'} mb-2`} 
                />
                <span className={`text-sm font-medium ${transactionType === 'expense' ? 'text-red-800' : 'text-gray-500'}`}>
                  Despesa
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input 
                id="description" 
                placeholder="Ex: Supermercado"
                className="rounded-md"
                {...register('description', { required: true })}
              />
              {errors.description && <p className="text-xs text-red-500">Descrição é obrigatória</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input 
                  id="amount" 
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  className="rounded-md"
                  {...register('amount', { required: true, min: 0.01, valueAsNumber: true })}
                />
                {errors.amount && <p className="text-xs text-red-500">Valor válido é obrigatório</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal rounded-md",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(newDate) => {
                        setDate(newDate);
                        if (newDate) {
                          setValue('date', newDate);
                        }
                      }}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Método de Pagamento</Label>
                <Select 
                  defaultValue="debit"
                  onValueChange={(value) => setValue('paymentMethod', value as PaymentMethod)}
                >
                  <SelectTrigger className="rounded-md">
                    <SelectValue placeholder="Selecione o método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">Cartão de Crédito</SelectItem>
                    <SelectItem value="debit">Débito</SelectItem>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                    <SelectItem value="transfer">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {paymentMethod === 'credit' && transactionType === 'expense' && (
                <div className="space-y-2">
                  <Label htmlFor="installments">Parcelas</Label>
                  <Input 
                    id="installments" 
                    type="number"
                    min="1"
                    placeholder="1"
                    className="rounded-md"
                    {...register('installments', { valueAsNumber: true, min: 1 })}
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="category">Categoria</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowNewCategory(!showNewCategory)}
                  className="text-xs h-6 hover:text-primary"
                >
                  {showNewCategory ? 'Usar categoria existente' : 'Nova categoria'}
                </Button>
              </div>
              
              {showNewCategory ? (
                <div className="flex space-x-2">
                  <Input 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Nova categoria"
                    className="rounded-md"
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddCategory} 
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    Adicionar
                  </Button>
                </div>
              ) : (
                <Select
                  value={selectedCategory || undefined}
                  onValueChange={(value) => setValue('category', value)}
                >
                  <SelectTrigger className="rounded-md">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        Nenhuma categoria disponível
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
              {errors.category && !showNewCategory && <p className="text-xs text-red-500">Categoria é obrigatória</p>}
            </div>
          </div>
          
          <DialogFooter className="mt-8 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="rounded-md"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="rounded-md"
              style={{ 
                background: 'linear-gradient(45deg, #3B82F6, #2563EB)'
              }}
            >
              Salvar Transação
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
