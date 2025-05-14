
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
import { PiggyBank } from 'lucide-react';
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
        <h2 className="text-2xl font-bold">Metas de Gastos</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Nova Meta</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Meta de Gastos</DialogTitle>
              <DialogDescription>
                Defina um limite de gastos para uma categoria específica.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  onValueChange={(value) => setValue('category', value)}
                >
                  <SelectTrigger>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <input type="hidden" {...register('startDate')} value={format(new Date(), 'yyyy-MM-dd')} />
              
              <DialogFooter>
                <Button type="submit">Salvar Meta</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {spendingGoals.length === 0 ? (
        <div className="text-center p-10 bg-muted rounded-lg">
          <PiggyBank className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma meta definida</h3>
          <p className="text-muted-foreground mb-4">
            Adicione metas de gastos para controlar melhor suas finanças.
          </p>
          <Button onClick={() => setOpen(true)}>Adicionar Meta</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {spendingGoals.map((goal) => {
            const progress = getGoalProgress(goal.id);
            
            return (
              <Card key={goal.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{goal.category}</CardTitle>
                  <CardDescription>
                    Meta {goal.period === 'monthly' ? 'Mensal' : 'Anual'} de Gastos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">{formatCurrency(goal.amount)}</div>
                  <Progress value={progress} className="h-2 mb-2" />
                  <div className="text-sm text-muted-foreground">
                    {progress.toFixed(0)}% utilizado
                  </div>
                </CardContent>
                <CardFooter className="pt-0 justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(goal.id)}
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
