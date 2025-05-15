
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { useFinance, SpendingGoal } from '@/context/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { PiggyBank, Plus, Target } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

type FormData = Omit<SpendingGoal, 'id'>;

export function SpendingGoalsForm() {
  const { categories, spendingGoals, addSpendingGoal, deleteSpendingGoal, getGoalProgress } = useFinance();
  const [open, setOpen] = useState(false);
  
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      period: 'monthly',
      amount: 0,
      startDate: new Date(),
    }
  });

  const onSubmit = (data: FormData) => {
    // Save the goal
    addSpendingGoal(data);
    
    // Show success message
    toast({
      title: "Meta adicionada",
      description: `Meta para ${data.category} foi adicionada com sucesso.`,
    });
    
    // Reset form and close dialog
    reset();
    setOpen(false);
  };
  
  // Function to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Function to delete a goal
  const handleDelete = (goalId: string) => {
    deleteSpendingGoal(goalId);
    toast({
      title: "Meta excluída",
      description: "A meta foi excluída com sucesso.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Metas de Gastos</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button 
              className="rounded-md flex items-center shadow-sm transition-all hover:shadow"
              style={{ 
                background: 'linear-gradient(45deg, #3B82F6, #2563EB)'
              }}
            >
              <Plus size={18} className="mr-1" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-lg">
            <DialogHeader className="px-6 pt-6">
              <DialogTitle className="text-xl">Criar Nova Meta de Gastos</DialogTitle>
              <DialogDescription>
                Defina um limite de gastos para uma categoria específica.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 pb-6">
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    onValueChange={(value) => setValue('category', value)}
                  >
                    <SelectTrigger className="rounded-md">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-xs text-red-500">Categoria é obrigatória</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor Limite (R$)</Label>
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
                  <Label htmlFor="period">Período</Label>
                  <Select 
                    defaultValue="monthly"
                    onValueChange={(value) => setValue('period', value as 'monthly' | 'yearly')}
                  >
                    <SelectTrigger className="rounded-md">
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              
                <input type="hidden" {...register('startDate')} value={format(new Date(), 'yyyy-MM-dd')} />
              </div>
              
              <DialogFooter className="pt-4 mt-4 border-t">
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
                  Salvar Meta
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {spendingGoals.length === 0 ? (
        <div className="text-center p-10 bg-gray-50 rounded-lg border border-gray-100">
          <PiggyBank className="mx-auto h-12 w-12 text-blue-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma meta definida</h3>
          <p className="text-muted-foreground mb-4">
            Adicione metas de gastos para controlar melhor suas finanças.
          </p>
          <Button 
            onClick={() => setOpen(true)}
            className="rounded-md shadow-sm"
            style={{ 
              background: 'linear-gradient(45deg, #3B82F6, #2563EB)'
            }}
          >
            Adicionar Meta
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {spendingGoals.map((goal) => {
            const progress = getGoalProgress(goal.id);
            
            return (
              <Card key={goal.id} className="border overflow-hidden transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <Target size={16} className="mr-2 text-blue-500" />
                      {goal.category}
                    </CardTitle>
                    <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                      {goal.period === 'monthly' ? 'Mensal' : 'Anual'}
                    </span>
                  </div>
                  <CardDescription>
                    Meta de Gastos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2 text-gray-800">{formatCurrency(goal.amount)}</div>
                  <Progress 
                    value={progress} 
                    className="h-2 mb-2"
                    style={{
                      backgroundColor: '#e2e8f0',
                      backgroundImage: `linear-gradient(to right, ${progress > 80 ? '#ef4444' : progress > 60 ? '#f59e0b' : '#3b82f6'}, ${progress > 80 ? '#f87171' : progress > 60 ? '#fbbf24' : '#60a5fa'})`,
                    }}
                  />
                  <div className="text-sm text-muted-foreground">
                    {progress.toFixed(0)}% utilizado
                  </div>
                </CardContent>
                <CardFooter className="pt-0 justify-end border-t p-4 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(goal.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md"
                  >
                    Excluir
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
