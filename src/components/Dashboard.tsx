
import { useFinance } from '@/context/FinanceContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowDown, ArrowUp, CreditCard, DollarSign, PiggyBank, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';

export function Dashboard() {
  const {
    currentMonth,
    getTotalIncome,
    getTotalExpense,
    getMonthlyTotals,
    categories,
    getCategoryTotal,
    spendingGoals,
    getGoalProgress,
  } = useFinance();

  // Format for display
  const formattedMonth = format(new Date(currentMonth + '-01'), "MMMM 'de' yyyy", { locale: ptBR });
  
  // Calculate monthly income and expense
  const income = getTotalIncome(currentMonth);
  const expense = getTotalExpense(currentMonth);
  const balance = income - expense;
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  // Get data for charts
  const monthlyTotals = getMonthlyTotals(6);
  const chartData = monthlyTotals.map(item => ({
    month: format(new Date(item.month + '-01'), 'MMM', { locale: ptBR }),
    receita: item.income,
    despesa: item.expense,
  }));
  
  // Get category data for the current month
  const categoryData = categories.map(category => ({
    name: category,
    value: getCategoryTotal(category, currentMonth),
  })).filter(item => item.value > 0).sort((a, b) => b.value - a.value);
  
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">{formattedMonth}</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-green-600">
              <ArrowUp className="mr-2 h-4 w-4" />
              Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(income)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center text-red-600">
              <ArrowDown className="mr-2 h-4 w-4" />
              Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(expense)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="mr-2 h-4 w-4" />
              Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(balance)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Histórico Mensal</CardTitle>
            <CardDescription>Receitas e despesas dos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="receita" 
                  stroke="#10B981" 
                  activeDot={{ r: 8 }} 
                  name="Receita" 
                />
                <Line 
                  type="monotone" 
                  dataKey="despesa" 
                  stroke="#EF4444" 
                  name="Despesa" 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Category Breakdown */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
            <CardDescription>Distribuição de gastos no mês atual</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={60}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar 
                  dataKey="value" 
                  fill="#8B5CF6" 
                  name="Valor"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Goals Section */}
      {spendingGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-finance-amber" />
              Metas de Gastos
            </CardTitle>
            <CardDescription>
              Acompanhe o progresso das suas metas de gastos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {spendingGoals.map((goal) => {
                const progress = getGoalProgress(goal.id);
                const spent = getCategoryTotal(goal.category, currentMonth);
                const isOverBudget = spent > goal.amount;
                
                return (
                  <div key={goal.id} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{goal.category}</div>
                      <div className={`text-sm ${isOverBudget ? 'text-red-500 font-medium' : ''}`}>
                        {formatCurrency(spent)} / {formatCurrency(goal.amount)}
                        {isOverBudget && ' (Excedido)'}
                      </div>
                    </div>
                    <Progress 
                      value={progress} 
                      className={isOverBudget ? 'bg-red-100' : undefined}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Credit Card Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5 text-finance-blue" />
            Compras Parceladas
          </CardTitle>
          <CardDescription>
            Pagamentos futuros do cartão de crédito
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Próximos 3 meses</th>
                  <th className="text-right py-2 font-medium">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2].map((monthOffset) => {
                  const date = new Date(currentMonth + '-01');
                  date.setMonth(date.getMonth() + monthOffset);
                  const monthKey = format(date, 'yyyy-MM');
                  const monthName = format(date, 'MMMM', { locale: ptBR });
                  
                  // Get credit card installments for this month
                  const installments = getTotalExpense(monthKey);
                  
                  return (
                    <tr key={monthKey} className="border-b last:border-0">
                      <td className="py-3 text-left capitalize">{monthName}</td>
                      <td className="py-3 text-right font-medium">
                        {formatCurrency(installments)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
